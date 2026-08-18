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

Uso:
    python scripts/gerar_dashboard_html.py

Saida:
    cypress/reports/mochawesome/dashboard.html
"""

import html
import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
JSONS_DIR = BASE_DIR / "cypress" / "reports" / "mochawesome" / ".jsons"
SCREENSHOTS_DIR = BASE_DIR / "cypress" / "screenshots"
OUTPUT_PATH = BASE_DIR / "cypress" / "reports" / "mochawesome" / "dashboard.html"

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


def _flatten_testes(suite: dict) -> list[Cenario]:
    cenarios = [Cenario(t["title"], t["state"] or "pending") for t in suite.get("tests", [])]
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
        linhas.append(
            f'<li><span class="badge" style="background:{cor}">{rotulo}</span>'
            f'{html.escape(c.titulo)}</li>'
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


def _feature_card(feature: Feature, indice: int) -> str:
    return f'''
    <article class="card" id="feature-{indice}">
      <header class="card-header" onclick="toggle({indice})">
        <div>
          <span class="tag tag-{feature.sistema.lower()}">{feature.sistema}</span>
          <strong>{html.escape(feature.nome)}</strong>
          <span class="spec-path">{html.escape(feature.spec_relativo)}</span>
        </div>
        <div class="card-resumo">
          <span>{feature.passou}/{feature.total} cenarios</span>
          {_barra_html(feature)}
          <span class="pct">{feature.pct_sucesso:.0f}%</span>
        </div>
      </header>
      <div class="card-body" id="body-{indice}">
        <ul class="lista-cenarios">{_cenarios_html(feature)}</ul>
        <h4>Evidencias</h4>
        {_evidencias_html(feature)}
      </div>
    </article>'''


CSS = """
:root{color-scheme:dark light}
*{box-sizing:border-box}
body{font-family:system-ui,Segoe UI,Arial,sans-serif;margin:0;background:#121212;color:#e8e8e8}
header.topo{padding:24px 32px;border-bottom:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
h1{margin:0;font-size:22px}
.gerado-em{color:#999;font-size:13px}
.resumo{display:flex;gap:32px;padding:24px 32px;flex-wrap:wrap;align-items:center}
.resumo-cards{display:flex;gap:16px;flex-wrap:wrap}
.stat{background:#1c1c1c;border:1px solid #2a2a2a;border-radius:10px;padding:16px 20px;min-width:140px}
.stat .valor{font-size:26px;font-weight:700}
.stat .rotulo{color:#999;font-size:13px}
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
.lista-cenarios li{padding:6px 0;font-size:14px;display:flex;align-items:center;gap:10px}
.badge{font-size:11px;font-weight:700;color:#fff;padding:2px 8px;border-radius:20px;min-width:56px;text-align:center}
.evidencias-nota{font-size:12px;color:#999;margin:8px 0 4px}
.evidencias-nota code{background:#2a2a2a;padding:1px 6px;border-radius:4px}
.evidencias-lista{list-style:none;padding:0;margin:0 0 8px;font-size:12px;color:#ccc}
.evidencias-lista li{padding:2px 0}
.sem-evidencia{color:#666;font-size:13px;font-style:italic}
.filtros{padding:0 32px 16px;display:flex;gap:10px}
.filtros button{background:#1c1c1c;border:1px solid #2a2a2a;color:#ccc;padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px}
.filtros button.ativo{background:#274D9B;border-color:#274D9B;color:#fff}
@media (prefers-color-scheme: light){
  body{background:#f5f5f5;color:#222}
  header.topo,.stat,.card,.filtros button{background:#fff;border-color:#ddd}
  .card-header:hover{background:#f0f0f0}
  .donut-label{fill:#222}
}
"""

JS = """
function toggle(i){
  document.getElementById('body-' + i).classList.toggle('aberto');
}
function filtrar(sistema){
  document.querySelectorAll('.card').forEach(function(card){
    var mostra = sistema === 'todos' || card.querySelector('.tag').textContent === sistema;
    card.style.display = mostra ? '' : 'none';
  });
  document.querySelectorAll('.filtros button').forEach(function(b){
    b.classList.toggle('ativo', b.dataset.filtro === sistema);
  });
}
"""


def montar_html(features: list[Feature]) -> str:
    total_cenarios = sum(f.total for f in features)
    total_passou = sum(f.passou for f in features)
    total_falhou = sum(f.falhou for f in features)
    total_pendente = sum(f.pendente for f in features)
    pct_geral = (total_passou / total_cenarios * 100) if total_cenarios else 0

    ui = [f for f in features if f.sistema == "UI"]
    api = [f for f in features if f.sistema == "API"]

    cards_html = "\n".join(_feature_card(f, i) for i, f in enumerate(features))
    gerado_em = datetime.now().strftime("%d/%m/%Y %H:%M")

    return f"""<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dashboard de Automacao - SIGNA</title>
<style>{CSS}</style>
</head>
<body>
<header class="topo">
  <h1>Dashboard de Automacao - SIGNA</h1>
  <span class="gerado-em">Gerado em {gerado_em} - {len(features)} features ({len(ui)} UI / {len(api)} API)</span>
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
    <div class="stat"><div class="valor">{total_passou}</div><div class="rotulo">Passaram</div></div>
    <div class="stat"><div class="valor">{total_falhou}</div><div class="rotulo">Falharam</div></div>
  </div>
</section>

<div class="filtros">
  <button data-filtro="todos" class="ativo" onclick="filtrar('todos')">Todas ({len(features)})</button>
  <button data-filtro="UI" onclick="filtrar('UI')">UI ({len(ui)})</button>
  <button data-filtro="API" onclick="filtrar('API')">API ({len(api)})</button>
</div>

<main>
{cards_html}
</main>

<script>{JS}</script>
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
