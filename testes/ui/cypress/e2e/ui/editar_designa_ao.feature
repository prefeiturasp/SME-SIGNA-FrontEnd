# language: pt

@editar-designacao
Funcionalidade: Editar designação de servidor
  Como gestor de RH no sistema SIGNA
  Eu quero editar designações ativas
  Para atualizar informações de portaria ou de servidor sem criar nova designação

  Regra: A edição deve ser realizada apenas em designações ativas.

  Contexto:
    Dado que o usuário está autenticado no sistema
    E navega até o menu lateral e seleciona "Designações"
    E seleciona o submenu "Designação"

  # ============================================================
  # CENÁRIO 1 — Fluxo completo de edição com todas as seções
  # ============================================================
  @editar-fluxo-completo @smoke
  Cenário: Editar designação e validar todas as seções do formulário

    # ── ETAPA 1: Dashboard e seleção da designação ───────────────────────────
    Dado que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de designações"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "RF INDICADO, SERVIDOR INDICADO, RF TITULAR, SERVIDOR TITULAR, SEI, PORTARIA DESIGNAÇÃO, ANO DESIGNAÇÃO, DRE, UNIDADE, CARGO, Status, Action"
    E Seleciona uma das Designação de forma aleatoria para editar
    E navega para a seção Action
    E clica e seleciona a opção "Editar"
    Então o sistema exibe a Tela "Editar Designação"

    # ── ETAPA 2: Seção "Unidade Proponente" ───────────────────────────────────
    E valida a existencia da seção "Unidade Proponente"

    # ── ETAPA 3: Seção "Portarias de designação" ──────────────────────────────
    E valida a existencia da seção "Portarias de designação"

    # ── ETAPA 4: Seção "Dados do servidor indicado" ───────────────────────────
    E valida a existencia da seção "Dados do servidor indicado"

    # ── ETAPA 5: Tipo de cargo e RF Titular ──────────────────────────────────
    E valida a existencia do campo "Selecione o tipo de cargo:"
    E valida as opções de tipo de cargo "Cargo Disponível" e "Cargo Vago"
    E valida a existencia do campo "RF Titular"

    # ── ETAPA 6: Seção "Dados do Servidor Titular" ────────────────────────────
    E valida a existencia da seção "Dados do Servidor Titular"

    # ── ETAPA FINAL: Botões de navegação ─────────────────────────────────────
    E valida a existencia dos botões de edição "Voltar" e "Avançar"
    Quando clica em "Avançar"
    Então o sistema avança o fluxo de edição sem erros

  # ============================================================
  # CENÁRIO 2 — Validação rápida das seções (regressão)
  # ============================================================
 @editar-validacao-secoes @regressao
  Cenário: Validar presença de todas as seções na tela Editar Designação

    Dado que o usuário está na página do dashboard
    E Seleciona uma das Designação de forma aleatoria para editar
    E navega para a seção Action
    E clica e seleciona a opção "Editar"
    Então o sistema exibe a Tela "Editar Designação"

    E valida a existencia da seção "Unidade Proponente"
    E valida a existencia da seção "Portarias de designação"
    E valida a existencia da seção "Dados do servidor indicado"
    E valida a existencia do campo "Selecione o tipo de cargo:"
    E valida a existencia da seção "Dados do Servidor Titular"
