# language: pt

@cessacao @skip
Funcionalidade: Cessação de Designação
  Como um usuário do sistema SIGNA
  Eu quero gerenciar cessações de designações
  Para encerrar formalmente designações de servidores

  # ⚠️  Funcionalidade em implementação — cenários pendentes
  # Para rodar: remover a tag @skip quando os steps estiverem implementados

  @cessacao-fluxo-completo
  @skip
  Cenário: Cessação de designação existente
    Dado que o usuário está autenticado no sistema
    Quando navega para a seção de cessações
    Então o sistema exibe a lista de designações passíveis de cessação

  @cessacao-busca
  @skip
  Cenário: Busca de designação para cessação por RF
    Dado que o usuário está autenticado no sistema
    Quando pesquisa uma designação pelo RF do servidor
    Então o sistema exibe os resultados da busca