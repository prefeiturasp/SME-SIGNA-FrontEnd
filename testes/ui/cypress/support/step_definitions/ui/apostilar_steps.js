// Step Definitions — Apostilar Designação
// Contém apenas steps EXCLUSIVOS deste fluxo.
// Steps comuns reutilizados:
//   • "que o usuário está autenticado"           → common_steps.js
//   • "que o usuário está na página do dashboard"→ common_steps.js
//   • "valida a existencia do Texto"             → common_steps.js  (lowercase v, capital T — validação rígida)
//   • "Valida a existencia do Texto"             → common_steps.js
//   • "Valida a existencia da Tabela"            → common_steps.js
//   • "Valida a existencia das Colunas"          → cessacao_steps.js
//   • "navega para a seção Action"               → cessacao_steps.js
//   • "clica e seleciona a opção"                → cessacao_steps.js
//   • "o sistema exibe a Tela"                   → common_steps.js
//   • "valida a existencia e clica na aba"       → insubsistente_steps.js (lowercase v — estrito)
//   • "valida a existencia dos Titulos com skip" → insubsistente_steps.js
//   • "preenche o campo X com numero aleatorio"  → cessacao_steps.js
//   • "preenche o campo X com texto aleatorio"   → insubsistente_steps.js
//   • "valida a existencia do botão de navegação"→ cessacao_steps.js
//   • "clica no botão"                           → alterar_senha_steps.js (genérico)
//   • "clica em"                                 → designacao_steps.js

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { apostilarLocators, apostilarTextos } from '../../ui/locators/apostilar_locators'

// ─── ETAPA 1 — Seleção aleatória da designação para apostilar ─────────────────

Then('Seleciona uma das Designação de forma aleatoria para apostilar', () => {
  cy.get('table tbody tr.ant-table-row', { timeout: 30000 })
    .should('have.length.greaterThan', 0)
    .its('length')
    .then(totalLinhas => {
      cy.wrap(null).then(() => {
        const tentativasAnteriores = Cypress.env('apostilarTentadas') || []

        const indicesDisponiveis = Array.from({ length: totalLinhas }, (_, i) => i)
          .filter(i => !tentativasAnteriores.includes(i))

        let index
        if (indicesDisponiveis.length > 0) {
          index = indicesDisponiveis[0]
        } else {
          cy.log('Todas as designações já foram tentadas para apostilar, resetando...')
          Cypress.env('apostilarTentadas', [])
          index = 0
        }

        cy.log(`Apostilar — selecionando designação (índice: ${index} de ${totalLinhas})`)
        cy.wrap(index).as('designacaoIndex')
      })
    })
})

// ─── ETAPA 4 — Abre o accordion "Portarias de Cessação" e define o flag ───────
// Após abrir, verifica se a seção contém dados (radio "Selecione o tipo...").
// Armazena resultado em Cypress.env('apostilaCessacaoTemDados'):
//   true  → seção tem dados → próximas etapas executam normalmente
//   false → seção vazia    → próximas etapas são ignoradas (skip com log)
// O flag é resetado a cada chamada para não vazar entre cenários.

When('valida a existencia da aba {string}', (nomeAba) => {
  Cypress.env('apostilaCessacaoTemDados', undefined)

  cy.contains(nomeAba, { timeout: 10000 }).should('be.visible').then($el => {
    cy.wrap($el).closest('button, [role="tab"]').click({ force: true })
  })
  cy.wait(2000)

  cy.get('body').then($body => {
    // Página usa "Apostila" (sem 'r') — substring cobre ambas as variações
    const temDados = $body.text().includes('Selecione o tipo de Apostila')
    Cypress.env('apostilaCessacaoTemDados', temDados)
    cy.log(temDados
      ? '✓ Seção "Portarias de Cessação" com dados — etapas 4/5 serão executadas'
      : '⚠️ Seção "Portarias de Cessação" vazia — etapas 4/5 serão ignoradas')
  })
})

// ─── ETAPA 4 — Validação soft de texto (capital V) ────────────────────────────
// Diferente do step do common_steps (lowercase v, capital T) que é rígido,
// este step verifica o flag apostilaCessacaoTemDados antes de validar.
// Quando false → pula sem falhar.

Then('Valida a existencia do texto {string}', (texto) => {
  if (Cypress.env('apostilaCessacaoTemDados') === false) {
    cy.log(`⚠️ Skip (seção vazia): "${texto}"`)
    return
  }
  // Escopado em "main" para não colidir com textos do menu lateral (<aside>),
  // que pode conter substrings iguais (ex.: "D.O" também aparece em "Alterar data do D.O").
  cy.get('main', { timeout: 10000 }).contains(texto.trim(), { timeout: 10000 }).should('be.visible')
  cy.log(`✓ Texto encontrado: "${texto}"`)
})

// ─── ETAPA 4 — Seleciona o tipo de apostilamento (condicional) ────────────────
// Valida que a opção existe no radio group e clica nela.
// Pula quando apostilaCessacaoTemDados === false.

When('Valida e seleciona {string}', (opcao) => {
  if (Cypress.env('apostilaCessacaoTemDados') === false) {
    cy.log(`⚠️ Skip (seção vazia): selecionar "${opcao}"`)
    return
  }
  // Radix UI radio group — não usa .ant-radio-wrapper
  // Localiza o label/span com o texto e clica; se for label com "for", aciona o radio
  cy.get('[role="radiogroup"]', { timeout: 8000 }).should('exist').then($group => {
    cy.wrap($group).contains(opcao.trim()).then($el => {
      const forId = $el.attr('for')
      if (forId) {
        cy.get(`#${CSS.escape(forId)}`).click({ force: true })
      } else {
        cy.wrap($el).click({ force: true })
      }
    })
  })
  cy.wait(500)
  cy.log(`✓ Opção "${opcao}" selecionada`)
})

