"""
Gera um dashboard HTML (autocontido, sem dependencias externas) a partir dos
relatorios brutos que o cypress-mochawesome-reporter grava por spec em
cypress/reports/mochawesome/.jsons/*.json.

Nao depende do merge automatico do reporter (mochawesome-merge / after:run):
aquele passo so roda uma vez, no final de um "cypress run" completo, e fica
orfao se a suite for interrompida ou rodada spec a spec via "cypress open" -
exatamente o cenario observado neste projeto. Este script le os .json crus
diretamente, que ja sao gravados de forma confiavel a cada spec (after:spec),
e agrega o resultado por conta propria.

Cobre UI e API (cypress/e2e/ui e cypress/e2e/api rodam pela mesma config e
gravam no mesmo diretorio de relatorio). Quando uma feature foi executada
mais de uma vez (reprocessamento manual, iteracao de debug), mantem apenas a
execucao mais recente por spec.

O dashboard tambem compara com a execucao anterior: antes de sobrescrever o
arquivo, le um resumo compacto (json) embutido no dashboard.html antigo
(tag <script id="dashboard-snapshot">), calcula a diferenca e mostra um
indicador (resumo geral + por feature). Depois grava o resumo da execucao
atual no arquivo novo, pra servir de base da proxima comparacao. So compara
com a ultima execucao — nao ha grafico de tendencia com varias execucoes.

O dashboard tambem mostra o PR do GitHub associado a branch atual (numero,
titulo, status de revisao), via chamada direta a API REST publica do GitHub
(sem token, sem "gh" CLI — so funciona porque o repositorio e publico).
Totalmente opcional: sem internet, sem PR pra branch atual, ou se o repo
virar privado, essa secao e omitida e o resto do dashboard e gerado
normalmente. So reflete o PR da execucao atual — nao ha historico de PRs
anteriores (o script sempre mantem so a ultima execucao de cada spec, ver
acima).

Uso:
    python scripts/gerar_dashboard_html.py

Saida:
    cypress/reports/mochawesome/dashboard.html
"""

import hashlib
import html
import json
import re
import subprocess
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

VERSAO_SCRIPT = "1.1.0"

BASE_DIR = Path(__file__).resolve().parent.parent
JSONS_DIR = BASE_DIR / "cypress" / "reports" / "mochawesome" / ".jsons"
SCREENSHOTS_DIR = BASE_DIR / "cypress" / "screenshots"
OUTPUT_PATH = BASE_DIR / "cypress" / "reports" / "mochawesome" / "dashboard.html"
CONFIG_PATH = BASE_DIR / "dashboard.config.json"

CONFIG_PADRAO = {
    "titulo": "Dashboard de Automação",
}


def carregar_config() -> dict:
    """Config por projeto (titulo/branding), versionada no repositorio junto
    do script para que outro projeto so precise trocar este JSON — sem editar
    codigo — ao reaproveitar o gerador. Ausente ou invalido cai no padrao
    generico, entao o script funciona mesmo em projeto sem esse arquivo."""
    if not CONFIG_PATH.is_file():
        return dict(CONFIG_PADRAO)
    try:
        dados = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return dict(CONFIG_PADRAO)
    return {**CONFIG_PADRAO, **dados}

ROTULO_ESTADO_PR = {
    "OPEN": "Aberto",
    "MERGED": "Mesclado",
    "CLOSED": "Fechado",
}
ROTULO_REVISAO_PR = {
    "APPROVED": "Aprovado",
    "CHANGES_REQUESTED": "Alterações solicitadas",
    "REVIEW_REQUIRED": "Revisão pendente",
}

CORES_ESTADO = {
    "passed": "#2E7D32",
    "failed": "#C62828",
    "pending": "#B8860B",
}
ROTULO_ESTADO = {"passed": "Passou", "failed": "Falhou", "pending": "Pendente"}


@dataclass
class Cenario:
    titulo: str
    estado: str  # passed | failed | pending
    duracao_ms: int = 0
    erro: str | None = None  # so para estado == "failed"


@dataclass
class Feature:
    spec_relativo: str  # ex.: "ui/atos_novos.feature"
    sistema: str  # "UI" ou "API"
    nome: str
    executado_em: datetime
    cenarios: list[Cenario] = field(default_factory=list)

    @property
    def total(self) -> int:
        return len(self.cenarios)

    @property
    def passou(self) -> int:
        return sum(1 for c in self.cenarios if c.estado == "passed")

    @property
    def falhou(self) -> int:
        return sum(1 for c in self.cenarios if c.estado == "failed")

    @property
    def pendente(self) -> int:
        return sum(1 for c in self.cenarios if c.estado == "pending")

    @property
    def pct_sucesso(self) -> float:
        return (self.passou / self.total * 100) if self.total else 0.0

    @property
    def duracao_ms(self) -> int:
        return sum(c.duracao_ms for c in self.cenarios)


def _formatar_duracao(ms: int) -> str:
    segundos = ms / 1000
    if segundos < 60:
        return f"{segundos:.1f}s"
    minutos, resto = divmod(segundos, 60)
    return f"{minutos:.0f}m {resto:.0f}s"


def _flatten_testes(suite: dict) -> list[Cenario]:
    cenarios = [
        Cenario(
            t["title"],
            t["state"] or "pending",
            duracao_ms=t.get("duration") or 0,
            erro=((t.get("err") or {}).get("message") or None) if t["state"] == "failed" else None,
        )
        for t in suite.get("tests", [])
    ]
    for sub in suite.get("suites", []):
        cenarios += _flatten_testes(sub)
    return cenarios


