/// <reference types="cypress" />

import { When } from '@badeball/cypress-cucumber-preprocessor'

When('eu listo as portarias', () => {
  cy.signa_api_get('/designacao/portarias/').then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu listo as portarias sem token', () => {
  cy.signa_api_get('/designacao/portarias/', { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})
