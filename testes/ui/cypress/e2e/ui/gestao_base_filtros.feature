# language: pt

@gestão_base @filtra_cargo @testIsolation(false)
Funcionalidade: Gestão de cargos base

  Como um usuário do sistema SIGNA
  Eu quero pesquisar e filtrar os cargos base cadastrados
  Para localizar rapidamente um cargo específico na lista

  # @testIsolation(false): desativa o reset automático do navegador entre
  # os cenários desta Funcionalidade — login roda uma única vez (1º
  # cenário) e os demais reaproveitam a mesma sessão. Usa um step de login
  # PRÓPRIO ("está logado", gestao_cargos_base_steps.js), não o de
  # atos_administrativos_steps.js: aquele tem recuperação hardcoded pra
  # tela de Atos Administrativos (foi a causa da falha na 1ª tentativa de
  # reaproveitar sessão aqui). "está na tela" já roda de novo em todo
  # cenário e limpa qualquer filtro deixado pelo cenário anterior.
  Contexto:
    Dado que o usuário está logado no sistema
    E está na tela "Gestão de cargos base"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Título, campos de filtro, botões e lista        [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @validacao_estrutura @smoke
  Cenário: Validar título, campos de filtro, botões e lista de cargos base
    Então valida a existencia do Texto "Gestão de cargos base"
    E valida a existencia do Texto "Lista de cargos base"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "Grupamento, Descrição resumida, Descrição completa, Situação funcional, Usado em funções, Usado em designações, Usado em STE, Usado em permutas, Cargo base fictício, Status"
    E valida a existencia dos campos de filtro "Grupamento, Descrição Resumida, Descrição Completa, Situação Funcional, Status"
    E valida a existencia do Botão "Cadastrar novo cargo"
    Então os botões "Limpar filtros" e "Pesquisar" devem estar desabilitados

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Pesquisa combinando múltiplos filtros            [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @pesquisa_filtros @smoke
  Cenário: Pesquisar cargos base combinando Grupamento, Descrição Resumida e Status
    # 1ª consulta: Grupamento + Descrição Resumida (texto livre) + Status
    Quando seleciona a opção "Docentes" no filtro "Grupamento"
    E preenche o filtro "Descrição Resumida" com "apoio"
    E seleciona a opção "Ativo" no filtro "Status"
    Então os botões "Limpar filtros" e "Pesquisar" devem estar habilitados
    Quando clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "DOCENTES"
    E a tabela exibe apenas cargos base com "Ativo"

    # 2ª consulta: troca os filtros por Situação Funcional + Descrição Completa
    Quando clica no botão "Limpar filtros"
    E seleciona a opção "Efetivo" no filtro "Situação Funcional"
    E preenche o filtro "Descrição Completa" com "escola"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "EFETIVO"
    E a tabela exibe apenas cargos base com "ESCOLA"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 3 — Limpar filtros restaura a lista completa         [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @limpar_filtros @regressao
  Cenário: Limpar filtros restaura a lista completa de cargos base
    # 3ª consulta: aplica um filtro que restringe a lista, antes de limpar
    Quando seleciona a opção "Docentes" no filtro "Grupamento"
    E clica no botão "Pesquisar"

    Quando clica no botão "Limpar filtros"
    Então o campo "Grupamento" deve estar vazio
    E os botões "Limpar filtros" e "Pesquisar" devem estar desabilitados
    E a tabela exibe mais de "1" cargo base cadastrado

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 4 — Filtrar somente por Grupamento                   [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @filtro_individual @regressao
  Cenário: Filtrar cargos base somente por Grupamento
    Quando seleciona a opção "Docentes" no filtro "Grupamento"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "DOCENTES"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 5 — Filtrar somente por Descrição Resumida            [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @filtro_individual @regressao
  Cenário: Filtrar cargos base somente por Descrição Resumida
    Quando preenche o filtro "Descrição Resumida" com "apoio"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "apoio"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 6 — Filtrar somente por Descrição Completa            [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @filtro_individual @regressao
  Cenário: Filtrar cargos base somente por Descrição Completa
    Quando preenche o filtro "Descrição Completa" com "escola"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "ESCOLA"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 7 — Filtrar somente por Situação Funcional            [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @filtro_individual @regressao
  Cenário: Filtrar cargos base somente por Situação Funcional
    Quando seleciona a opção "Efetivo" no filtro "Situação Funcional"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "EFETIVO"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 8 — Filtrar somente por Status                        [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @filtro_individual @regressao
  Cenário: Filtrar cargos base somente por Status
    Quando seleciona a opção "Ativo" no filtro "Status"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "Ativo"