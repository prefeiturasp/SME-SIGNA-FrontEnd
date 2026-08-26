/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { UNIDADE_REFERENCIA } from '../../utils/dados_designacao'

When('eu busco os dados da unidade pelo código UE conhecido', () => {
  cy.signa_api_get(`/designacao/unidade/?codigo_ue=${UNIDADE_REFERENCIA.ue}`).then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu busco os dados da unidade pelo código UE conhecido sem token', () => {
  cy.signa_api_get(`/designacao/unidade/?codigo_ue=${UNIDADE_REFERENCIA.ue}`, { semToken: true }).then(
    (res) => {
      cy.wrap(res).as('response')
    }
  )
})

When('eu busco os dados da unidade pelo código UE {string}', (codigoUe) => {
  cy.signa_api_get(`/designacao/unidade/?codigo_ue=${codigoUe}`).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a resposta da unidade deve conter a lista de cargos', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('cargos')
    expect(res.body.cargos).to.be.an('array')
  })
})

When('eu listo os cargos de unidade', () => {
  cy.signa_api_get('/designacao/unidade/cargos/').then((res) => {
    cy.wrap(res).as('response')
  })
})
