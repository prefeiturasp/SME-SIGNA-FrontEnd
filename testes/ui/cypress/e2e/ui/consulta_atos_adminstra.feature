# language: pt

@editar-designacao @visualizar
Funcionalidade: Editar e visualizar designação de servidor
  Como gestor de RH no sistema SIGNA
  Eu quero editar designações ativas e consultar os dados de qualquer designação
  Para atualizar informações de portaria/servidor ou apenas conferir os dados sem alterá-los

  Regra: A edição deve ser realizada apenas em designações ativas.

  # Editar e Visualizar foram unificadas neste arquivo porque os dois fluxos
  # levam à mesma tela de destino: "Detalhes da designação"
  # (/pages/listagem-designacoes/visualizar-designacao/{id}). Não existe mais
  # um ícone/ação "Detalhar" separado na tabela — o dropdown de ações (coluna
  # Action) só tem "Editar, Apostilar, Cessar, Tornar insubsistente, Excluir" —
  # então os dois cenários navegam pelo mesmo caminho (dropdown → "Editar") e
  # diferem só na profundidade da validação de conteúdo: o Cenário 1 confere a
  # presença das seções, o Cenário 2 valida campo a campo.

  Contexto:
    Dado que o usuário está autenticado no sistema
    # Após o login o sistema já cai direto em "Lista de atos administrativos"
    # (/pages/atos-administrativos) — não é mais necessário navegar pelo menu
    # lateral (ver também comentário em "seleciona o submenu" no common_steps.js).

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Editar designação (fluxo completo)            [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @editar-fluxo-completo @smoke
  Cenário: Editar designação e validar todas as seções do formulário

    # ── ETAPA 1: Dashboard e seleção da designação ───────────────────────────
    Dado que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de atos administrativos"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "Tipo, Nº SEI, Observações, Portaria do ato, Servidor indicado, Registro Funcional (RF), Status"
    E Seleciona uma das Designação de forma aleatoria para editar
    E navega para a seção Action
    E clica e seleciona a opção "Editar"
    Então o sistema exibe a Tela "Detalhes da designação"

    # ── ETAPA 2-4: Seções incondicionais do formulário ────────────────────────
    E valida a existencia das seguintes seções:
      | Unidade Proponente         |
      | Portarias de designação    |
      | Dados do servidor indicado |

    # ── ETAPA 5: Seção "Dados do Servidor Titular" ────────────────────────────
    # Tela real acessada via "Editar" é "Detalhes da designação" (somente
    # leitura) — não existe rádio "Cargo Disponível"/"Cargo Vago" nem campo
    # "RF Titular" nela (confirmado por screenshot real). A seção "Dados do
    # Servidor Titular" só existe quando a designação tem titular vinculado,
    # então a validação abaixo pula graciosamente quando não aplicável —
    # mesmo critério do Cenário 2 (Visualizar).
    E valida a existencia da seção "Dados do Servidor Titular" quando aplicável a esta designação

    # ── ETAPA FINAL: Botões e retorno ─────────────────────────────────────────
    E valida a existencia dos botões de edição "Voltar" e "Consultar histórico"
    Quando clica em "Voltar"
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Visualizar designação (somente leitura)       [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @visualizar-fluxo-completo @smoke
  Cenário: Visualizar designação existente e validar todos os dados

    # ── ETAPA 1: Dashboard e seleção da designação ───────────────────────────
    # Não existe mais um ícone/ação "Detalhar" separado na tabela — o dropdown
    # de ações (coluna Action) só tem "Editar, Apostilar, Cessar, Tornar
    # insubsistente, Excluir" (confirmado em execução real). Hoje a única
    # forma de chegar em "Detalhes da designação" é o mesmo caminho do
    # Cenário 1: abrir o dropdown e selecionar "Editar".
    Dado que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de atos administrativos"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "Tipo, Nº SEI, Observações, Portaria do ato, Servidor indicado, Registro Funcional (RF), Status"
    E Seleciona uma das Designação de forma aleatoria
    E navega para a seção Action
    E clica e seleciona a opção "Editar"
    Então o sistema exibe a Tela "Visualizar Designação"

    # ── ETAPA 2: Seção "Unidade Proponente" ───────────────────────────────────
    E valida a existencia da seção "Unidade Proponente"
    E valida a existencia dos Titulos
      """
      DRE
      Unidade proponente
      """

    # ── ETAPA 3: Seção "Portarias de designação" ──────────────────────────────
    E valida a existencia da seção "Portarias de designação"
    E valida a existencia dos Titulos
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      A partir de
      Até
      Caráter Excepcional
      Motivo do afastamento:
      Pendência:
      """

    # ── ETAPA 4: Seção "Dados do servidor indicado" ───────────────────────────
    E valida a existencia da seção "Dados do servidor indicado"
    E valida a existencia dos Titulos
      """
      Nome Servidor
      Nome Social
      RF
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    # ── ETAPA 5: Seção "Dados do Servidor Titular" ────────────────────────────
    # Só existe quando a designação selecionada tem um servidor titular
    # vinculado (tipo "Cargo Vago"). Designações "Cargo Disponível" não
    # exibem esta seção — por isso a validação abaixo pula graciosamente
    # quando não aplicável, em vez de assumir que toda designação tem
    # titular (ver comentário em visualizar_steps.js).
    E valida a existencia da seção "Dados do Servidor Titular" quando aplicável a esta designação
    E valida a existencia dos Titulos
      """
      Nome Servidor
      Nome Social
      RF
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    # ── ETAPA 6: Validação Final - Portaria ────────────────────────────────────
    E valida a existencia do Texto "PORTARIA"

    # ── ETAPA FINAL: Retorno à listagem ────────────────────────────────────────
    E clico no botão "Voltar"
    Então o sistema direciona para a tela "Atos administrativos"
