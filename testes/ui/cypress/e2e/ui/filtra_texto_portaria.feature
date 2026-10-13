# language: pt

@textos_portaria @filtra_texto_portaria @testIsolation(false)
Funcionalidade: Pesquisa de Textos de Portaria

  Como um usuário do sistema SIGNA
  Eu quero pesquisar textos de portaria por tipo, nome do modelo e status
  Para localizar rapidamente um modelo já cadastrado

  Contexto:
    Dado que o usuário está logado no sistema
    E está na tela "Textos de portarias" limpando os filtros entre os cenários

  # CENÁRIO 1 — Filtrar por Tipo de portaria
  @critico @smoke
  Cenário: Filtrar por Tipo de portaria

    Quando seleciona a opção "Apostila de Cessação" no filtro "Tipo de portaria"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "Apostila de Cessação"

  # CENÁRIO 2 — Filtrar por Nome do Modelo
  @critico @smoke
  Cenário: Filtrar por Nome do Modelo

    Quando preenche o filtro "Nome do Modelo" com "QA automação - Cessação - 1789133748851"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "QA automação - Cessação - 1789133748851"
    E a tabela de textos de portaria exibe resultado para "Cessação de Designação"

  # CENÁRIO 3 — Filtrar por Status (Ativo)
  @critico @smoke
  Cenário: Filtrar por Status (Ativo)

    Quando seleciona a opção "Ativo" no filtro "Status"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "Ativo"

  # CENÁRIO 4 — Filtrar por Status (Inativo)
  @critico @smoke
  Cenário: Filtrar por Status (Inativo)

    Quando seleciona a opção "Inativo" no filtro "Status"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "Inativo"

  # CENÁRIO 5 — Combinar Tipo de portaria e Nome do Modelo
  @critico @regressao
  Cenário: Filtrar combinando Tipo de portaria e Nome do Modelo

    Quando seleciona a opção "Insubsistência de Cessação" no filtro "Tipo de portaria"
    E preenche o filtro "Nome do Modelo" com "QA automação - Insubsistência de Cessação - 1789133808486"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "Insubsistência de Cessação"
    E a tabela de textos de portaria exibe resultado para "QA automação - Insubsistência de Cessação - 1789133808486"

  # CENÁRIO 6 — Pesquisas sucessivas por Nome do Modelo, limpando os filtros entre cada busca
  @critico @regressao @limpar-filtros
  Cenário: Pesquisar sucessivamente por diferentes modelos de texto limpando os filtros entre cada busca

    Quando preenche o filtro "Nome do Modelo" com "QA automação - Tornar sem efeito - 1789133928017"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "QA automação - Tornar sem efeito - 1789133928017"
    E a tabela de textos de portaria exibe resultado para "Insubsistência de Insubsistência"
    Quando clica no botão "Limpar filtros"

    Quando preenche o filtro "Nome do Modelo" com "QA automação - Anulação de Apostila - 1789133898652"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "QA automação - Anulação de Apostila - 1789133898652"
    E a tabela de textos de portaria exibe resultado para "Insubsistência de Apostila"
    Quando clica no botão "Limpar filtros"

    Então o campo "Nome do Modelo" deve estar vazio
    E os botões "Limpar filtros" e "Pesquisar" devem estar desabilitados

  # CENÁRIO 7 — Pesquisas sucessivas adicionais para "Apostila de Designação"
  @critico @regressao @limpar-filtros
  Cenário: Pesquisar sucessivamente por modelos do tipo Apostila de Designação limpando os filtros entre cada busca

    Quando preenche o filtro "Nome do Modelo" com "QA automação - Apostila de Designação - 1789133320570"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "QA automação - Apostila de Designação - 1789133320570"
    E a tabela de textos de portaria exibe resultado para "Apostila de Designação"
    Quando clica no botão "Limpar filtros"

    Quando preenche o filtro "Nome do Modelo" com "9630.741"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria exibe resultado para "9630.741"
    E a tabela de textos de portaria exibe resultado para "Apostila de Designação"
    Quando clica no botão "Limpar filtros"

    Então o campo "Nome do Modelo" deve estar vazio
    E os botões "Limpar filtros" e "Pesquisar" devem estar desabilitados

  # CENÁRIO 8 — Estrutura do filtro
  @estrutura @smoke
  Cenário: Validar estrutura do filtro de textos de portaria

    Então valida a existencia dos campos de filtro "Tipo de portaria, Nome do Modelo, Status"
    E os botões "Limpar filtros" e "Pesquisar" devem estar desabilitados

  # CENÁRIO 9 — Limpar filtros preenchidos
  @regressao @limpar-filtros
  Cenário: Limpar filtros preenchidos

    Quando preenche o filtro "Nome do Modelo" com "QA automação"
    E clica no botão "Limpar filtros"
    Então o campo "Nome do Modelo" deve estar vazio
    E os botões "Limpar filtros" e "Pesquisar" devem estar desabilitados

  # CENÁRIO 10 — Nome do Modelo inexistente exibe tabela sem resultados
  @regressao @busca-sem-resultado
  Cenário: Pesquisar por Nome do Modelo inexistente exibe tabela sem resultados

    Quando preenche o filtro "Nome do Modelo" com "QA automação - Inexistente - 0000000000000"
    E clica no botão "Pesquisar"
    Então a tabela de textos de portaria não exibe resultados
