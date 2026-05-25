/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// STEPS ESPECÍFICOS — AutenticacaoSGP
// Usa RF configurado em .env como API_RF_LOGIN (padrão: 7704941)
// ============================================================================

const getLogin = () => Cypress.env('API_RF_LOGIN') || '7704941'

// GET /api/AutenticacaoSgp/{login}/dados
When('eu busco os dados SGP do login', () => {
  const login = getLogin()
  cy.api_get(`/api/AutenticacaoSgp/${login}/dados`).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET', message: `AutenticacaoSgp/${login}/dados → HTTP ${res.status}` })
  })
})

// GET /api/AutenticacaoSgp/CarregarPerfisPorLogin/{login}
When('eu carrego os perfis do login SGP', () => {
  const login = getLogin()
  cy.api_get(`/api/AutenticacaoSgp/CarregarPerfisPorLogin/${login}`).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET', message: `CarregarPerfisPorLogin/${login} → HTTP ${res.status}` })
  })
})

// GET /api/AutenticacaoSgp/{login}/obter/resumo
When('eu busco o resumo SGP do login', () => {
  const login = getLogin()
  cy.api_get(`/api/AutenticacaoSgp/${login}/obter/resumo`).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET', message: `AutenticacaoSgp/${login}/obter/resumo → HTTP ${res.status}` })
  })
})

// Cenário negativo — sem API key
When('eu tento acessar os dados SGP do login sem autenticação', () => {
  const login = getLogin()
  const baseUrl = Cypress.env('API_EOL_BASE_URL') || 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br'
  cy.request({
    method: 'GET',
    url: `${baseUrl}/api/AutenticacaoSgp/${login}/dados`,
    failOnStatusCode: false,
  }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET sem auth', message: `→ HTTP ${res.status}` })
  })
})

// ============================================================================
// ASSERTIVAS ESPECÍFICAS — AutenticacaoSGP
// ============================================================================

Then('a resposta deve conter dados do usuário SGP', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('object')
    expect(res.body).to.not.be.empty
    Cypress.log({ name: 'Validação', message: 'Dados do usuário SGP presentes na resposta' })
  })
})

Then('a resposta deve conter os campos obrigatórios do usuário SGP:', (dataTable) => {
  cy.get('@response').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    expect(res.body).to.be.an('object')
    campos.forEach((campo) => {
      expect(res.body, `Campo '${campo}' deve existir na resposta`).to.have.property(campo)
    })
    Cypress.log({ name: 'Validação', message: `Campos validados: ${campos.join(', ')}` })
  })
})

Then('a resposta deve conter perfis do usuário SGP', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.not.be.null
    expect(res.body).to.not.be.undefined
    Cypress.log({ name: 'Validação', message: 'Perfis do usuário SGP retornados' })
  })
})
