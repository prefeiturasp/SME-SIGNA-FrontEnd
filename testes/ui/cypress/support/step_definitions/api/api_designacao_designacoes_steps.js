/// <reference types="cypress" />

import { Given, When, Then, After } from '@badeball/cypress-cucumber-preprocessor'
import {
  UNIDADE_REFERENCIA,
  PORTARIA_EXISTENTE,
  CARGO_VAGA_REFERENCIA,
  numeroAleatorio,
  montarPayloadDesignacao,
} from '../../utils/dados_designacao'

// ============================================================================
// LISTAGEM — GET /designacao/designacoes/
// ============================================================================

When('eu listo as designações', () => {
  cy.signa_api_get('/designacao/designacoes/').then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu listo as designações sem token', () => {
  cy.signa_api_get('/designacao/designacoes/', { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a listagem de designações deve estar paginada com resultados em formato de array', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('count')
    expect(res.body).to.have.property('results')
    expect(res.body.results).to.be.an('array')
  })
})

// ============================================================================
// BUSCA POR PORTARIA — GET /designacao/designacoes/buscar-por-portaria/
// ============================================================================

When('eu busco uma designação existente por portaria e ano conhecidos', () => {
  const { portaria, ano } = PORTARIA_EXISTENTE
  cy.signa_api_get(
    `/designacao/designacoes/buscar-por-portaria/?portaria=${portaria}&ano=${ano}`
  ).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a resposta deve conter os dados da portaria pesquisada', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('numero_portaria', PORTARIA_EXISTENTE.portaria)
  })
})

When('eu busco uma designação por portaria inexistente', () => {
  cy.signa_api_get(
    '/designacao/designacoes/buscar-por-portaria/?portaria=0000000&ano=2026'
  ).then((res) => {
    cy.wrap(res).as('response')
  })
})

// ============================================================================
// LISTAGENS AUXILIARES
// ============================================================================

const LISTAGENS_AUXILIARES = {
  'cargos base pareados': '/designacao/designacoes/cargos-base-pareados/',
  'cargos sobrepostos pareados': '/designacao/designacoes/cargos-sobrepostos-pareados/',
  impedimentos: '/designacao/designacoes/impedimentos/',
}

When('eu consulto a listagem auxiliar {string} de designação', (nomeListagem) => {
  const path = LISTAGENS_AUXILIARES[nomeListagem]
  if (!path) {
    throw new Error(`Listagem auxiliar desconhecida: "${nomeListagem}"`)
  }
  cy.signa_api_get(path).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a resposta do SIGNA deve ser um array', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
  })
})

// ============================================================================
// CRIAÇÃO — POST /designacao/designacoes/
// ============================================================================
// Monta o payload no mesmo formato de mapearPayloadDesignacao
// (src/utils/designacao/mapearPayload.ts): dados do indicado vêm da busca de
// servidor (@servidorResponse, já preenchida pelo step "eu busco um servidor
// válido do pool de RFs conhecidos" em api_designacao_servidor_steps.js),
// dados de unidade vêm de UNIDADE_REFERENCIA (combinação real e conhecida em
// QA), tipo_vaga=VAGO evita precisar de um segundo servidor "titular".

When('monto o payload de criação da designação com os dados coletados', () => {
  cy.get('@servidorResponse').then((res) => {
    cy.wrap(montarPayloadDesignacao(res.body)).as('payloadDesignacao')
  })
})

Given('removo o campo de cargo sobreposto do indicado no payload', () => {
  cy.get('@payloadDesignacao').then((payload) => {
    delete payload.indicado_cargo_sobreposto
    delete payload.indicado_codigo_cargo_sobreposto

    cy.wrap(payload).as('payloadDesignacao')
    Cypress.log({
      name: 'Payload ajustado',
      message: 'cargo sobreposto do indicado removido do payload',
    })
  })
})

// Confirma o erro de validação do bug conhecido: indicado_local_exercicio é
// obrigatório no backend, mesmo quando a integração não retorna esse dado
// (ver Cenário "BUG - ..." em api_designacao_designacoes.feature).
Then('a resposta deve indicar que o campo de local de exercício é obrigatório', () => {
  cy.get('@response').then((res) => {
    expect(res.body, JSON.stringify(res.body)).to.have.property('indicado_local_exercicio')
  })
})

