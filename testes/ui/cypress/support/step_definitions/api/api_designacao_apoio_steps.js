/// <reference types="cypress" />

import { Given, After } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// DESIGNAÇÃO "DE APOIO" — pré-requisito compartilhado entre cessação,
// apostila e insubsistência (todas exigem um ato_pai/designação já existente).
// ============================================================================

Given('que existe uma designação de apoio válida para este teste', () => {
  cy.signa_criar_designacao_de_apoio()
})

Given('excluo a designação de apoio criada para este teste', () => {
  cy.signa_excluir_designacao_de_apoio()
})

// Cleanup de segurança: garante que a designação de apoio não fique órfã em
// QA se alguma asserção falhar antes do step explícito de exclusão.
After(
  { tags: '@usa_designacao_de_apoio' },
  function () {
    cy.signa_excluir_designacao_de_apoio()
  }
)