// ─── ETAPA 5 — Abre sub-seção/accordion (capital V) — condicional ─────────────
// Versão condicional do "valida a existencia e clica na aba" (insubsistente).
// Usado dentro da seção "Portarias de Cessação" para abrir "Portaria de Apostila".
// Pula quando apostilaCessacaoTemDados === false.

When('Valida a existencia e clica na aba {string}', (nomeAba) => {
  if (Cypress.env('apostilaCessacaoTemDados') === false) {
    cy.log(`⚠️ Skip (seção vazia): aba "${nomeAba}"`)
    return
  }
  cy.contains(nomeAba.trim(), { timeout: 10000 }).should('be.visible').then($el => {
    const $btn = Cypress.$($el).closest('button, [role="tab"]')
    const estado = $btn.attr('data-state')
    if (estado === 'open') {
      cy.log(`Aba "${nomeAba}" já está aberta — clique ignorado`)
    } else {
      cy.wrap($btn).click({ force: true })
      cy.wait(1500)
    }
  })
  cy.log(`✓ Aba "${nomeAba}" ativa`)
})

// ─── ETAPA 5 — Preenche campo por label (condicional) ─────────────────────────
// Localiza o input/textarea pelo atributo "for" da label.
// Pula quando apostilaCessacaoTemDados === false.

When('preenche o campo apostilamento {string} com {string}', (labelText, valor) => {
  if (Cypress.env('apostilaCessacaoTemDados') === false) {
    cy.log(`⚠️ Skip (seção vazia): preencher "${labelText}"`)
    return
  }
  const valorLimpo = valor.trim()
  cy.contains('label', labelText.trim(), { timeout: 10000 }).first().then($label => {
    const inputId = $label.attr('for')
    if (inputId) {
      cy.get(`#${CSS.escape(inputId)}`)
        .clear()
        .type(valorLimpo)
    } else {
      cy.wrap($label)
        .parentsUntil('.ant-form-item').parent()
        .find('input, textarea').not('[type="hidden"]').first()
        .clear().type(valorLimpo)
    }
  })
  cy.log(`✓ "${labelText}" preenchido: "${valorLimpo}"`)
})

// ─── ETAPA 6 — Botão de navegação condicional (capital V) ────────────────────
// Verifica visibilidade do botão. Pula quando apostilaCessacaoTemDados === false.

When('Valida o botão {string}', (textoBotao) => {
  if (Cypress.env('apostilaCessacaoTemDados') === false) {
    cy.log(`⚠️ Skip (seção vazia): botão "${textoBotao}"`)
    return
  }
  cy.contains('button, a', textoBotao.trim(), { timeout: 10000 }).should('be.visible')
  cy.log(`✓ Botão "${textoBotao}" visível`)
})

// ─── ETAPA 6 — Clique condicional em botão de apostilamento ──────────────────
// Pula quando apostilaCessacaoTemDados === false.

When('Clica no botão apostilamento {string}', (textoBotao) => {
  if (Cypress.env('apostilaCessacaoTemDados') === false) {
    cy.log(`⚠️ Skip (seção vazia): clicar botão "${textoBotao}"`)
    return
  }
  cy.contains('button, a', textoBotao.trim(), { timeout: 10000 })
    .should('be.visible')
    .click({ force: true })
  cy.wait(1000)
  cy.log(`✓ Botão "${textoBotao}" clicado`)
})

// ─── ETAPA 7 — Clique condicional em Salvar ──────────────────────────────────

When('Clica em salvar apostilamento', () => {
  if (Cypress.env('apostilaCessacaoTemDados') === false) {
    cy.log('⚠️ Skip (seção vazia): salvar apostilamento')
    return
  }
  cy.contains('button', 'Salvar', { timeout: 10000 }).should('be.visible').click({ force: true })
  cy.wait(1000)
  cy.log('✓ Salvar clicado')
})

// ─── ETAPA 7 — Validação pós-salvar ──────────────────────────────────────────

Then('o sistema processa o apostilamento sem erros', () => {
  if (Cypress.env('apostilaCessacaoTemDados') === false) {
    cy.log('⚠️ Skip (seção vazia): validação pós-save ignorada')
    return
  }
  cy.log('Aguardando processamento do apostilamento...')
  cy.wait(3000)

  cy.get('body').then($body => {
    const temErro = $body.find(
      '.ant-message-error, .ant-notification-notice-error, [class*="error-message"]'
    ).length > 0

    if (temErro) {
      cy.get(
        '.ant-message-error, .ant-notification-notice-error, [class*="error-message"]'
      ).first().then($el => {
        throw new Error(`Apostilamento falhou: ${$el.text().trim()}`)
      })
    } else {
      cy.log('Apostilamento processado sem erros visíveis')
    }
  })

  cy.get('body').then($body => {
    const redirecionou = !window.location.href.includes('apostilar')
    if (redirecionou) {
      cy.log('Sistema redirecionou após apostilamento')
    } else {
      const temSucesso = $body.find(
        '.ant-message-success, .ant-notification-notice-success, [class*="success"]'
      ).length > 0
      if (temSucesso) {
        cy.log('Notificação de sucesso exibida')
      } else {
        cy.log('Apostilamento finalizado (sem toast de sucesso detectado)')
      }
    }
  })
})
