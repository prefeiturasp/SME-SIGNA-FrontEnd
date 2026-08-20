// Step Definitions — Editar Designação
// Este arquivo cobre o Cenário 1 (Editar) de consulta_atos_adminstra.feature.
// O Cenário 2 (Visualizar) do mesmo arquivo — antigo visualiza_designação.feature,
// mesclado aqui porque os dois fluxos convergem para a mesma tela de destino
// (visualizar-designacao/{id}) — usa steps próprios em visualizar_steps.js.
//
// A tela real acessada via "Editar" é "Detalhes da designação" — a mesma
// tela somente leitura do Cenário 2, sem rádio "Cargo Disponível"/"Cargo
// Vago" nem campo "RF Titular" (confirmado por screenshot real). Por isso o
// Cenário 1 reutiliza "valida a existencia da seção {string} quando
// aplicável a esta designação" (visualizar_steps.js) em vez de ter sua
// própria variante condicionada a tipo de cargo.
//
// Steps reutilizados de outros arquivos (Cenário 1):
//   • "que o usuário está autenticado"           → common_steps.js
//   • "que o usuário está na página do dashboard"→ common_steps.js
//   • "valida a existencia do Texto"             → common_steps.js (lowercase v, capital T)
//   • "Valida a existencia da Tabela"            → common_steps.js
//   • "Valida a existencia das Colunas"          → cessacao_steps.js
//   • "navega para a seção Action"               → cessacao_steps.js
//   • "clica e seleciona a opção"                → cessacao_steps.js
//   • "o sistema exibe a Tela"                   → common_steps.js
//   • "valida a existencia da seção {string} quando aplicável a esta designação" → visualizar_steps.js
//   • "clica em"                                 → designacao_steps.js
//   • "o sistema direciona para a tela"          → atos_administrativos_steps.js
//
// Steps do Cenário 2 (Visualizar) → visualizar_steps.js, exceto onde indicado:
//   • "Seleciona uma das Designação de forma aleatoria" (sem "para editar") → cessacao_steps.js
//   • "navega para a seção Action" / "clica e seleciona a opção" (mesmos steps
//     do Cenário 1, reaproveitados) → cessacao_steps.js — não existe mais
//     ícone/ação "Detalhar" separado na tabela, só o dropdown com "Editar,
//     Apostilar, Cessar, Tornar insubsistente, Excluir" (confirmado em
//     execução real), então os dois cenários navegam pelo mesmo caminho.
//   • "valida a existencia da seção {string}" (singular, sem Data Table)
//   • "valida a existencia dos Titulos" (docstring) → cessacao_steps.js
//   • "clico no botão {string}" → atos_administrativos_steps.js

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'

// ─── ETAPA 1 — Seleção aleatória da designação para editar ────────────────────

Then('Seleciona uma das Designação de forma aleatoria para editar', () => {
  cy.get('table tbody tr.ant-table-row', { timeout: 30000 })
    .should('have.length.greaterThan', 0)
    .its('length')
    .then(totalLinhas => {
      cy.wrap(null).then(() => {
        const tentativasAnteriores = Cypress.env('editarTentadas') || []

        const indicesDisponiveis = Array.from({ length: totalLinhas }, (_, i) => i)
          .filter(i => !tentativasAnteriores.includes(i))

        let index
        if (indicesDisponiveis.length > 0) {
          index = indicesDisponiveis[0]
        } else {
          cy.log('Todas as designações já foram tentadas para editar, resetando...')
          Cypress.env('editarTentadas', [])
          index = 0
        }

        cy.log(`Editar — selecionando designação (índice: ${index} de ${totalLinhas})`)
        cy.wrap(index).as('designacaoIndex')
      })
    })
})

// ─── ETAPA 2-4 — Validação unificada das seções incondicionais do formulário ──
// Unidade Proponente / Portarias de designação / Dados do servidor indicado
// sempre existem (sem depender do tipo de cargo, ao contrário das ETAPAS 5/6
// abaixo) — por isso viraram uma única Data Table em vez de 3 steps Gherkin
// separados. Mesmo padrão de "valida a existencia dos filtros:"/"valida a
// existencia dos botões:" em atos_administrativos_steps.js.

Then('valida a existencia das seguintes seções:', (dataTable) => {
  const secoes = dataTable.raw().flat()
  secoes.forEach((secao) => {
    cy.contains(
      '.ant-collapse-header, [class*="collapse"] button, h2, h3, h4, div, span, p',
      secao.trim(),
      { timeout: 10000 }
    ).should('exist').scrollIntoView().should('be.visible')
    cy.log(`✓ Seção "${secao}" encontrada`)
  })
})

// ─── ETAPA FINAL — Valida existência dos dois botões de navegação ──────────────

Then('valida a existencia dos botões de edição {string} e {string}', (botao1, botao2) => {
  cy.contains('button, a', botao1.trim(), { timeout: 10000 }).should('be.visible')
  cy.log(`✓ Botão "${botao1}" visível`)

  cy.contains('button, a', botao2.trim(), { timeout: 10000 }).should('be.visible')
  cy.log(`✓ Botão "${botao2}" visível`)
})

