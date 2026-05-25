/// <reference types="cypress" />

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// STEPS ESPECÍFICOS — Cenários Negativos
// ============================================================================

// ---------------------------------------------------------------------------
// AUTENTICAÇÃO INVÁLIDA
// ---------------------------------------------------------------------------

/**
 * Configura uma chave de API inválida para a próxima requisição.
 * cy.api_request() lê Cypress.env('authToken') como x-api-eol-key.
 * Ao sobrescrever com um valor inválido, a API deve rejeitar com 401/403.
 */
Given('que uso uma chave de API inválida {string}', (invalidKey) => {
  Cypress.env('authToken', invalidKey)
  Cypress.log({ name: 'Auth Inválida', message: `Chave sobrescrita: ${invalidKey}` })
})

// ---------------------------------------------------------------------------
// MÉTODO HTTP GENÉRICO (POST, PUT, DELETE, PATCH, etc.)
// ---------------------------------------------------------------------------

/**
 * Envia uma requisição com qualquer método HTTP para o path informado.
 * Reutiliza cy.api_request() que já trata auth e base URL.
 * Diferente do step existente que usa somente GET.
 */
When('eu faço uma requisição {string} para {string}', (method, path) => {
  cy.api_request(method.toUpperCase(), path).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: method.toUpperCase(), message: `${path} → HTTP ${res.status}` })
  })
})

// ---------------------------------------------------------------------------
// SEGURANÇA
// ---------------------------------------------------------------------------

/**
 * Valida que a resposta indica funcionário inativo ou não encontrado.
 * A API retorna `false` (booleano) ou objeto com ativo=false para RF inexistente.
 */
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

/**
 * Valida que a resposta é nula, objeto vazio ou array vazio,
 * indicando que o recurso inexistente não foi retornado.
 */
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

/**
 * Garante que a resposta não vaza informações internas do servidor.
 * Verifica ausência de stack traces, nomes de classes .NET, mensagens
 * de exceção e outros padrões típicos de respostas inseguras.
 */
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
