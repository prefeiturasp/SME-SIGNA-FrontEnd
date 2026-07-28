# language: pt

@alterar-data-do @regressao
Funcionalidade: Alterar data do Diário Oficial das portarias

  Como gestor de RH no sistema SIGNA
  Eu quero alterar a data de publicação no Diário Oficial
  Para corrigir ou atualizar informações oficiais de portarias já emitidas

  Contexto:
    Dado que o usuário está autenticado no sistema
    E que o sistema carregou o dashboard
    E navega até "Alterar data do D.O" pelo menu lateral

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Alterar data do D.O de portarias selecionadas [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @selecao-e-alteracao @critico
  Cenário: Alterar data do D.O de portarias selecionadas

    Então valida a existencia do titulo "Alterar data do D.O"
    E valida a existencia do titulo "Filtros"
    E valida a existencia do texto "Selecione os campos para buscar as portarias disponíveis."

    E valida a existencia do texto "Nº SEI da lauda definitiva"
    E valida a existencia do texto "Portaria inicial"
    E valida a existencia do texto "Portaria final"
    E valida a existencia do texto "Ano*"
    E valida a existencia dos botões "Limpar filtros" e "Pesquisar"

    E valida a existencia do titulo "Data de publicação"
    E valida a existencia do texto "Data da publicação no Diário Oficial (D.O)"
    Quando o usuário seleciona a data atual no campo de data

    E valida a existencia do titulo "Lista de portarias"
    Então o sistema exibe a lista de portarias

    Quando o usuário navega pela lista de portarias
    E localiza uma portaria que esteja sem D.O
    E navega até a coluna "Portaria" da linha encontrada
    E seleciona o checkbox da portaria sem D.O
    E o usuário rola a página até o final
    Quando clica no botão "Alterar data"

    Então o sistema processa a alteração sem erros

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Consultar portarias utilizando filtros         [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @filtro-e-consulta
  Cenário: Consultar portarias utilizando filtros

    Então o sistema exibe os filtros de busca
    E o usuário informa o Ano "2025"
    Quando clica no botão "Pesquisar"
    Então o sistema exibe a lista de portarias filtradas

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 3 — Buscar portaria pelo número                    [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @busca-por-numero-portaria
  Cenário: Buscar portaria pelo número  (Filtros Portarias)

    Quando preenche o campo de filtro "Portaria inicial" com "1290922"
    E preenche o campo de filtro "Portaria final" com "1290922"
    E clica no botão "Pesquisar"
    Então o sistema exibe a lista de portarias filtradas

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 4 — Buscar portaria pelo Nº SEI                    [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @busca-por-sei
  Cenário: Buscar portaria pelo Nº SEI (Filtro N°sei)

    Quando preenche o campo de filtro "Nº SEI da lauda definitiva" com "6014.2026/0001234-5"
    E clica no botão "Pesquisar"
    Então o sistema exibe a lista de portarias filtradas

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 5 — Limpar campos de filtro                        [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @limpar-filtros
  Cenário: limpa Campos (filtro Limpar)

    Quando preenche o campo de filtro "Portaria inicial" com "1290922"
    E preenche o campo de filtro "Portaria final" com "1290922"
    E clica no botão "Limpar filtros"
    Então os campos de portaria estão limpos

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 6 — Busca combinada (Ano + número de portaria)     [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @busca-combinada-filtros
  Cenário: Buscar portaria combinando filtros de Ano e número de portaria

    Quando o usuário informa o Ano "2025"
    E preenche o campo de filtro "Portaria inicial" com "1290922"
    E preenche o campo de filtro "Portaria final" com "1290922"
    E clica no botão "Pesquisar"
    Então o sistema exibe a lista de portarias filtradas

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 7 — Nº SEI inexistente (tabela sem resultados)     [@skip]
  # ══════════════════════════════════════════════════════════════
  @skip @pesquisa-sem-resultado
  Cenário: Pesquisa com Nº SEI inexistente exibe tabela sem resultados

    Quando preenche o campo de filtro "Nº SEI da lauda definitiva" com "9999.9999/9999999-9"
    E clica no botão "Pesquisar"
    Então o sistema exibe a tabela sem resultados
