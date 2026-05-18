/// <reference types="cypress" />

import { Given, When, Then, Before } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// HOOKS
// ============================================================================

Before({ tags: '@api' }, function () {
  Cypress.env('authToken', null)
  this.testStart = Date.now()
})

// ============================================================================
// AUTENTICAÇÃO — steps globais reutilizados por todas as features de API
// ============================================================================

Given('que possuo credenciais válidas de autenticação', () => {
  const isCI = Cypress.env('CI')
  const apiKey = Cypress.env('API_EOL_KEY')

  if (!apiKey) {
    const msg = isCI
      ? '❌ [CI] API_EOL_KEY ausente! Verifique o secret "cypress_env_signa" no Jenkins'
      : '❌ [Local] API_EOL_KEY ausente! Verifique o arquivo .env'
    throw new Error(msg)
  }

  Cypress.log({
    name: 'Credenciais EOL',
    message: `API Key disponível [${isCI ? 'CI/Jenkins' : 'local'}]`,
  })
})

Given('que estou autenticado na API', function () {
  return cy.api_autenticar().then((apiKey) => {
    Cypress.env('authToken', apiKey)
    Cypress.log({ name: 'Autenticação', message: 'API Key configurada para uso nas requisições' })
  })
})

Given('que não estou autenticado', () => {
  Cypress.env('authToken', null)
  Cypress.log({ name: 'Autenticação', message: 'Token removido — simulando requisição sem auth' })
})

// ============================================================================
// REQUISIÇÕES GENÉRICAS
// ============================================================================

When('eu faço uma requisição GET para {string}', (path) => {
  cy.api_get(path).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET', message: `${path} → HTTP ${res.status}` })
  })
})

When('eu tento acessar {string} sem token', (path) => {
  const baseUrl = Cypress.env('API_EOL_BASE_URL') || 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br'
  cy.request({
    method: 'GET',
    url: path.startsWith('http') ? path : `${baseUrl}${path}`,
    failOnStatusCode: false,
  }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET sem auth', message: `→ HTTP ${res.status}` })
  })
})

// ============================================================================
// ASSERTIVAS GENÉRICAS
// ============================================================================

Then('o status code da resposta deve ser {int}', (statusCode) => {
  cy.get('@response').its('status').should('eq', statusCode)
})

Then('o status da resposta deve ser {int} ou {int}', (s1, s2) => {
  cy.get('@response').its('status').then((status) => {
    expect([s1, s2], `Status deve ser ${s1} ou ${s2}`).to.include(status)
  })
})

Then('a resposta deve ser um array', () => {
  cy.get('@response').its('body').should('be.an', 'array')
})

Then('a resposta deve ser um objeto', () => {
  cy.get('@response').its('body').should('be.an', 'object')
})

Then('a lista não deve estar vazia', () => {
  cy.get('@response').its('body').should('have.length.greaterThan', 0)
})

Then('o tempo de resposta deve ser menor que {int} milissegundos', (ms) => {
  cy.get('@response').its('duration').should('be.lessThan', ms)
})

Then('o header Content-Type deve conter {string}', (valor) => {
  cy.get('@response').its('headers').its('content-type').should('include', valor)
})

// ============================================================================
// FIXTURES — DRE aleatória e DRE válida da listagem
// ============================================================================

When('eu obtenho um código de DRE aleatório da lista', function () {
  cy.fixture('dres.json').then((fixture) => {
    const indice = Math.floor(Math.random() * fixture.dres.length)
    const dreAleatoria = fixture.dres[indice]
    cy.wrap(dreAleatoria.codigo).as('codigoDREAleatorio')
    Cypress.log({ name: 'DRE Aleatória', message: `${dreAleatoria.codigo} — ${dreAleatoria.nome}` })
  })
})

When('eu obtenho um código de DRE válido da listagem', function () {
  cy.api_get('/api/DREs').then((res) => {
    expect(res.status).to.equal(200)
    const dres = Array.isArray(res.body) ? res.body : []
    expect(dres.length).to.be.greaterThan(0)
    const dre = dres[0]
    cy.wrap(dre.codigoDRE).as('codigoDRE')
    Cypress.log({ name: 'DRE Válida', message: `${dre.codigoDRE} — ${dre.nomeDRE}` })
  })
})

Then('a resposta deve retornar status {int}', (statusEsperado) => {
  cy.get('@response').its('status').should('eq', statusEsperado)
})

Then('a resposta deve retornar status {int} ou {int}', (s1, s2) => {
  cy.get('@response').its('status').then((status) => {
    expect([s1, s2], `Status deve ser ${s1} ou ${s2}`).to.include(status)
  })
})
