/// <reference types="cypress" />

import { Then } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// ASSERTIVAS ESPECÍFICAS — Abrangencia
// ============================================================================

Then('cada item da abrangência deve ter os campos:', (dataTable) => {
  cy.get('@response').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    expect(res.body).to.be.an('array')
    expect(res.body.length).to.be.greaterThan(0)

    res.body.forEach((item) => {
      campos.forEach((campo) => {
        expect(item, `Item deve ter o campo '${campo}'`).to.have.property(campo)
      })
    })

    Cypress.log({ name: 'Validação', message: `${res.body.length} itens validados com campos: ${campos.join(', ')}` })
  })
})
