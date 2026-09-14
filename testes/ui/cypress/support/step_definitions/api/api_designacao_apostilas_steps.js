/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { numeroAleatorio } from '../../utils/dados_designacao'

// ============================================================================
// LISTAGEM — GET /designacao/apostilas/
// ============================================================================

When('eu listo as apostilas', () => {
  cy.signa_api_get('/designacao/apostilas/').then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu listo as apostilas sem token', () => {
  cy.signa_api_get('/designacao/apostilas/', { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a listagem de apostilas deve estar paginada com resultados em formato de array', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('count')
    expect(res.body).to.have.property('results')
    expect(res.body.results).to.be.an('array')
  })
})

// ============================================================================
// CRIAÇÃO — POST /designacao/apostilas/
// ============================================================================
// Payload confirmado em src/types/apostila.ts (ApostilaBody).

When('eu crio uma apostila vinculada à designação de apoio', () => {
  const ato_pai = Cypress.env('designacaoApoioId')

  const payload = {
    ato_pai,
    sei_numero: numeroAleatorio(7),
    observacao: 'Criado por automacao de testes de API - cy.signa_api',
  }

  cy.signa_api_post('/designacao/apostilas/', payload).then((res) => {
    cy.wrap(res).as('response')
    if (res.status === 200 || res.status === 201) {
      Cypress.env('apostilaCriadaId', res.body.id)
    }
  })
})

When('eu tento criar uma apostila sem informar o ato pai', () => {
  const payload = {
    sei_numero: numeroAleatorio(7),
    observacao: 'Criado por automacao de testes de API - cy.signa_api',
    // ato_pai propositalmente ausente
  }

  cy.signa_api_post('/designacao/apostilas/', payload).then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu tento criar uma apostila sem token', () => {
  const payload = {
    ato_pai: 1,
    sei_numero: numeroAleatorio(7),
  }

  cy.signa_api_post('/designacao/apostilas/', payload, { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a apostila criada deve retornar um id', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('id')
    expect(res.body.id).to.be.a('number')
  })
})

Then('a apostila deve ser recuperável pelo id retornado', () => {
  cy.get('@response').then((res) => {
    const id = res.body.id
    cy.signa_api_get(`/designacao/apostilas/${id}/`).then((getRes) => {
      expect(getRes.status).to.eq(200)
      expect(getRes.body.id).to.eq(id)
    })
  })
})

// ============================================================================
// EXCLUSÃO — DELETE /designacao/apostilas/{id}/
// ============================================================================

When('eu excluo a apostila criada', () => {
  const id = Cypress.env('apostilaCriadaId')
  cy.wrap(id).as('idApostilaExcluida')

  cy.signa_api_delete(`/designacao/apostilas/${id}/`).then((res) => {
    cy.wrap(res).as('response')
    if (res.status === 200 || res.status === 204) {
      Cypress.env('apostilaCriadaId', null)
    }
  })
})

Then('a apostila excluída não deve mais ser encontrada', () => {
  cy.get('@idApostilaExcluida').then((id) => {
    cy.signa_api_get(`/designacao/apostilas/${id}/`).then((getRes) => {
      expect(getRes.status).to.eq(404)
    })
  })
})
