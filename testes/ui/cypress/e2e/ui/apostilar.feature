# language: pt

@apostilar @skip
Funcionalidade: Apostilar designação de servidor
  Como gestor de RH no sistema SIGNA
  Eu quero realizar o apostilamento de designações ativas
  Para registrar alterações formais de portaria sem necessidade de nova designação

  Regra: O apostilamento deve ser realizado em designações ativas,
    que não estejam cessadas nem marcadas como insubsistentes.

  Contexto:
    Dado que o usuário está autenticado no sistema
    E navega até o menu lateral e seleciona "Designações"
    E seleciona o submenu "Designação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Fluxo completo com tipo "Designação"        [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @apostilar-tipo-designacao @smoke
  Cenário: Apostilar designação selecionando o tipo "Designação"

    # ── ETAPA 1: Dashboard e seleção da designação ───────────────────────────
    Dado que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de designações"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "RF INDICADO, SERVIDOR INDICADO, RF TITULAR, SERVIDOR TITULAR, SEI, PORTARIA DESIGNAÇÃO, ANO DESIGNAÇÃO, DRE, UNIDADE, CARGO, Status, Action"
    E Seleciona uma das Designação de forma aleatoria para apostilar
    E navega para a seção Action
    E clica e seleciona a opção "Apostilar"
    Então o sistema exibe a Tela "Apostilar"

    # ── ETAPA 2: Seção "Servidor indicado" — dados somente leitura ──────────
    E valida a existencia e clica na aba "Servidor indicado"
    E valida a existencia dos Titulos com skip se vazio
      """
      Nome Servidor
      Nome Social
      RF
      Vínculo
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    # ── ETAPA 3: Seção "Portaria de designação" — dados somente leitura ─────
    E valida a existencia e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos com skip se vazio
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      """

    # ── ETAPA 4: Accordion "Portarias de Cessação" — abre e define flag ──────
    # "valida a existencia da aba" (sem "e clica") abre o accordion e define
    # apostilaCessacaoTemDados. Steps com capital "V" abaixo verificam esse flag:
    # true → executa | false → pula com log (seção sem dados de cessação).
    E valida a existencia da aba "Portarias de Cessação"
    E Valida a existencia do texto "Selecione o tipo de Apostila:"
    E Valida e seleciona "Designação"

    # ── ETAPA 5: Sub-seção "Portaria de Apostila" — formulário ───────────────
    E Valida a existencia e clica na aba "Portaria de Apostila"
    E Valida a existencia do texto "Nº SEI"
    E Valida a existencia do texto "D.O"
    E preenche o campo apostilamento "Nº SEI" com "11062026"
    E Valida a existencia do texto "Observações"
    E preenche o campo apostilamento "Observações" com "teste de automação 11062026"

    # ── ETAPA 6: Trechos para o SEI e preview da portaria ────────────────────
    E Valida o botão "Trechos para o SEI"
    Quando Clica no botão apostilamento "Trechos para o SEI"
    Então Valida a existencia do texto "PORTARIA"

    # ── ETAPA 7: Finalização ─────────────────────────────────────────────────
    E Valida o botão "Salvar"
    Quando Clica em salvar apostilamento
    Então o sistema processa o apostilamento sem erros

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Fluxo completo com tipo "Cessação"          [@skip]
  # ══════════════════════════════════════════════════════════════
  @skip @apostilar-tipo-cessacao @smoke
  Cenário: Apostilar designação selecionando o tipo "Cessação"

    # ── ETAPA 1: Dashboard e seleção da designação ───────────────────────────
    Dado que o usuário está na página do dashboard
    E Seleciona uma das Designação de forma aleatoria para apostilar
    E navega para a seção Action
    E clica e seleciona a opção "Apostilar"
    Então o sistema exibe a Tela "Apostilar"

    # ── ETAPA 4: Accordion "Portarias de Cessação" (condicional) ─────────────
    E valida a existencia da aba "Portarias de Cessação"
    E Valida a existencia do texto "Selecione o tipo de Apostila:"
    E Valida e seleciona "Cessação"

    # ── ETAPA 5: Sub-seção "Portaria de Apostila" — formulário ───────────────
    E Valida a existencia e clica na aba "Portaria de Apostila"
    E Valida a existencia do texto "Nº SEI"
    E Valida a existencia do texto "D.O"
    E preenche o campo apostilamento "Nº SEI" com "11062026"
    E Valida a existencia do texto "Observações"
    E preenche o campo apostilamento "Observações" com "teste de automação 11062026"

    # ── ETAPA 6: Trechos para o SEI e preview da portaria ────────────────────
    E Valida o botão "Trechos para o SEI"
    Quando Clica no botão apostilamento "Trechos para o SEI"
    Então Valida a existencia do texto "PORTARIA"

    # ── ETAPA 7: Finalização ─────────────────────────────────────────────────
    E Valida o botão "Salvar"
    Quando Clica em salvar apostilamento
    Então o sistema processa o apostilamento sem erros

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 3 — Navegação entre seções e validação de conteúdo [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @apostilar-validacao-abas @regressao
  Cenário: Validar navegação e conteúdo de todas as seções da tela Apostila

    # ── ETAPA 1: Acessar tela de apostila ───────────────────────────────────
    Dado que o usuário está na página do dashboard
    E Seleciona uma das Designação de forma aleatoria para apostilar
    E navega para a seção Action
    E clica e seleciona a opção "Apostilar"
    Então o sistema exibe a Tela "Apostilar"

    # ── Seção "Servidor indicado" ─────────────────────────────────────────────
    E valida a existencia e clica na aba "Servidor indicado"
    E valida a existencia dos Titulos com skip se vazio
      """
      Nome Servidor
      RF
      Vínculo
      Cargo base
      """

    # ── Seção "Portaria de designação" ───────────────────────────────────────
    E valida a existencia e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos com skip se vazio
      """
      Portaria da designação
      Nº SEI
      D.O
      """

    # ── Seção "Portarias de Cessação" (condicional) ──────────────────────────
    E valida a existencia da aba "Portarias de Cessação"
    E Valida a existencia do texto "Selecione o tipo de Apostila:"
    E Valida e seleciona "Designação"
    E Valida a existencia e clica na aba "Portaria de Apostila"
    E Valida a existencia do texto "Nº SEI"
    E Valida a existencia do texto "D.O"
    E Valida a existencia do texto "Observações"
