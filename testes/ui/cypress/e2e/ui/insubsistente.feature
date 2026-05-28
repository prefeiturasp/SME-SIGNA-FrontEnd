# language: pt

@insubsistente
Funcionalidade: Insubsistência de Designação
  Como um usuário do sistema SIGNA
  Eu quero gerenciar insubsistências de designações
  Para tornar insubsistentes designações de servidores quando necessário

  Contexto:
    Dado que o usuário está autenticado no sistema

 @insubsistente-fluxo-completo @smoke
  Cenário: Tornar designação insubsistente - Designação
    
    # ETAPA 1: Navegação e Seleção da Designação
    E que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de designações"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "RF INDICADO, SERVIDOR INDICADO, RF TITULAR, SERVIDOR TITULAR, SEI, PORTARIA DESIGNAÇÃO, ANO DESIGNAÇÃO, DRE, UNIDADE, CARGO, Status, Action"
    E Seleciona uma das Designação de forma aleatoria para insubsistência
    E navega para a seção Action
    E clica e seleciona a opção "Tornar Insubsistente"
    Então o sistema exibe a Tela "Insubsistência"

    # ETAPA 2: Aba "Servidor indicado"
    E valida e clica na aba "Servidor indicado"
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

    # ETAPA 3: Aba "Portaria de designação"
    E valida a existencia e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos com skip se vazio
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      """

    # ETAPA 4: Aba "Portarias de Cessação" - Seleção do tipo
    E valida a existencia e clica na aba "Portarias de Cessação"
    E valida a existencia do Texto "Selecione o tipo de insubsistência:"
    E valida a existencia das opções "Designação" e "Cessação"
    E seleciona a opção "Designação"
    
    # ETAPA 5: Formulário de Insubsistência (aparece após selecionar tipo)
    E valida a existencia do Texto "Portaria de insubsistência"
    E preenche o campo "Portaria de insubsistência" com numero aleatorio
    E valida a existencia do Texto "Ano Vigente*"
    E valida a existencia do Texto "Nº SEI"
    E preenche o campo "Nº SEI" com numero aleatorio
    E valida a existencia do Texto "D.O"

    # ETAPA 6: Observações e Trechos para o SEI
    E valida a existencia do Texto "Observações"
    E preenche o campo "Observações" com texto aleatorio
    E valida a existencia do botão de navegação "Trechos para o SEI"
    Quando clica no botão "Trechos para o SEI"
    E valida a existencia do Texto "PORTARIA"

    # ETAPA 7: Finalização
    E valida a existencia do botão de navegação "Salvar"
    E clica em "Salvar"

 @insubsistente-cessacao @smoke
  Cenário: Tornar designação insubsistente - Cessação
    
    # ETAPA 1: Navegação e Seleção da Designação
    E que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de designações"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "RF INDICADO, SERVIDOR INDICADO, RF TITULAR, SERVIDOR TITULAR, SEI, PORTARIA DESIGNAÇÃO, ANO DESIGNAÇÃO, DRE, UNIDADE, CARGO, Status, Action"
    E Seleciona uma das Designação de forma aleatoria para insubsistência
    E navega para a seção Action
    E clica e seleciona a opção "Tornar Insubsistente"
    Então o sistema exibe a Tela "Insubsistência"

    # ETAPA 2: Aba "Servidor indicado"
    E valida e clica na aba "Servidor indicado"
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

    # ETAPA 3: Aba "Portaria de designação"
    E valida a existencia e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos com skip se vazio
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      """

    # ETAPA 4: Aba "Portarias de Cessação" - Seleção do tipo
    E valida a existencia e clica na aba "Portarias de Cessação"
    E valida a existencia do Texto "Selecione o tipo de insubsistência:"
    E valida a existencia das opções "Designação" e "Cessação"
    E seleciona a opção "Cessação"
    
    # ETAPA 5: Formulário de Insubsistência (aparece após selecionar tipo)
    E valida a existencia do Texto "Portaria de insubsistência"
    E preenche o campo "Portaria de insubsistência" com numero aleatorio
    E valida a existencia do Texto "Ano Vigente*"
    E valida a existencia do Texto "Nº SEI"
    E preenche o campo "Nº SEI" com numero aleatorio
    E valida a existencia do Texto "D.O"

    # ETAPA 6: Observações e Trechos para o SEI
    E valida a existencia do Texto "Observações"
    E preenche o campo "Observações" com texto aleatorio
    E valida a existencia do botão de navegação "Trechos para o SEI"
    Quando clica no botão "Trechos para o SEI"
    E valida a existencia do Texto "PORTARIA"

    # ETAPA 7: Finalização
    E valida a existencia do botão de navegação "Salvar"
    E clica em "Salvar"




 @insubsistente-navegacao-abas @smoke
  Cenário: Validação de navegação entre todas as abas do formulário
    
    # ETAPA 1: Acesso ao formulário de insubsistência
    E que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de designações"
    E Valida a existencia da Tabela
    E Seleciona uma das Designação de forma aleatoria para insubsistência
    E navega para a seção Action
    E clica e seleciona a opção "Tornar Insubsistente"
    Então o sistema exibe a Tela "Insubsistência"

    # ETAPA 2: Navegação pela aba "Servidor indicado"
    E valida a existencia e clica na aba "Servidor indicado"
    Então o sistema exibe os campos da aba servidor indicado

    # ETAPA 3: Navegação pela aba "Portaria de designação"
    E valida a existencia e clica na aba "Portaria de designação"
    Então o sistema exibe os campos da aba portaria de designação

    # ETAPA 4: Navegação pela aba "Portarias de Cessação"
    E valida a existencia e clica na aba "Portarias de Cessação"
    E valida a existencia do Texto "Selecione o tipo de insubsistência:"
    E valida a existencia das opções "Designação" e "Cessação"
    
    # ETAPA 5: Validação de que todas as abas são acessíveis
    Então todas as abas do formulário foram acessadas com sucesso

 @insubsistente-validacao-dados @smoke
  Cenário: Validação de exibição de dados nas abas
    
    # ETAPA 1: Acesso ao formulário
    E que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de designações"
    E Valida a existencia da Tabela
    E Seleciona uma das Designação de forma aleatoria para insubsistência
    E navega para a seção Action
    E clica e seleciona a opção "Tornar Insubsistente"
    Então o sistema exibe a Tela "Insubsistência"

    # ETAPA 2: Validação de dados na aba "Servidor indicado"
    E valida a existencia e clica na aba "Servidor indicado"
    Então valida que a aba servidor indicado contém informações válidas

    # ETAPA 3: Validação de dados na aba "Portaria de designação"
    E valida a existencia e clica na aba "Portaria de designação"
    Então valida que a aba portaria de designação contém informações válidas

    # ETAPA 4: Seleção de tipo e validação de campos dinâmicos
    E valida a existencia e clica na aba "Portarias de Cessação"
    E valida a existencia das opções "Designação" e "Cessação"
    E seleciona a opção "Designação"
    Então valida que os campos de insubsistência são exibidos corretamente
