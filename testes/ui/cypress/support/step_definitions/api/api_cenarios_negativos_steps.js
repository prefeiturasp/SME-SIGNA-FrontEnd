/// <reference types="cypress" />

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// STEPS ESPECÍFICOS — Cenários Negativos
// ============================================================================

// ---------------------------------------------------------------------------
// AUTENTICAÇÃO INVÁLIDA
// ---------------------------------------------------------------------------

Given('que uso uma chave de API inválida {string}', (invalidKey) => {
  Cypress.env('authToken', invalidKey)
  Cypress.log({ name: 'Auth Inválida', message: `Chave sobrescrita: ${invalidKey}` })
})

// ---------------------------------------------------------------------------
// MÉTODO HTTP GENÉRICO (POST, PUT, DELETE, PATCH, etc.)
// ---------------------------------------------------------------------------

When('eu faço uma requisição {string} para {string}', (method, path) => {
  cy.api_request(method.toUpperCase(), path).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: method.toUpperCase(), message: `${path} → HTTP ${res.status}` })
  })
})

// ---------------------------------------------------------------------------
// SEGURANÇA
// ---------------------------------------------------------------------------

Then('a resposta deve indicar funcionário inativo ou não encontrado', () => {
  cy.get('@response').then((res) => {
    const body = res.body
    const isExplicitFalse = body === false
    const isInactiveObject =
      typeof body === 'object' && body !== null && body.ativo === false
    const isNullOrEmpty = body === null || body === '' || (Array.isArray(body) && body.length === 0)
    expect(
      isExplicitFalse || isInactiveObject || isNullOrEmpty,
      `Resposta deve indicar não encontrado/inativo. Recebido: ${JSON.stringify(body)}`
    ).to.be.true
    Cypress.log({ name: 'Validação', message: `Funcionário inativo/não encontrado: ${JSON.stringify(body)}` })
  })
})

Then('a resposta deve ser nula ou vazia', () => {
  cy.get('@response').then((res) => {
    const body = res.body
    const isNull = body === null || body === undefined
    const isEmptyArray = Array.isArray(body) && body.length === 0
    const isEmptyObject = typeof body === 'object' && body !== null && !Array.isArray(body) && Object.keys(body).length === 0
    const isFalse = body === false
    expect(
      isNull || isEmptyArray || isEmptyObject || isFalse,
      `Resposta deve ser nula/vazia para recurso inexistente. Recebido: ${JSON.stringify(body)}`
    ).to.be.true
    Cypress.log({ name: 'Validação', message: `Resposta nula/vazia confirmada: ${JSON.stringify(body)}` })
  })
})

Then('a resposta não deve expor informações de erro interno', () => {
  cy.get('@response').then((res) => {
    const body =
      typeof res.body === 'string' ? res.body : JSON.stringify(res.body || '')

    const padroesSensiveis = [
      'StackTrace',
      'System.Exception',
      'System.Data',
      'Microsoft.',
      'InnerException',
      'Server Error in',
      'Object reference not set',
      'SQLException',
      'NullReferenceException',
    ]

    padroesSensiveis.forEach((padrao) => {
      expect(body, `Resposta não deve conter '${padrao}'`).to.not.include(padrao)
    })

    Cypress.log({ name: 'Segurança', message: 'Resposta não expõe informações internas do servidor' })
  })
})
