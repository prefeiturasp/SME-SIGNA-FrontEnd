/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// STEPS ESPECÍFICOS — Acessos
// ============================================================================

const getLogin = () => Cypress.env('API_RF_LOGIN') || '7704941'

// GET /api/acessos/funcionario-ativo/{registroFuncional}
When('eu verifico se o funcionário está ativo pelo RF', () => {
  const login = getLogin()
  cy.api_get(`/api/acessos/funcionario-ativo/${login}`).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET', message: `acessos/funcionario-ativo/${login} → HTTP ${res.status}` })
  })
})

// ============================================================================
// ASSERTIVAS ESPECÍFICAS — Acessos
// ============================================================================

Then('a resposta deve indicar se o funcionário está ativo', () => {
  cy.get('@response').then((res) => {
    // A API retorna true/false ou um objeto com campo ativo
    const body = res.body
    const isBoolean = typeof body === 'boolean'
    const isObject = typeof body === 'object' && body !== null
    expect(isBoolean || isObject, 'Resposta deve ser boolean ou objeto').to.be.true
    Cypress.log({ name: 'Validação', message: `Funcionário ativo: ${JSON.stringify(body)}` })
  })
})
