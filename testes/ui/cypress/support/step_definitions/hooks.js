// Hooks globais do Cucumber (aplicam-se a todas as features)

import { AfterStep } from '@badeball/cypress-cucumber-preprocessor'

// Pausa após CADA step Gherkin, não só cliques/digitação (commands_slowmo.js)
// — senão steps de asserção resolvem instantâneo, impossível acompanhar no
// cypress open. Desativado no CI.
const SLOW_MO_ATIVO = !Cypress.env('CI')
const SLOW_MO_STEP_MS =
  Number(Cypress.env('slowMoStepMs')) || Number(Cypress.env('slowMoMs')) || 500

AfterStep(() => {
  if (SLOW_MO_ATIVO && SLOW_MO_STEP_MS > 0) {
    cy.wait(SLOW_MO_STEP_MS, { log: false })
  }
})