def _nome_feature(suite_raiz: dict, spec_stem: str) -> str:
    # O titulo da suite de nivel 0 e a linha "Funcionalidade:" do .feature;
    # cai no nome do arquivo so se a feature nao tiver suite (spec vazio).
    if suite_raiz and suite_raiz.get("title"):
        return suite_raiz["title"]
    return spec_stem


def _spec_relativo(file_bruto: str) -> str:
    partes = Path(file_bruto.replace("\\", "/")).parts
    if "e2e" in partes:
        return "/".join(partes[partes.index("e2e") + 1 :])
    return file_bruto


def _sistema(spec_relativo: str) -> str:
    return "API" if spec_relativo.startswith("api/") else "UI"


def carregar_features() -> list[Feature]:
    mais_recentes: dict[str, Feature] = {}

    for path in sorted(JSONS_DIR.glob("*.json")):
        dados = json.loads(path.read_text(encoding="utf-8"))
        inicio = datetime.fromisoformat(dados["stats"]["start"].replace("Z", "+00:00"))

        for resultado in dados.get("results", []):
            spec_relativo = _spec_relativo(resultado.get("file", ""))
            if not spec_relativo:
                continue

            existente = mais_recentes.get(spec_relativo)
            if existente and existente.executado_em >= inicio:
                continue  # ja temos uma execucao mais nova deste spec

            suite_raiz = resultado.get("suites", [{}])[0] if resultado.get("suites") else {}
            cenarios = _flatten_testes(resultado)
            if not cenarios:
                continue  # spec sem cenarios (ex.: stub) nao entra no dashboard

            mais_recentes[spec_relativo] = Feature(
                spec_relativo=spec_relativo,
                sistema=_sistema(spec_relativo),
                nome=_nome_feature(suite_raiz, Path(spec_relativo).stem),
                executado_em=inicio,
                cenarios=cenarios,
            )

    return sorted(mais_recentes.values(), key=lambda f: (f.sistema, f.nome))


