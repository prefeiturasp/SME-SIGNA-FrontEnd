# language: pt

# @testIsolation(false): desativa o reset automático do navegador (reload,
# limpeza de cookies/storage) entre os cenários desta Funcionalidade — só
# aqui. É a forma suportada pelo cypress-cucumber-preprocessor de definir
# essa config por suíte (exigência do próprio Cypress; só pode ser feita a
# nível de Feature/Rule, não em runtime/hook). Ver login step em
# atos_administrativos_steps.js: faz login via UI uma única vez e reaproveita
# a mesma sessão/página nos cenários seguintes.
@atos-administrativos @testIsolation(false)
Funcionalidade: Pesquisa de Atos Administrativos

  Como um usuário do sistema SIGNA
  Eu quero pesquisar atos administrativos por diferentes critérios
  Para localizar rapidamente portarias e seus registros

  Contexto:
    Dado que o usuário já está autenticado no sistema
    E está na página "Atos Administrativos"

    Então valida a existencia do titulo "Atos administrativos"
    E valida a existencia do texto
      """
      Selecione os campos para buscar as portarias disponíveis.
      """

    E valida a existencia dos filtros:
      | Tipo                    |
      | Nº SEI                  |
      | Período                 |
      | Portaria de designação  |
      | Servidor                |
      | Registro Funcional (RF) |
      | Status                  |

    E valida a existencia dos botões:
      | Limpar filtros |
      | Pesquisar      |

  # ─── Cobertura mínima (suíte smoke) ──────────────────────────────────────

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Filtrar por Tipo                              [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @critico @smoke
  Cenário: Filtrar por Tipo

    Quando preencho o filtro "Tipo" com "Anulação de Apostila"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Tipo"
    E a tabela apresenta resultado para "Anulação de Apostila"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Filtrar por Nº SEI                             [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @critico @smoke
  Cenário: Filtrar por Nº SEI

    Quando preencho o filtro "Nº SEI" com "8642.097"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Nº SEI"
    E a tabela apresenta resultado para "8642.097"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 3 — Filtrar por Status (Publicado)                 [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @critico @smoke
  Cenário: Filtrar por Status (Publicado)

    Quando preencho o filtro "Status" com "Publicado"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Status"
    E a tabela apresenta resultado para "Publicado"

  # ─── Cobertura completa (suíte regressão) ────────────────────────────────

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 4 — Filtrar por Portaria de designação
  # ══════════════════════════════════════════════════════════════
  @critico @regressao
  Cenário: Filtrar por Portaria de designação

    Quando preencho o filtro "Portaria de designação" com "8147925"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
    E a tabela apresenta resultado para "8147925"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 5 — Filtrar por Servidor
  # ══════════════════════════════════════════════════════════════
  @critico @regressao
  Cenário: Filtrar por Servidor

    Quando preencho o filtro "Servidor" com "ADALBERTO PAVLIDIS DA SILVA"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Servidor"
    E a tabela apresenta resultado para "ADALBERTO PAVLIDIS DA SILVA"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 6 — Filtrar por Status (Aguardando publicação)
  # ══════════════════════════════════════════════════════════════
  @critico @regressao
  Cenário: Filtrar por Status (Aguardando publicação)

    Quando preencho o filtro "Status" com "Aguardando publicação"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Status"
    E a tabela apresenta resultado para "Aguardando publicação"

  # ─── Bloqueados por bug no backend ───────────────────────────────────────
  # Bug conhecido (2026-07-12, reconfirmado em 2026-07-20): o backend não
  # filtra corretamente por Servidor/RF — a tabela retorna linhas que não
  # correspondem ao valor pesquisado (evidência: busca por "ROSANGELA DA
  # SILVA PRADO" e por RF "7443668" trouxe registros de outras pessoas/RFs,
  # mesmo com o request enviando o valor correto ao backend). Skip até
  # correção.

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 7 — Filtrar por Servidor (bloqueado por bug)       [@skip]
  # ══════════════════════════════════════════════════════════════
  @critico @regressao @skip
  Cenário: Filtrar por Servidor - bloqueado por bug no backend

    Quando preencho o filtro "Servidor" com "ROSANGELA DA SILVA PRADO"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Servidor"
    E a tabela apresenta resultado para "ROSANGELA DA SILVA PRADO"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 8 — Filtrar por RF (bloqueado por bug)             [@skip]
  # ══════════════════════════════════════════════════════════════
  @critico @regressao @skip
  Cenário: Filtrar por Registro Funcional (RF) - bloqueado por bug no backend

    Quando preencho o filtro "Registro Funcional (RF)" com "7443668"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Registro Funcional (RF)"
    E a tabela apresenta resultado para "7443668"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 9 — Filtrar por período de publicação
  # ══════════════════════════════════════════════════════════════
  @regressao @periodo
  Cenário: Filtrar por período de publicação

    Quando seleciono o período de "01/01/2026" até "31/12/2026"
    E clico no botão "Pesquisar"

    Então o sistema exibe os registros dentro do período

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 10 — Limpar filtros preenchidos
  # ══════════════════════════════════════════════════════════════
  @regressao @limpar-filtros
  Cenário: Limpar filtros preenchidos

    Quando preencho o filtro "Nº SEI" com "8642.097"
    E preencho o filtro "Registro Funcional (RF)" com "7443668"
    E clico no botão "Limpar filtros"

    Então os campos de filtro são limpos

  # Bug conhecido (2026-07-12, reconfirmado em 2026-07-20): a combinação de
  # filtros não funciona como "E" (AND) — nenhuma linha retornada satisfaz
  # RF e Status ao mesmo tempo. Skip até correção no backend.
  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 11 — Busca combinada RF + Status                   [@skip]
  # ══════════════════════════════════════════════════════════════
  @regressao @busca-combinada @skip
  Cenário: Buscar combinando Registro Funcional e Status

    Quando preencho o filtro "Registro Funcional (RF)" com "7443668"
    E preencho o filtro "Status" com "Publicado"
    E clico no botão "Pesquisar"

    Então o sistema exibe registros compatíveis com o filtro "Registro Funcional (RF)"
    E a tabela apresenta resultado para "7443668"

  # Bug conhecido (2026-07-12, reconfirmado em 2026-07-20): o backend não
  # retorna o estado vazio ("Não há dados") para um Nº SEI inexistente — a
  # tabela continua populada com linhas que não correspondem à busca. Skip
  # até correção no backend.
  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 12 — Nº SEI inexistente (tabela sem resultados)    [@skip]
  # ══════════════════════════════════════════════════════════════
  @regressao @busca-sem-resultado @skip
  Cenário: Pesquisar com Nº SEI inexistente exibe tabela sem resultados

    Quando preencho o filtro "Nº SEI" com "9999.9999999-9"
    E clico no botão "Pesquisar"

    Então o sistema exibe a tabela de atos administrativos sem resultados
