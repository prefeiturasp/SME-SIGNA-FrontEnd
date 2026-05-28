# language: pt

@cessacao 
Funcionalidade: Cessação de Designação
  Como um usuário do sistema SIGNA
  Eu quero gerenciar cessações de designações
  Para encerrar formalmente designações de servidores

  Contexto:
    Dado que o usuário está autenticado no sistema

  @cessacao-fluxo-completo @smoke
  Cenário: Cessação de designação existente - Fluxo completo
    
    # ETAPA 1: Navegação e Seleção da Designação
    E que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de designações"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "RF INDICADO, SERVIDOR INDICADO, RF TITULAR, SERVIDOR TITULAR, SEI, PORTARIA DESIGNAÇÃO, ANO DESIGNAÇÃO, DRE, UNIDADE, CARGO, Status, Action"
    E Seleciona uma das Designação de forma aleatoria
    E navega para a seção Action
    E clica e seleciona a opção "cessar"
    Então o sistema exibe a Tela "Cessação"

    # ETAPA 2: Aba "Portaria de designação"
    E valida e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      A partir de
      Até
      Caráter Excepcional
      Impedimento para substituição:
      Motivo do afastamento:
      Pendência:
      """
    
    # ETAPA 3: Aba "Servidor indicado"
    E valida e clica na aba "Servidor indicado"
    E valida a existencia dos Titulos
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
    
    # ETAPA 4: Aba "Servidor titular"
    E valida e clica na aba "Servidor titular"
    E valida a existencia dos Titulos
      """
      Nome Servidor
      Nome Social
      RF
      Vínculo
      Cargo Base
      Lotação
      Laudo Médico
      Cargo Sobreposto/Função Atividade
      Local de Exercício
      """
    E valida a existencia do Botão "Editar"
    
    # ETAPA 5: Aba "Portaria de cessação"
    E valida e clica na aba "Portaria de cessação"
    E valida a existencia do Texto "Portaria de cessação*"
    E preenche o campo "Portaria de cessação*" com numero aleatorio
    E valida a existencia do Texto "Nº SEI*"
    E preenche o campo "Nº SEI*" com numero aleatorio
    E valida a existencia do Texto "D.O"
    E valida a existencia do Texto "Ano Vigente*"
    E valida a existencia do Texto "Cessação a partir de:*"
    E valida a existencia do Texto "A pedido?*"
    E valida a existencia do Texto "Remoção?*"
    E valida a existencia do Texto "Aposentadoria?*"
    
    # ETAPA 6: Validação de Trechos para o SEI
    E valida a existencia do botão de navegação "Trechos para o SEI"
    Quando clica no botão "Trechos para o SEI"
    E valida a existencia do Texto "PORTARIA"
    
    # ETAPA 7: Finalização
    E valida a existencia do botão de navegação "Salvar"
    # E clica em "Salvar"
    