When('eu crio a designação', () => {
  cy.get('@payloadDesignacao').then((payload) => {
    cy.signa_api_post('/designacao/designacoes/', payload).then((res) => {
      cy.wrap(res).as('response')
      if (res.status === 200 || res.status === 201) {
        Cypress.env('designacaoCriadaId', res.body.id)
      }
    })
  })
})

When('eu tento criar uma designação sem o RF do indicado', () => {
  const payloadIncompleto = {
    dre_nome: UNIDADE_REFERENCIA.dre_nome,
    unidade_proponente: UNIDADE_REFERENCIA.unidade_proponente,
    dre: UNIDADE_REFERENCIA.dre,
    ue: UNIDADE_REFERENCIA.ue,
    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    tipo_vaga: 'VAGO',
    cargo_vaga: CARGO_VAGA_REFERENCIA.codigo,
    // indicado_rf propositalmente ausente
  }

  cy.signa_api_post('/designacao/designacoes/', payloadIncompleto).then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu tento criar uma designação sem token', () => {
  const payload = {
    dre: UNIDADE_REFERENCIA.dre,
    ue: UNIDADE_REFERENCIA.ue,
    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    tipo_vaga: 'VAGO',
    cargo_vaga: CARGO_VAGA_REFERENCIA.codigo,
  }

  cy.signa_api_post('/designacao/designacoes/', payload, { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a designação criada deve retornar um id', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('id')
    expect(res.body.id).to.be.a('number')
  })
})

Then('a designação deve ser recuperável pelo id retornado', () => {
  cy.get('@response').then((res) => {
    const id = res.body.id
    cy.signa_api_get(`/designacao/designacoes/${id}/`).then((getRes) => {
      expect(getRes.status).to.eq(200)
      expect(getRes.body.id).to.eq(id)
    })
  })
})

// ============================================================================
// ATUALIZAÇÃO — PATCH /designacao/designacoes/{id}/
// ============================================================================

When('eu atualizo a designação criada alterando {string} para um texto aleatório', (campo) => {
  const id = Cypress.env('designacaoCriadaId')
  const novoValor = `Atualizado por automacao - ${numeroAleatorio(6)}`

  cy.signa_api_patch(`/designacao/designacoes/${id}/`, { [campo]: novoValor }).then((res) => {
    cy.wrap(res).as('response')
    cy.wrap(novoValor).as('valorAtualizado')
    cy.wrap(campo).as('campoAtualizado')
  })
})

Then('a alteração deve estar refletida na designação ao consultar novamente', () => {
  const id = Cypress.env('designacaoCriadaId')

  cy.get('@campoAtualizado').then((campo) => {
    cy.get('@valorAtualizado').then((valorEsperado) => {
      cy.signa_api_get(`/designacao/designacoes/${id}/`).then((getRes) => {
        expect(getRes.status).to.eq(200)
        expect(getRes.body[campo]).to.eq(valorEsperado)
      })
    })
  })
})

// ============================================================================
// EXCLUSÃO — DELETE /designacao/designacoes/{id}/
// ============================================================================

When('eu excluo a designação criada', () => {
  const id = Cypress.env('designacaoCriadaId')
  cy.wrap(id).as('idExcluido')

  cy.signa_api_delete(`/designacao/designacoes/${id}/`).then((res) => {
    cy.wrap(res).as('response')
    if (res.status === 200 || res.status === 204) {
      Cypress.env('designacaoCriadaId', null)
    }
  })
})

Then('a designação excluída não deve mais ser encontrada', () => {
  cy.get('@idExcluido').then((id) => {
    cy.signa_api_get(`/designacao/designacoes/${id}/`).then((getRes) => {
      expect(getRes.status).to.eq(404)
    })
  })
})

// Cleanup de segurança: se alguma asserção falhar entre a criação e a
// exclusão explícita no cenário, este hook garante que a designação criada
// no teste não fique órfã em QA.
After({ tags: '@ciclo_de_vida or @dados_opcionais_ausentes' }, function () {
  const id = Cypress.env('designacaoCriadaId')
  if (!id) return

  cy.signa_api_delete(`/designacao/designacoes/${id}/`).then(() => {
    Cypress.env('designacaoCriadaId', null)
    Cypress.log({ name: 'Cleanup', message: `Designação órfã ${id} removida no After hook` })
  })
})
