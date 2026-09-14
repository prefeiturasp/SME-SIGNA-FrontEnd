/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { PORTARIA_CESSACAO_EXISTENTE, numeroAleatorio } from '../../utils/dados_designacao'

// ============================================================================
// LISTAGEM — GET /designacao/cessacoes/
// ============================================================================

When('eu listo as cessações', () => {
  cy.signa_api_get('/designacao/cessacoes/').then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu listo as cessações sem token', () => {
  cy.signa_api_get('/designacao/cessacoes/', { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a listagem de cessações deve estar paginada com resultados em formato de array', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('count')
    expect(res.body).to.have.property('results')
    expect(res.body.results).to.be.an('array')
  })
})

// ============================================================================
// BUSCA POR PORTARIA — GET /designacao/cessacoes/buscar-por-portaria/
// ============================================================================

When('eu busco uma cessação existente por portaria e ano conhecidos', () => {
  const { portaria, ano } = PORTARIA_CESSACAO_EXISTENTE
  cy.signa_api_get(
    `/designacao/cessacoes/buscar-por-portaria/?portaria=${portaria}&ano=${ano}`
  ).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a resposta deve conter os dados da cessação pesquisada', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('numero_portaria', PORTARIA_CESSACAO_EXISTENTE.portaria)
  })
})

When('eu busco uma cessação por portaria inexistente', () => {
  cy.signa_api_get(
    '/designacao/cessacoes/buscar-por-portaria/?portaria=0000000&ano=2026'
  ).then((res) => {
    cy.wrap(res).as('response')
  })
})

// ============================================================================
// CRIAÇÃO — POST /designacao/cessacoes/
// ============================================================================
// Payload confirmado em src/utils/cessacao/mapearPayloadCessacao.ts.

When('eu crio uma cessação vinculada à designação de apoio', () => {
  const ato_pai = Cypress.env('designacaoApoioId')

  const payload = {
    ato_pai,
    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    sei_numero: numeroAleatorio(7),
    data_cessacao: new Date().toISOString().split('T')[0],
    a_pedido: false,
    remocao: false,
    aposentadoria: false,
  }

  cy.signa_api_post('/designacao/cessacoes/', payload).then((res) => {
    cy.wrap(res).as('response')
    if (res.status === 200 || res.status === 201) {
      Cypress.env('cessacaoCriadaId', res.body.id)
    }
  })
})

When('eu tento criar uma cessação sem informar o ato pai', () => {
  const payload = {
    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    sei_numero: numeroAleatorio(7),
    data_cessacao: new Date().toISOString().split('T')[0],
    a_pedido: false,
    remocao: false,
    aposentadoria: false,
    // ato_pai propositalmente ausente
  }

  cy.signa_api_post('/designacao/cessacoes/', payload).then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu tento criar uma cessação sem token', () => {
  const payload = {
    ato_pai: 1,
    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    sei_numero: numeroAleatorio(7),
  }

  cy.signa_api_post('/designacao/cessacoes/', payload, { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a cessação criada deve retornar um id', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('id')
    expect(res.body.id).to.be.a('number')
  })
})

Then('a cessação deve ser recuperável pelo id retornado', () => {
  cy.get('@response').then((res) => {
    const id = res.body.id
    cy.signa_api_get(`/designacao/cessacoes/${id}/`).then((getRes) => {
      expect(getRes.status).to.eq(200)
      expect(getRes.body.id).to.eq(id)
    })
  })
})

// ============================================================================
// EXCLUSÃO — DELETE /designacao/cessacoes/{id}/
// ============================================================================

When('eu excluo a cessação criada', () => {
  const id = Cypress.env('cessacaoCriadaId')
  cy.wrap(id).as('idCessacaoExcluida')

  cy.signa_api_delete(`/designacao/cessacoes/${id}/`).then((res) => {
    cy.wrap(res).as('response')
    if (res.status === 200 || res.status === 204) {
      Cypress.env('cessacaoCriadaId', null)
    }
  })
})

Then('a cessação excluída não deve mais ser encontrada', () => {
  cy.get('@idCessacaoExcluida').then((id) => {
    cy.signa_api_get(`/designacao/cessacoes/${id}/`).then((getRes) => {
      expect(getRes.status).to.eq(404)
    })
  })
})
