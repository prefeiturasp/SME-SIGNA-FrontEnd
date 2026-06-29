// Step Definitions — Editar Designação
// Steps reutilizados de outros arquivos:
//   • "que o usuário está autenticado"           → common_steps.js
//   • "que o usuário está na página do dashboard"→ common_steps.js
//   • "valida a existencia do Texto"             → common_steps.js (lowercase v, capital T)
//   • "Valida a existencia da Tabela"            → common_steps.js
//   • "Valida a existencia das Colunas"          → cessacao_steps.js
//   • "navega para a seção Action"               → cessacao_steps.js
//   • "clica e seleciona a opção"                → cessacao_steps.js
//   • "o sistema exibe a Tela"                   → common_steps.js
//   • "clica em"                                 → designacao_steps.js

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { editarDesignacaoLocators } from '../../ui/locators/editar_designacao_locators'

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

// ─── ETAPA 5 — Valida presença de campo por texto de label ────────────────────

Then('valida a existencia do campo {string}', (textoLabel) => {
  cy.contains(
    'label, span, p, h4, h5',
    textoLabel.trim(),
    { timeout: 10000 }
  ).should('be.visible')
  cy.log(`✓ Campo "${textoLabel}" encontrado`)
})

// ─── ETAPA 5 — Valida as duas opções de tipo de cargo ─────────────────────────

Then('valida as opções de tipo de cargo {string} e {string}', (opcao1, opcao2) => {
  cy.contains(
    '.ant-radio-wrapper, label, [role="radio"]',
    opcao1.trim(),
    { timeout: 8000 }
  ).should('be.visible')
  cy.log(`✓ Opção de cargo "${opcao1}" visível`)

  cy.contains(
    '.ant-radio-wrapper, label, [role="radio"]',
    opcao2.trim(),
    { timeout: 8000 }
  ).should('be.visible')
  cy.log(`✓ Opção de cargo "${opcao2}" visível`)
})

// ─── ETAPA FINAL — Valida existência dos dois botões de navegação ──────────────

Then('valida a existencia dos botões de edição {string} e {string}', (botao1, botao2) => {
  cy.contains('button, a', botao1.trim(), { timeout: 10000 }).should('be.visible')
  cy.log(`✓ Botão "${botao1}" visível`)

  cy.contains('button, a', botao2.trim(), { timeout: 10000 }).should('be.visible')
  cy.log(`✓ Botão "${botao2}" visível`)
})

// ─── ETAPA FINAL — Validação pós-clique em Avançar ───────────────────────────

Then('o sistema avança o fluxo de edição sem erros', () => {
  cy.wait(3000)

  cy.get('body').then($body => {
    const temErro = $body.find(
      '.ant-message-error, .ant-notification-notice-error, [class*="error-message"]'
    ).length > 0

    if (temErro) {
      cy.get('.ant-message-error, .ant-notification-notice-error, [class*="error-message"]')
        .first().then($el => {
          throw new Error(`Avanço de edição falhou: ${$el.text().trim()}`)
        })
    } else {
      cy.log('✓ Fluxo de edição avançou sem erros visíveis')
    }
  })
})
