// Hooks globais do Cucumber (aplicam-se a todas as features)

import { AfterStep } from '@badeball/cypress-cucumber-preprocessor'

// Pausa após CADA step Gherkin (Given/When/Then/E), não só nas ações de
// clique/digitação (isso já é coberto por commands_slowmo.js). Sem isso, os
// steps de asserção (ex.: "Então o sistema exibe registros...") resolvem
// instantaneamente e é impossível acompanhar a validação a olho nu no
// cypress open. Desativado no CI. Ajustável via --env slowMoStepMs=N
// (ou CYPRESS_slowMoStepMs=N); reaproveita slowMoMs como fallback para
// manter um único knob de configuração.
const SLOW_MO_ATIVO = !Cypress.env('CI')
const SLOW_MO_STEP_MS =
  Number(Cypress.env('slowMoStepMs')) || Number(Cypress.env('slowMoMs')) || 500

AfterStep(() => {
  if (SLOW_MO_ATIVO && SLOW_MO_STEP_MS > 0) {
    cy.wait(SLOW_MO_STEP_MS, { log: false })
  }
})
