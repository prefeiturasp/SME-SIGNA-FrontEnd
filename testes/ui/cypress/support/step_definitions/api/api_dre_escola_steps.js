/// <reference types="cypress" />

import { Then } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// ASSERTIVAS ESPECÍFICAS — DRE e Escola
// ============================================================================

Then('cada DRE deve ter os campos obrigatórios:', (dataTable) => {
  cy.get('@response').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    expect(res.body).to.be.an('array')
    expect(res.body.length).to.be.greaterThan(0)

    res.body.forEach((dre) => {
      campos.forEach((campo) => {
        expect(dre, `DRE deve ter o campo '${campo}'`).to.have.property(campo)
      })
    })

    Cypress.log({ name: 'Validação', message: `${res.body.length} DREs validadas com campos: ${campos.join(', ')}` })
  })
})