def _git_saida(*args: str) -> str | None:
    try:
        # encoding="utf-8" explicito: no Windows o default do subprocess em
        # modo texto e o codepage do locale (ex.: cp1252), que quebra ao
        # decodificar saida do git com acentuacao (UTF-8) — ver mesmo motivo
        # em _historico_execucoes. errors="replace" evita crash mesmo se
        # algum byte realmente invalido aparecer (essa integracao e opcional,
        # nunca deve derrubar a geracao do dashboard).
        resultado = subprocess.run(
            ["git", *args], cwd=BASE_DIR, capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=5,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    if resultado.returncode != 0:
        return None
    return resultado.stdout.strip() or None


def _owner_repo_github() -> str | None:
    """"owner/repo" a partir do remote "origin", aceitando URL HTTPS ou SSH."""
    url = _git_saida("remote", "get-url", "origin")
    if not url:
        return None
    match = re.search(r"github\.com[:/]([^/]+/[^/]+?)(\.git)?$", url)
    return match.group(1) if match else None


def _api_github(caminho: str) -> list | dict | None:
    """GET na API REST publica do GitHub (sem autenticacao — so funciona pra
    repositorio publico; ver comentario em obter_info_pr). Falha silenciosa
    em qualquer erro de rede/HTTP: essa integracao e so um extra opcional.
    """
    req = urllib.request.Request(
        f"https://api.github.com{caminho}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "signa-dashboard-script",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError):
        return None


def _decisao_revisao(reviews: list[dict]) -> str | None:
    """Ultimo estado de revisao por pessoa (ignora COMMENTED); se alguem
    pediu mudancas e nao houve revisao mais nova aprovando por cima, isso
    prevalece — mesma logica que o GitHub usa pra "reviewDecision".
    """
    ultimo_por_autor: dict[str, str] = {}
    for review in reviews:
        estado = review.get("state")
        autor = (review.get("user") or {}).get("login")
        if not autor or estado not in ("APPROVED", "CHANGES_REQUESTED"):
            continue
        ultimo_por_autor[autor] = estado  # reviews vem em ordem cronologica

    estados = set(ultimo_por_autor.values())
    if "CHANGES_REQUESTED" in estados:
        return "CHANGES_REQUESTED"
    if "APPROVED" in estados:
        return "APPROVED"
    return "REVIEW_REQUIRED" if reviews else None


def obter_info_pr(owner_repo: str | None, branch: str | None) -> dict | None:
    """PR do GitHub associado a "branch" no repositorio "owner_repo", via API
    REST publica (sem autenticacao — funciona porque o repositorio e
    publico; ver api.github.com/repos/{owner}/{repo}). Se o repositorio
    virar privado no futuro, essas chamadas passam a exigir token e
    simplesmente retornam None (dashboard gerado normalmente, sem essa
    secao).

    Opcional por natureza: qualquer falha (sem internet, remote nao e
    github.com, branch sem PR, API fora do ar) retorna None sem quebrar a
    geracao do dashboard — mesmo espirito do fallback em coletar_evidencias.

    NAO adicionar suporte a token de autenticacao aqui (nem em _api_github):
    o dashboard.html gerado e estatico e fica versionado no repositorio, e a
    logica de "Atualizar PR" roda esse mesmo request de novo no navegador
    (ver JS_PR/atualizarPR) — qualquer token embutido no HTML ficaria exposto
    em texto puro pra qualquer um com acesso ao arquivo. Por isso essa
    integracao so funciona pra repositorio publico.

    Mesma logica replicada em JS (funcao atualizarPR() em JS_PR) pro botao
    "Atualizar PR" do dashboard, que consulta a API ao vivo no navegador —
    mantenha as duas em sincronia se mudar uma.
    """
    if not owner_repo or not branch:
        return None

    owner = owner_repo.split("/")[0]
    pulls = _api_github(f"/repos/{owner_repo}/pulls?head={owner}:{branch}&state=all")
    if not pulls:
        return None

    # A API retorna por padrao ordenado por criacao (mais recente primeiro);
    # prefere um PR ainda aberto a um antigo ja fechado da mesma branch.
    pr = next((p for p in pulls if p.get("state") == "open"), pulls[0])

    estado = "MERGED" if pr.get("merged_at") else str(pr.get("state", "")).upper()
    reviews = _api_github(f"/repos/{owner_repo}/pulls/{pr['number']}/reviews") or []

    return {
        "number": pr.get("number"),
        "title": pr.get("title"),
        "url": pr.get("html_url"),
        "state": estado,
        "reviewDecision": _decisao_revisao(reviews),
    }


def coletar_evidencias(feature: Feature, limite: int = 6) -> list[str]:
    """Nomes dos screenshots de falha do spec (sem embutir o conteudo da
    imagem no HTML — dashboard.html e versionado no git e cypress/screenshots
    e local/gitignored, entao so da pra referenciar o nome do arquivo aqui).

    Cypress limpa cypress/screenshots a cada novo "cypress run"
    (trashAssetsBeforeRuns), entao so existem evidencias da execucao mais
    recente de cada spec - o que e o comportamento desejado aqui.
    """
    pasta = SCREENSHOTS_DIR / feature.spec_relativo
    if not pasta.is_dir():
        return []
    return [png.name for png in sorted(pasta.glob("*.png"))[:limite]]


# ---------------------------------------------------------------------------
# HTML
# ---------------------------------------------------------------------------
def _donut_svg(passou: int, falhou: int, pendente: int, tamanho: int = 120) -> str:
    total = passou + falhou + pendente
    raio = tamanho / 2 - 10
    centro = tamanho / 2
    circunferencia = 2 * 3.14159265 * raio

    fatias = [
        ("passed", passou),
        ("failed", falhou),
        ("pending", pendente),
    ]

    partes = []
    offset = 0.0
    for estado, valor in fatias:
        if not valor or not total:
            continue
        fracao = valor / total
        comprimento = fracao * circunferencia
        partes.append(
            f'<circle cx="{centro}" cy="{centro}" r="{raio}" fill="none" '
            f'stroke="{CORES_ESTADO[estado]}" stroke-width="16" '
            f'stroke-dasharray="{comprimento:.2f} {circunferencia:.2f}" '
            f'stroke-dashoffset="{-offset:.2f}" transform="rotate(-90 {centro} {centro})" />'
        )
        offset += comprimento

    pct = (passou / total * 100) if total else 0
    return f'''<svg width="{tamanho}" height="{tamanho}" viewBox="0 0 {tamanho} {tamanho}" class="donut">
    <circle cx="{centro}" cy="{centro}" r="{raio}" fill="none" stroke="#2a2a2a" stroke-width="16" />
    {"".join(partes)}
    <text x="{centro}" y="{centro}" class="donut-label" text-anchor="middle" dominant-baseline="central">{pct:.0f}%</text>
    </svg>'''.replace("{centro}", str(centro))


def _barra_html(feature: Feature) -> str:
    pct = feature.pct_sucesso
    cor = "#2E7D32" if pct == 100 else ("#C62828" if feature.falhou else "#B8860B")
    return f'''<div class="barra-fundo"><div class="barra-preenchida" style="width:{pct:.0f}%;background:{cor}"></div></div>'''


def _cenarios_html(feature: Feature) -> str:
    linhas = []
    for c in feature.cenarios:
        cor = CORES_ESTADO.get(c.estado, "#888")
        rotulo = ROTULO_ESTADO.get(c.estado, c.estado)
        erro_html = ""
        if c.erro:
            mensagem = c.erro if len(c.erro) <= 300 else c.erro[:300] + "…"
            erro_html = f'<div class="erro-msg">{html.escape(mensagem)}</div>'
        linhas.append(
            f'<li data-estado="{c.estado}"><div class="cenario-linha">'
            f'<span class="badge" style="background:{cor}">{rotulo}</span>'
            f'{html.escape(c.titulo)}</div>{erro_html}</li>'
        )
    return "\n".join(linhas)


def _evidencias_html(feature: Feature) -> str:
    evidencias = coletar_evidencias(feature)
    if not evidencias:
        return '<p class="sem-evidencia">Sem evidencia de falha para a execucao mais recente.</p>'
    itens = "".join(f"<li>{html.escape(nome)}</li>" for nome in evidencias)
    return (
        '<p class="evidencias-nota">Screenshots disponiveis localmente em '
        f'<code>cypress/screenshots/{html.escape(feature.spec_relativo)}</code> '
        "(nao versionados no git):</p>"
        f'<ul class="evidencias-lista">{itens}</ul>'
    )


def _feature_card(feature: Feature, indice: int, anterior_features: dict) -> str:
    estados = ",".join(sorted({c.estado for c in feature.cenarios}))
    return f'''
    <article class="card" id="feature-{indice}" data-estados="{estados}" data-feature="{html.escape(feature.spec_relativo)}">
      <header class="card-header" onclick="toggle({indice})">
        <div>
          <span class="tag tag-{feature.sistema.lower()}">{feature.sistema}</span>
          <strong>{html.escape(feature.nome)}</strong>
          <span class="spec-path">{html.escape(feature.spec_relativo)}</span>
        </div>
        <div class="card-resumo">
          <span>{feature.passou}/{feature.total} cenarios</span>
          <span class="duracao">{_formatar_duracao(feature.duracao_ms)}</span>
          {_barra_html(feature)}
          <span class="pct">{feature.pct_sucesso:.0f}%</span>{_delta_feature_html(feature, anterior_features)}
        </div>
      </header>
      <div class="card-body" id="body-{indice}">
        <ul class="lista-cenarios">{_cenarios_html(feature)}</ul>
        <h4>Evidencias</h4>
        {_evidencias_html(feature)}
      </div>
    </article>'''


def _ler_snapshot_anterior() -> dict | None:
    """Resumo (json) da execucao anterior, embutido no dashboard.html que
    esta prestes a ser sobrescrito. None se e a primeira geracao, ou se o
    arquivo antigo nao tem o snapshot (versao anterior do script) ou esta
    corrompido — nesses casos so nao mostra comparacao, sem quebrar nada.
    """
    if not OUTPUT_PATH.is_file():
        return None
    conteudo = OUTPUT_PATH.read_text(encoding="utf-8")
    match = re.search(
        r'<script type="application/json" id="dashboard-snapshot">(.*?)</script>',
        conteudo,
        re.DOTALL,
    )
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return None


def _hash_fonte_dados() -> str:
    """Hash barato (nome + horario de modificacao, sem ler o conteudo) dos
    relatorios brutos do Cypress. Usado so pra saber se uma nova geracao do
    dashboard corresponde a uma execucao de teste de verdade, ou se e so o
    script rodando de novo em cima dos mesmos relatorios de sempre — nesse
    segundo caso nao deveria "consumir" a comparacao com a execucao anterior
    (ver "baseline" em _montar_snapshot e o comentario em montar_html)."""
    if not JSONS_DIR.is_dir():
        return ""
    entradas = sorted(
        f"{p.name}:{p.stat().st_mtime_ns}" for p in JSONS_DIR.glob("*.json")
    )
    return hashlib.sha1("|".join(entradas).encode("utf-8")).hexdigest()


def _resumo_comparavel(snapshot: dict) -> dict:
    """So os campos que _delta_resumo_html/_delta_feature_html realmente
    usam — extraido pra guardar como "baseline" sem aninhar o snapshot
    inteiro (com fonte_hash/baseline) dentro dele mesmo a cada geracao."""
    return {
        "gerado_em": snapshot.get("gerado_em"),
        "total_cenarios": snapshot.get("total_cenarios"),
        "pct_geral": snapshot.get("pct_geral"),
        "features": snapshot.get("features", {}),
    }


def _montar_snapshot(
    features: list[Feature],
    total_cenarios: int,
    total_passou: int,
    total_falhou: int,
    total_pendente: int,
    pct_geral: float,
    gerado_em: str,
    fonte_hash: str,
    baseline: dict | None,
) -> dict:
    return {
        "gerado_em": gerado_em,
        "total_cenarios": total_cenarios,
        "total_passou": total_passou,
        "total_falhou": total_falhou,
        "total_pendente": total_pendente,
        "pct_geral": round(pct_geral, 1),
        "features": {
            f.spec_relativo: {
                "passou": f.passou,
                "falhou": f.falhou,
                "total": f.total,
                "pct": round(f.pct_sucesso, 1),
            }
            for f in features
        },
        "fonte_hash": fonte_hash,
        "baseline": baseline,
        "versao_script": VERSAO_SCRIPT,
    }


def _delta_resumo_html(atual: dict, anterior: dict | None) -> str:
    """Badge compacto de comparacao com a execucao anterior — so seta + pp
    de variacao, no mesmo estilo pill dos botoes de filtro (fica ao lado
    deles, nao mais numa frase junto do "Gerado em..."). O detalhe completo
    (de onde pra onde, cenarios) vai so no title (tooltip ao passar o mouse),
    pra manter o texto visivel minimo."""
    if not anterior:
        return ""

    pct_atual = atual["pct_geral"]
    pct_anterior = anterior.get("pct_geral", 0)
    delta_pct = pct_atual - pct_anterior
    delta_cenarios = atual["total_cenarios"] - anterior.get("total_cenarios", 0)

    if abs(delta_pct) < 0.05 and delta_cenarios == 0:
        seta, classe, texto = "=", "delta-eq", "0%"
    elif delta_pct > 0:
        seta, classe, texto = "▲", "delta-up", f"{delta_pct:.0f}%"
    else:
        seta, classe, texto = "▼", "delta-down", f"{abs(delta_pct):.0f}%"

    sinal_cen = "+" if delta_cenarios >= 0 else ""
    quando = html.escape(str(anterior.get("gerado_em", "execução anterior")))
    tooltip = (
        f"Desde {quando}: {pct_anterior:.0f}% → {pct_atual:.0f}% de sucesso "
        f"({sinal_cen}{delta_cenarios} cenários)"
    )

    return f'<span class="comparacao {classe}" title="{tooltip}">{seta} {texto}</span>'


def _delta_feature_html(feature: Feature, anterior_features: dict) -> str:
    """Indicador discreto (▲/▼, verde/vermelho) ao lado do % de cada card,
    comparando com a mesma feature na execucao anterior. Sem indicador se
    nao havia dado anterior (feature nova) ou a diferenca e insignificante."""
    anterior = anterior_features.get(feature.spec_relativo)
    if not anterior:
        return ""
    delta = feature.pct_sucesso - anterior.get("pct", 0)
    if abs(delta) < 0.5:
        return ""
    seta, classe = ("▲", "delta-up") if delta > 0 else ("▼", "delta-down")
    return f'<span class="delta {classe}" title="Era {anterior.get("pct", 0):.0f}% na execução anterior">{seta}{abs(delta):.0f}</span>'


def _opcoes_feature_html(features: list[Feature]) -> str:
    """Options do select de filtro por feature especifica, na mesma ordem
    ja usada pros cards (sistema, nome). O value e o spec_relativo (chave
    unica de cada feature), pra casar com o data-feature gravado no card."""
    opcoes = [
        f'<option value="{html.escape(f.spec_relativo)}">{html.escape(f.sistema)} — {html.escape(f.nome)}</option>'
        for f in features
    ]
    return "\n".join(opcoes)


CAMINHO_DASHBOARD_RELATIVO = "cypress/reports/mochawesome/dashboard.html"


def _historico_execucoes(limite: int = 20) -> list[dict]:
    """Le, do historico do git, o snapshot embutido em cada versao anterior
    ja commitada do dashboard.html — do mais antigo pro mais novo. So conta
    commits que ja tinham essa funcionalidade (snapshot embutido); versoes
    mais antigas do arquivo (sem a tag "dashboard-snapshot") sao ignoradas
    silenciosamente, entao o historico so comeca a crescer a partir de
    quando essa feature foi introduzida — nao ha como recuperar resultados
    de execucoes/PRs anteriores a isso, porque esse dado nunca foi guardado
    em lugar nenhum.
    """
    saida = _git_saida("log", "--follow", "--format=%H", "--", CAMINHO_DASHBOARD_RELATIVO)
    if not saida:
        return []

    pontos = []
    for commit_hash in reversed(saida.splitlines()[:limite]):
        try:
            # encoding/errors explicitos — ver comentario em _git_saida.
            resultado = subprocess.run(
                ["git", "show", f"{commit_hash}:./{CAMINHO_DASHBOARD_RELATIVO}"],
                cwd=BASE_DIR,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=5,
            )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
        if resultado.returncode != 0:
            continue

        match = re.search(
            r'<script type="application/json" id="dashboard-snapshot">(.*?)</script>',
            resultado.stdout,
            re.DOTALL,
        )
        if not match:
            continue
        try:
            snap = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue

        pontos.append({
            "commit": commit_hash[:7],
            "gerado_em": snap.get("gerado_em", ""),
            "pct_geral": snap.get("pct_geral", 0),
            "total_cenarios": snap.get("total_cenarios", 0),
        })
    return pontos


def _tendencia_svg(pontos: list[dict], largura: int = 460, altura: int = 90) -> str:
    n = len(pontos)
    margem = 12
    passo_x = (largura - 2 * margem) / (n - 1) if n > 1 else 0

    def y_de(pct: float) -> float:
        pct = max(0.0, min(100.0, pct))
        return margem + (altura - 2 * margem) * (1 - pct / 100)

    coords = [(margem + i * passo_x, y_de(p["pct_geral"])) for i, p in enumerate(pontos)]
    linha = " ".join(f"{x:.1f},{y:.1f}" for x, y in coords)

    cor = "#2E7D32" if pontos[-1]["pct_geral"] >= pontos[0]["pct_geral"] else "#C62828"

    grade = "".join(
        f'<line x1="{margem}" y1="{y_de(v):.1f}" x2="{largura - margem}" y2="{y_de(v):.1f}" '
        f'stroke="#2a2a2a" stroke-width="1" stroke-dasharray="2,3" />'
        for v in (0, 50, 100)
    )
    pontos_svg = "".join(
        f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.5" fill="{cor}">'
        f'<title>{html.escape(str(p.get("gerado_em", "")))} — {p["pct_geral"]:.0f}% ({p.get("total_cenarios", 0)} cenários)</title>'
        f"</circle>"
        for (x, y), p in zip(coords, pontos)
    )

    return f'''<svg width="{largura}" height="{altura}" viewBox="0 0 {largura} {altura}" class="tendencia-svg">
    {grade}
    <polyline points="{linha}" fill="none" stroke="{cor}" stroke-width="2" stroke-linejoin="round" />
    {pontos_svg}
  </svg>'''


def _tendencia_html(pontos: list[dict]) -> str:
    """So renderiza com pelo menos 3 pontos — menos que isso nao forma uma
    tendencia de verdade (e o badge de comparacao simples cobre esse caso,
    ver _delta_resumo_html)."""
    if len(pontos) < 3:
        return ""
    return f'''<div class="tendencia">
    <span class="tendencia-titulo">Tendência — últimas {len(pontos)} execuções</span>
    {_tendencia_svg(pontos)}
    <div class="tendencia-legenda">
      <span>{pontos[0]["pct_geral"]:.0f}%</span>
      <span>{pontos[-1]["pct_geral"]:.0f}%</span>
    </div>
  </div>'''


def _pr_conteudo_html(info: dict | None) -> str:
    """Conteudo interno do badge de PR — link com os dados, ou um aviso
    quando nao ha PR pra branch atual. Sempre retorna algo renderizavel
    (nunca string vazia), porque o botao "Atualizar PR" (JS) substitui esse
    mesmo elemento em tempo real — precisa de um estado inicial pra trocar.
    """
    if not info:
        return '<span class="pr-vazio">Nenhum PR encontrado para esta branch</span>'
    numero = info.get("number")
    titulo = html.escape(info.get("title") or "")
    url = html.escape(info.get("url") or "")
    estado = ROTULO_ESTADO_PR.get(info.get("state"), info.get("state") or "")
    revisao = ROTULO_REVISAO_PR.get(info.get("reviewDecision"), "Sem revisão")
    return (
        f'<a href="{url}" target="_blank" rel="noopener">'
        f"PR #{numero} — {titulo} — {html.escape(estado)} — {html.escape(revisao)}</a>"
    )


CSS = """
:root{color-scheme:dark light}
*{box-sizing:border-box}
body{font-family:system-ui,Segoe UI,Arial,sans-serif;margin:0;background:#121212;color:#e8e8e8}
header.topo{padding:24px 32px;border-bottom:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
h1{margin:0;font-size:22px}
.gerado-em{color:#999;font-size:13px}
.comparacao{display:inline-flex;align-items:center;gap:5px;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:700;border:1px solid #2a2a2a;background:#1c1c1c;cursor:default;margin-left:auto}
.delta{font-size:10px;font-weight:700;margin-left:5px;vertical-align:middle;cursor:default}
.delta-up{color:#2E7D32}
.delta-down{color:#C62828}
.delta-eq{color:#999}
.resumo{display:flex;gap:32px;padding:24px 32px;flex-wrap:wrap;align-items:center}
.resumo-cards{display:flex;gap:16px;flex-wrap:wrap}
.tendencia{background:#1c1c1c;border:1px solid #2a2a2a;border-radius:10px;padding:14px 18px}
.tendencia-titulo{display:block;color:#999;font-size:12px;margin-bottom:6px}
.tendencia-legenda{display:flex;justify-content:space-between;color:#999;font-size:12px;margin-top:2px}
.stat{background:#1c1c1c;border:1px solid #2a2a2a;border-radius:10px;padding:16px 20px;min-width:140px}
.stat .valor{font-size:26px;font-weight:700}
.stat .rotulo{color:#999;font-size:13px}
.stat-clicavel{cursor:pointer;transition:border-color .15s,transform .15s}
.stat-clicavel:hover{border-color:#555;transform:translateY(-1px)}
.stat-clicavel.ativo{border-color:#274D9B;box-shadow:0 0 0 1px #274D9B inset}
.pr-container{display:inline-flex;align-items:center;gap:8px}
.pr-info{display:inline-flex;align-items:center;gap:6px;color:#ccc;font-size:13px;text-decoration:none;background:#1c1c1c;border:1px solid #2a2a2a;border-radius:20px;padding:6px 14px}
.pr-info a{color:inherit;text-decoration:none}
.pr-info a:hover{text-decoration:underline}
.pr-vazio{color:#777;font-style:italic}
.pr-refresh{cursor:pointer;background:#1c1c1c;border:1px solid #2a2a2a;color:#ccc;border-radius:50%;width:30px;height:30px;font-size:15px;line-height:1}
.pr-refresh:hover{border-color:#555}
.pr-refresh:disabled{opacity:.5;cursor:default}
.donuts{display:flex;gap:24px;align-items:center}
.donut-wrap{text-align:center}
.donut-wrap span{display:block;font-size:13px;color:#999;margin-top:4px}
.donut-label{fill:#e8e8e8;font-size:20px;font-weight:700}
main{padding:0 32px 48px}
.card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;margin-bottom:12px;overflow:hidden}
.card-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;cursor:pointer;flex-wrap:wrap;gap:12px}
.card-header:hover{background:#222}
.tag{font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;margin-right:8px}
.tag-ui{background:#274D9B;color:#fff}
.tag-api{background:#8B5E3C;color:#fff}
.spec-path{color:#777;font-size:12px;margin-left:10px}
.card-resumo{display:flex;align-items:center;gap:10px;font-size:13px;color:#ccc}
.barra-fundo{width:120px;height:8px;background:#2a2a2a;border-radius:4px;overflow:hidden}
.barra-preenchida{height:100%}
.pct{font-weight:700;min-width:38px;text-align:right}
.card-body{display:none;padding:0 18px 18px;border-top:1px solid #2a2a2a}
.card-body.aberto{display:block}
.lista-cenarios{list-style:none;padding:0;margin:14px 0}
.lista-cenarios li{padding:6px 8px;font-size:14px;border-radius:6px}
.lista-cenarios li.destaque{background:rgba(39,77,155,.18);outline:1px solid #274D9B}
.cenario-linha{display:flex;align-items:center;gap:10px}
.erro-msg{margin:6px 0 2px 66px;padding:6px 10px;font-size:12px;font-family:Consolas,Menlo,monospace;color:#e29a9a;background:rgba(198,40,40,.12);border-left:2px solid #C62828;border-radius:4px;white-space:pre-wrap;word-break:break-word}
.badge{font-size:11px;font-weight:700;color:#fff;padding:2px 8px;border-radius:20px;min-width:56px;text-align:center}
.duracao{color:#999;font-size:12px;min-width:44px}
.evidencias-nota{font-size:12px;color:#999;margin:8px 0 4px}
.evidencias-nota code{background:#2a2a2a;padding:1px 6px;border-radius:4px}
.evidencias-lista{list-style:none;padding:0;margin:0 0 8px;font-size:12px;color:#ccc}
.evidencias-lista li{padding:2px 0}
.sem-evidencia{color:#666;font-size:13px;font-style:italic}
.filtros{padding:0 32px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.filtros button{background:#1c1c1c;border:1px solid #2a2a2a;color:#ccc;padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px}
.filtros button.ativo{background:#274D9B;border-color:#274D9B;color:#fff}
.filtros select{background:#1c1c1c;border:1px solid #2a2a2a;color:#ccc;padding:8px 14px;border-radius:20px;cursor:pointer;font-size:13px;max-width:280px}
.filtros select.ativo{border-color:#274D9B;color:#fff}
.rodape{padding:20px 32px 32px;color:#666;font-size:11px}
@media (prefers-color-scheme: light){
  body{background:#f5f5f5;color:#222}
  header.topo,.stat,.card,.filtros button,.filtros select,.pr-info,.pr-refresh,.comparacao,.tendencia{background:#fff;border-color:#ddd}
  .card-header:hover{background:#f0f0f0}
  .donut-label{fill:#222}
  .pr-info{color:#333}
}
"""

JS = """
var filtroSistema = 'todos';
var filtroStatus = 'todos';
var filtroFeature = 'todos';

function toggle(i){
  document.getElementById('body-' + i).classList.toggle('aberto');
}

function filtrar(sistema){
  filtroSistema = sistema;
  document.querySelectorAll('.filtros button').forEach(function(b){
    b.classList.toggle('ativo', b.dataset.filtro === sistema);
  });
  aplicarFiltros();
}

function filtrarStatus(status){
  filtroStatus = (filtroStatus === status) ? 'todos' : status;
  document.querySelectorAll('.stat-clicavel').forEach(function(s){
    s.classList.toggle('ativo', s.dataset.status === filtroStatus);
  });
  aplicarFiltros();
}

function filtrarFeature(spec){
  filtroFeature = spec || 'todos';
  var select = document.getElementById('filtro-feature');
  select.classList.toggle('ativo', filtroFeature !== 'todos');
  aplicarFiltros();
}

function aplicarFiltros(){
  document.querySelectorAll('.card').forEach(function(card){
    var tagOk = filtroSistema === 'todos' || card.querySelector('.tag').textContent === filtroSistema;
    var estados = (card.dataset.estados || '').split(',');
    var statusOk = filtroStatus === 'todos' || estados.indexOf(filtroStatus) !== -1;
    var featureOk = filtroFeature === 'todos' || card.dataset.feature === filtroFeature;
    var mostra = tagOk && statusOk && featureOk;
    card.style.display = mostra ? '' : 'none';

    var indice = card.id.replace('feature-', '');
    var corpo = document.getElementById('body-' + indice);
    if (mostra && (filtroStatus !== 'todos' || filtroFeature !== 'todos')) {
      corpo.classList.add('aberto');
    }
    corpo.querySelectorAll('li[data-estado]').forEach(function(li){
      li.classList.toggle('destaque', filtroStatus !== 'todos' && li.dataset.estado === filtroStatus);
    });
  });
}

function escapeHtml(texto){
  var div = document.createElement('div');
  div.textContent = texto == null ? '' : texto;
  return div.innerHTML;
}

// Mesma logica de obter_info_pr()/_decisao_revisao() do script Python,
// reescrita em JS pra rodar ao vivo no navegador quando o botao "Atualizar
// PR" e clicado (a API do GitHub libera CORS pra leitura publica).
function atualizarPR(){
  if (!PR_OWNER_REPO || !PR_BRANCH) return;
  var btn = document.getElementById('pr-refresh-btn');
  var badge = document.getElementById('pr-badge');
  var owner = PR_OWNER_REPO.split('/')[0];
  btn.disabled = true;
  btn.textContent = '⏳';

  fetch('https://api.github.com/repos/' + PR_OWNER_REPO + '/pulls?head=' + owner + ':' + PR_BRANCH + '&state=all', {
    headers: {'Accept': 'application/vnd.github+json'}
  })
  .then(function(r){ return r.json(); })
  .then(function(pulls){
    if (!pulls || !pulls.length) {
      badge.innerHTML = '<span class="pr-vazio">Nenhum PR encontrado para esta branch</span>';
      return null;
    }
    var pr = pulls.filter(function(p){ return p.state === 'open'; })[0] || pulls[0];
    return fetch('https://api.github.com/repos/' + PR_OWNER_REPO + '/pulls/' + pr.number + '/reviews', {
      headers: {'Accept': 'application/vnd.github+json'}
    })
    .then(function(r){ return r.json(); })
    .then(function(reviews){
      reviews = reviews || [];
      var estado = pr.merged_at ? 'Mesclado' : (pr.state === 'open' ? 'Aberto' : 'Fechado');

      var ultimoPorAutor = {};
      reviews.forEach(function(rv){
        if (rv.state === 'APPROVED' || rv.state === 'CHANGES_REQUESTED') {
          ultimoPorAutor[rv.user.login] = rv.state;
        }
      });
      var estadosRevisao = Object.keys(ultimoPorAutor).map(function(k){ return ultimoPorAutor[k]; });
      var revisao = 'Sem revisão';
      if (estadosRevisao.indexOf('CHANGES_REQUESTED') !== -1) revisao = 'Alterações solicitadas';
      else if (estadosRevisao.indexOf('APPROVED') !== -1) revisao = 'Aprovado';
      else if (reviews.length) revisao = 'Revisão pendente';

      badge.innerHTML = '<a href="' + escapeHtml(pr.html_url) + '" target="_blank" rel="noopener">PR #'
        + pr.number + ' — ' + escapeHtml(pr.title) + ' — ' + estado + ' — ' + revisao + '</a>';
    });
  })
  .catch(function(){
    badge.innerHTML = '<span class="pr-vazio">Erro ao consultar a API do GitHub</span>';
  })
  .finally(function(){
    btn.disabled = false;
    btn.textContent = '↻';
  });
}
"""


def montar_html(features: list[Feature]) -> str:
    config = carregar_config()
    titulo = config["titulo"]

    total_cenarios = sum(f.total for f in features)
    total_passou = sum(f.passou for f in features)
    total_falhou = sum(f.falhou for f in features)
    total_pendente = sum(f.pendente for f in features)
    total_duracao_ms = sum(f.duracao_ms for f in features)
    pct_geral = (total_passou / total_cenarios * 100) if total_cenarios else 0

    ui = [f for f in features if f.sistema == "UI"]
    api = [f for f in features if f.sistema == "API"]

    anterior = _ler_snapshot_anterior()
    hash_atual = _hash_fonte_dados()

    # So avanca a base de comparacao quando os relatorios brutos do Cypress
    # mudaram de verdade desde a ultima geracao. Regenerar o dashboard.html
    # sem ter rodado teste novo no meio (ex.: eu conferindo o resultado)
    # reutiliza a MESMA baseline de antes, em vez de comparar "atual" com
    # "atual" (que sempre dá "sem mudanca") e assim "consumir" silenciosamente
    # uma comparacao real que ainda nao foi vista/commitada.
    if anterior and anterior.get("fonte_hash") == hash_atual:
        baseline = anterior.get("baseline")
    elif anterior:
        baseline = _resumo_comparavel(anterior)
    else:
        baseline = None

    baseline_features = (baseline or {}).get("features", {})
    cards_html = "\n".join(_feature_card(f, i, baseline_features) for i, f in enumerate(features))
    gerado_em = datetime.now().strftime("%d/%m/%Y %H:%M")

    snapshot_atual = _montar_snapshot(
        features, total_cenarios, total_passou, total_falhou, total_pendente, pct_geral, gerado_em,
        fonte_hash=hash_atual, baseline=baseline,
    )
    # </script> dentro do json quebraria a tag em volta — escapa por seguranca
    # (titulos de feature/PR nao deveriam ter isso, mas nao custa garantir).
    snapshot_json = json.dumps(snapshot_atual, ensure_ascii=False).replace("</", "<\\/")

    # Grafico de tendencia (historico via git) e badge de comparacao simples
    # (so a execucao anterior) sao mutuamente exclusivos: com historico
    # suficiente pra um grafico de verdade, o badge fica redundante e some.
    historico_commitado = _historico_execucoes()
    pontos_tendencia = historico_commitado + [{
        "commit": "atual",
        "gerado_em": gerado_em,
        "pct_geral": snapshot_atual["pct_geral"],
        "total_cenarios": total_cenarios,
    }]
    tendencia_html = _tendencia_html(pontos_tendencia)
    delta_resumo_html = "" if tendencia_html else _delta_resumo_html(snapshot_atual, baseline)

    owner_repo = _owner_repo_github()
    branch = _git_saida("branch", "--show-current")
    pr_conteudo = _pr_conteudo_html(obter_info_pr(owner_repo, branch))
    # </script> dentro de um valor JSON quebraria o <script> em volta — escapa
    # a barra por seguranca (nomes de repo/branch nunca deveriam ter isso).
    pr_owner_repo_js = json.dumps(owner_repo).replace("</", "<\\/")
    pr_branch_js = json.dumps(branch).replace("</", "<\\/")

    pr_html = f'''<div class="pr-container">
    <span id="pr-badge" class="pr-info">{pr_conteudo}</span>
    <button id="pr-refresh-btn" class="pr-refresh" onclick="atualizarPR()" title="Consultar API do GitHub agora">↻</button>
  </div>''' if owner_repo and branch else ""

    return f"""<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(titulo)}</title>
<style>{CSS}</style>
</head>
<body>
<header class="topo">
  <div>
    <h1>{html.escape(titulo)}</h1>
    <span class="gerado-em">Gerado em {gerado_em} - {len(features)} features ({len(ui)} UI / {len(api)} API)</span>
  </div>
  {pr_html}
</header>

<section class="resumo">
  <div class="donuts">
    <div class="donut-wrap">{_donut_svg(total_passou, total_falhou, total_pendente)}<span>Geral</span></div>
    <div class="donut-wrap">{_donut_svg(sum(f.passou for f in ui), sum(f.falhou for f in ui), sum(f.pendente for f in ui))}<span>UI</span></div>
    <div class="donut-wrap">{_donut_svg(sum(f.passou for f in api), sum(f.falhou for f in api), sum(f.pendente for f in api))}<span>API</span></div>
  </div>
  <div class="resumo-cards">
    <div class="stat"><div class="valor">{pct_geral:.0f}%</div><div class="rotulo">Sucesso geral</div></div>
    <div class="stat"><div class="valor">{total_cenarios}</div><div class="rotulo">Cenarios executados</div></div>
    <div class="stat stat-clicavel" data-status="passed" onclick="filtrarStatus('passed')"><div class="valor">{total_passou}</div><div class="rotulo">Passaram</div></div>
    <div class="stat stat-clicavel" data-status="failed" onclick="filtrarStatus('failed')"><div class="valor">{total_falhou}</div><div class="rotulo">Falharam</div></div>
    <div class="stat"><div class="valor">{_formatar_duracao(total_duracao_ms)}</div><div class="rotulo">Tempo total</div></div>
  </div>
  {tendencia_html}
</section>

<div class="filtros">
  <button data-filtro="todos" class="ativo" onclick="filtrar('todos')">Todas ({len(features)})</button>
  <button data-filtro="UI" onclick="filtrar('UI')">UI ({len(ui)})</button>
  <button data-filtro="API" onclick="filtrar('API')">API ({len(api)})</button>
  <select id="filtro-feature" onchange="filtrarFeature(this.value)">
    <option value="todos">Todas as features</option>
    {_opcoes_feature_html(features)}
  </select>
  {delta_resumo_html}
</div>

<main>
{cards_html}
</main>

<div class="rodape">Gerado por scripts/gerar_dashboard_html.py v{VERSAO_SCRIPT} - execucao 100% local, nao roda no CI/CD</div>

<script type="application/json" id="dashboard-snapshot">{snapshot_json}</script>

<script>
var PR_OWNER_REPO = {pr_owner_repo_js};
var PR_BRANCH = {pr_branch_js};
{JS}
</script>
</body>
</html>"""


def main() -> None:
    if not JSONS_DIR.is_dir() or not any(JSONS_DIR.glob("*.json")):
        raise SystemExit(
            f"Nenhum relatorio encontrado em {JSONS_DIR}. Rode a suite "
            f'(ex.: "npm run cy:run") antes de gerar o dashboard.'
        )

    features = carregar_features()
    if not features:
        raise SystemExit("Os relatorios encontrados nao tem cenarios executados.")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(montar_html(features), encoding="utf-8")

    print(f"Dashboard gerado em: {OUTPUT_PATH}")
    print(f"{len(features)} features processadas.")


if __name__ == "__main__":
    main()
