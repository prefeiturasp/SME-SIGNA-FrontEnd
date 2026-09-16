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

// O endpoint não valida a existência do código UE: responde 200 com um
// catálogo genérico de cargos, mas codigo_hierarquico vem nulo — é esse
// campo que sinaliza "UE não encontrada" (confirmado manualmente contra QA
// em 2026-08-27, código "000000").
Then('a resposta da unidade deve indicar código hierárquico ausente', () => {
  cy.get('@response').then((res) => {
    expect(res.body.codigo_hierarquico, 'codigo_hierarquico deveria ser nulo para UE inexistente').to.be.null
  })
})

When('eu listo os cargos de unidade', () => {
  cy.signa_api_get('/designacao/unidade/cargos/').then((res) => {
    cy.wrap(res).as('response')
  })
})
