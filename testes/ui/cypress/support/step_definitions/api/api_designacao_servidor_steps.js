/// <reference types="cypress" />

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { RF_SEM_CARGO_SOBREPOSTO_E_LOCAL_EXERCICIO } from '../../utils/dados_designacao'

// ============================================================================
// AUTENTICAÇÃO — API SIGNA (compartilhado entre as features de designação)
// ============================================================================

Given('que estou autenticado na API do SIGNA', () => {
  cy.signa_api_autenticar()
})

Given('que não estou autenticado na API do SIGNA', () => {
  Cypress.env('signaAuthToken', null)
})

// ============================================================================
// BUSCA DE SERVIDOR — POST /designacao/servidor
// ============================================================================
// O retry sobre o pool de RFs (endpoint instável em QA) vive em
// cy.signa_buscar_servidor_valido() (commands_signa.js), reaproveitado por
// esta feature e pelas de cessação/apostila/insubsistência.

When('eu busco um servidor válido do pool de RFs conhecidos', () => {
  cy.signa_buscar_servidor_valido().then((servidor) => {
    cy.wrap({ status: 200, body: servidor }).as('response')
    cy.wrap({ status: 200, body: servidor }).as('servidorResponse')
  })
})

When('eu busco o servidor pelo RF {string}', (rf) => {
  cy.signa_api_post('/designacao/servidor', { rf }).then((res) => {
    cy.wrap(res).as('response')
    cy.wrap(res).as('servidorResponse')
    Cypress.log({ name: 'POST', message: `servidor RF ${rf} → HTTP ${res.status}` })
  })
})

// RF real em QA confirmado sem cargo sobreposto nem local de exercício —
// usado para reproduzir de forma determinística o cenário de "ausência de
// dados da integração" (ver RF_SEM_CARGO_SOBREPOSTO_E_LOCAL_EXERCICIO em
// dados_designacao.js).
Given('que busco o servidor pelo RF conhecido sem cargo sobreposto e local de exercício', () => {
  cy.signa_api_post('/designacao/servidor', { rf: RF_SEM_CARGO_SOBREPOSTO_E_LOCAL_EXERCICIO }).then(
    (res) => {
      cy.wrap(res).as('response')
      cy.wrap(res).as('servidorResponse')
      Cypress.log({
        name: 'POST',
        message: `servidor RF ${RF_SEM_CARGO_SOBREPOSTO_E_LOCAL_EXERCICIO} → HTTP ${res.status}`,
      })
    }
  )
})

Then('o servidor retornado não deve ter cargo sobreposto nem local de exercício', () => {
  cy.get('@servidorResponse').then((res) => {
    expect(res.status, 'busca do servidor deveria retornar 200').to.eq(200)
    expect(
      res.body.cargo_sobreposto_funcao_atividade,
      'cargo sobreposto deveria estar ausente (null) — se a QA mudou esse dado, escolha outro RF de referência'
    ).to.be.oneOf([null, undefined, ''])
    expect(
      res.body.local_de_exercicio,
      'local de exercício deveria estar ausente (null) — se a QA mudou esse dado, escolha outro RF de referência'
    ).to.be.oneOf([null, undefined, ''])
  })
})

When('eu busco o servidor pelo RF {string} sem token', (rf) => {
  cy.signa_api_post('/designacao/servidor', { rf }, { semToken: true }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'POST sem auth', message: `servidor RF ${rf} → HTTP ${res.status}` })
  })
})

// ============================================================================
// ASSERTIVAS — API SIGNA (compartilhadas entre as features de designação)
// ============================================================================

Then('o status code da resposta do SIGNA deve ser {int}', (statusEsperado) => {
  cy.get('@response').then((res) => {
    expect(res.status).to.eq(statusEsperado)
  })
})

Then('o status da resposta do SIGNA deve ser {int} ou {int}', (statusA, statusB) => {
  cy.get('@response').then((res) => {
    expect(res.status, `status deveria ser ${statusA} ou ${statusB}`).to.be.oneOf([statusA, statusB])
  })
})

Then('a resposta do servidor deve ser um objeto com o RF pesquisado', () => {
  cy.get('@servidorResponse').then((res) => {
    expect(res.body).to.be.an('object')
    expect(res.body).to.have.property('rf')
    expect(String(res.body.rf)).to.match(/^\d+$/)
  })
})

Then('o servidor retornado deve ter os campos obrigatórios:', (dataTable) => {
  cy.get('@servidorResponse').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    campos.forEach((campo) => {
      expect(res.body, `Campo '${campo}' deve existir na resposta`).to.have.property(campo)
    })
  })
})

Then('registro se o servidor possui cargo sobreposto e local de exercício', () => {
  cy.get('@servidorResponse').then((res) => {
    const temCargoSobreposto = !!res.body.cargo_sobreposto_funcao_atividade
    const temLocalExercicio = !!res.body.local_de_exercicio

    Cypress.log({
      name: 'Condição observada',
      message: `RF ${res.body.rf}: cargo sobreposto=${temCargoSobreposto}, local de exercício=${temLocalExercicio}`,
    })

    if (!temCargoSobreposto || !temLocalExercicio) {
      cy.log(
        `⚠️ RF ${res.body.rf} retornado SEM cargo sobreposto e/ou local de exercício — condição do cenário original.`
      )
    } else {
      cy.log(
        `ℹ️ RF ${res.body.rf} retornado COM cargo sobreposto e local de exercício preenchidos.`
      )
    }
  })
})
