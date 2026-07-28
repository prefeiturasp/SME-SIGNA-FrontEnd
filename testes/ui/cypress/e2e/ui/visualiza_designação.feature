# language: pt

@visualizar 
Funcionalidade: visualizar de Designação
  Como um usuário do sistema SIGNA
  Eu quero gerenciar visualizar designações
  Para consultar a designações de servidores

  Contexto:
    Dado que o usuário está autenticado no sistema
    E navega até o menu lateral e seleciona "Designações"
    E seleciona o submenu "Designação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Visualizar designação existente (fluxo completo) [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @visualizar-fluxo-completo @smoke
  Cenário: visualizar designação existente - Fluxo completo
    
    # ══════════════════════════════════════════════════════════════════════════
    # ETAPA 1: Navegação e Seleção da Designação
    # ══════════════════════════════════════════════════════════════════════════
    E que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de designações"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "RF INDICADO, SERVIDOR INDICADO, RF TITULAR, SERVIDOR TITULAR, SEI, PORTARIA DESIGNAÇÃO, ANO DESIGNAÇÃO, DRE, UNIDADE, CARGO, Status, Action"
    E Seleciona uma das Designação de forma aleatoria
    E clica no ícone "Detalhar" da coluna Action
    Então o sistema exibe a Tela "Visualizar Designação"
    
    # ETAPA 2: Validação da seção "Unidade Proponente"
    E valida a existencia da seção "Unidade Proponente"
    E valida a existencia dos Titulos
      """
      DRE
      Unidade proponente
      """

    # ETAPA 3: Validação da seção "Portarias de designação"
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

    # ETAPA 4: Validação da seção "Dados do servidor indicado"
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

    # ETAPA 5: Validação da seção "Dados do Servidor Titular"
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

    # ETAPA 6: Validação Final - Portaria
    E valida a existencia do Texto "PORTARIA"

    # ETAPA 7: Retorno à listagem de designações
    E clico no botão "Voltar"
    Então o sistema direciona para a tela "Listagem de designações"

