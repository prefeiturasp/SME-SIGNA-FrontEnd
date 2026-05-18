# language: pt

@insubsistencia @skip
Funcionalidade: Insubsistência de Designação
  Como um usuário do sistema SIGNA
  Eu quero registrar insubsistências de designações
  Para invalidar designações que não foram efetivadas

  # ⚠️  Funcionalidade em implementação — cenários pendentes
  # Para rodar: remover a tag @skip quando os steps estiverem implementados

  @insubsistencia-fluxo-completo
  @skip
  Cenário: Registro de insubsistência de designação
    Dado que o usuário está autenticado no sistema
    Quando navega para a seção de insubsistências
    Então o sistema exibe a lista de designações passíveis de insubsistência

  @insubsistencia-busca
  @skip
  Cenário: Busca de designação para insubsistência por RF
    Dado que o usuário está autenticado no sistema
    Quando pesquisa uma designação pelo RF do servidor
    Então o sistema exibe os resultados da busca