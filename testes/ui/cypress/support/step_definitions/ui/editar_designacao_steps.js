// "Editar" abre o passo 2 do assistente de designação (mesma tela usada ao
// criar uma designação) — não uma tela somente leitura separada.

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

