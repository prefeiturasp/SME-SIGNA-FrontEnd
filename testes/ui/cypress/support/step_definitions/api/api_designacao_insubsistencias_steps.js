/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { PORTARIA_INSUBSISTENCIA_EXISTENTE, numeroAleatorio } from '../../utils/dados_designacao'

// ============================================================================
// LISTAGEM — GET /designacao/insubsistencias/
// ============================================================================

When('eu listo as insubsistências', () => {
  cy.signa_api_get('/designacao/insubsistencias/').then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu listo as insubsistências sem token', () => {
  cy.signa_api_get('/designacao/insubsistencias/', { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a listagem de insubsistências deve estar paginada com resultados em formato de array', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('count')
    expect(res.body).to.have.property('results')
    expect(res.body.results).to.be.an('array')
  })
})

// ============================================================================
// BUSCA POR PORTARIA — GET /designacao/insubsistencias/buscar-por-portaria/
// ============================================================================

When('eu busco uma insubsistência existente por portaria e ano conhecidos', () => {
  const { portaria, ano } = PORTARIA_INSUBSISTENCIA_EXISTENTE
  cy.signa_api_get(
    `/designacao/insubsistencias/buscar-por-portaria/?portaria=${portaria}&ano=${ano}`
  ).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a resposta deve conter os dados da insubsistência pesquisada', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('numero_portaria', PORTARIA_INSUBSISTENCIA_EXISTENTE.portaria)
  })
})

When('eu busco uma insubsistência por portaria inexistente', () => {
  cy.signa_api_get(
    '/designacao/insubsistencias/buscar-por-portaria/?portaria=0000000&ano=2026'
  ).then((res) => {
    cy.wrap(res).as('response')
  })
})

// ============================================================================
// CRIAÇÃO — POST /designacao/insubsistencias/
// ============================================================================
// Payload confirmado em src/types/insubsistencia.ts (InsubsistenciaBody).

When('eu crio uma insubsistência vinculada à designação de apoio', () => {
  const ato_pai = Cypress.env('designacaoApoioId')

  const payload = {
    ato_pai,
    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    sei_numero: numeroAleatorio(7),
    observacoes: 'Criado por automacao de testes de API - cy.signa_api',
  }

  cy.signa_api_post('/designacao/insubsistencias/', payload).then((res) => {
    cy.wrap(res).as('response')
    if (res.status === 200 || res.status === 201) {
      Cypress.env('insubsistenciaCriadaId', res.body.id)
    }
  })
})

When('eu tento criar uma insubsistência sem informar o ato pai', () => {
  const payload = {
    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    sei_numero: numeroAleatorio(7),
    observacoes: 'Criado por automacao de testes de API - cy.signa_api',
    // ato_pai propositalmente ausente
  }

  cy.signa_api_post('/designacao/insubsistencias/', payload).then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu tento criar uma insubsistência sem token', () => {
  const payload = {
    ato_pai: 1,
    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    sei_numero: numeroAleatorio(7),
  }

  cy.signa_api_post('/designacao/insubsistencias/', payload, { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a insubsistência criada deve retornar um id', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('id')
    expect(res.body.id).to.be.a('number')
  })
})

Then('a insubsistência deve ser recuperável pelo id retornado', () => {
  cy.get('@response').then((res) => {
    const id = res.body.id
    cy.signa_api_get(`/designacao/insubsistencias/${id}/`).then((getRes) => {
      expect(getRes.status).to.eq(200)
      expect(getRes.body.id).to.eq(id)
    })
  })
})

// ============================================================================
// EXCLUSÃO — DELETE /designacao/insubsistencias/{id}/
// ============================================================================

When('eu excluo a insubsistência criada', () => {
  const id = Cypress.env('insubsistenciaCriadaId')
  cy.wrap(id).as('idInsubsistenciaExcluida')

  cy.signa_api_delete(`/designacao/insubsistencias/${id}/`).then((res) => {
    cy.wrap(res).as('response')
    if (res.status === 200 || res.status === 204) {
      Cypress.env('insubsistenciaCriadaId', null)
    }
  })
})

Then('a insubsistência excluída não deve mais ser encontrada', () => {
  cy.get('@idInsubsistenciaExcluida').then((id) => {
    cy.signa_api_get(`/designacao/insubsistencias/${id}/`).then((getRes) => {
      expect(getRes.status).to.eq(404)
    })
  })
})
