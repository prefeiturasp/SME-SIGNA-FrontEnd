/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

When('eu listo os atos administrativos', () => {
  cy.signa_api_get('/designacao/atos-administrativos/').then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu listo os atos administrativos sem token', () => {
  cy.signa_api_get('/designacao/atos-administrativos/', { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a listagem de atos administrativos deve estar paginada com resultados em formato de array', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('count')
    expect(res.body).to.have.property('results')
    expect(res.body.results).to.be.an('array')
  })
})

Then('cada ato administrativo deve ter os campos obrigatórios:', (dataTable) => {
  cy.get('@response').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    expect(res.body.results.length, 'listagem deve ter ao menos 1 resultado para validar campos').to.be.greaterThan(0)

    res.body.results.forEach((ato) => {
      campos.forEach((campo) => {
        expect(ato, `Campo '${campo}' deve existir em cada ato administrativo`).to.have.property(campo)
      })
    })
  })
})
