// =====================================================
// LOCATORS — ALTERAR DATA DO D.O (SIGNA)
// =====================================================

// React 19 gera IDs via useId() — o for/id do label pode divergir do
// hidratado no cliente, por isso a busca em camadas abaixo.
function inputPorLabel(labelMatcher) {
  return cy.contains('label', labelMatcher, { timeout: 10000 })
    .then($label => {
      const labelEl = $label[0]
      const doc     = labelEl.ownerDocument

      function cyEl(el) {
        if (el.id) return cy.get(`[id="${el.id}"]`)
        return cy.wrap(Cypress.$(el))
      }

      function resolveInput(el) {
        if (!el) return null
        if (el.tagName === 'INPUT') return el
        return el.querySelector(
          'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"])'
        ) ?? null
      }

      // Camada 1: label.control — API nativa do browser
      const ctrl = labelEl.control
      if (ctrl && ctrl.tagName === 'INPUT') return cyEl(ctrl)

      // Camada 2: querySelector por atributo [id="..."] (ignora escape CSS)
      const forAttr    = labelEl.getAttribute('for')
      const hydratedId = forAttr
        ? forAttr.replace(/^_r_([^_]+)_(.*)$/, ':r$1:$2')
        : null

      for (const id of [forAttr, hydratedId].filter(Boolean)) {
        const found = doc.querySelector(`[id="${id}"]`)
        if (found) {
          const inp = resolveInput(found)
          if (inp) return cyEl(inp)
        }
      }

      // Camada 3: sobe na árvore parando ao encontrar outro label (evita
      // capturar input de outro campo).
      let bestInput = null
      let ancestor  = labelEl.parentElement
      for (let depth = 0; depth < 6 && ancestor; depth++) {
        const otherLabels = [...ancestor.querySelectorAll('label')].filter(l => l !== labelEl)
        if (otherLabels.length > 0) break
        const inp = ancestor.querySelector(
          'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"])'
        )
        if (inp) bestInput = inp
        ancestor = ancestor.parentElement
      }
      if (bestInput) return cyEl(bestInput)

      throw new Error(
        `Input não encontrado para label "${labelMatcher}". ` +
        `for="${forAttr}" · hydratedId="${hydratedId}"`
      )
    })
}

function dropdownPorLabel(labelMatcher) {
  return cy.contains('label', labelMatcher, { timeout: 10000 })
    .then($label => {
      const labelEl = $label[0]
      const doc     = labelEl.ownerDocument

      // Camada 1: label.control funciona para button e select também
      if (labelEl.control) return cy.wrap(Cypress.$(labelEl.control))

      // Camada 2: querySelector por atributo
      const forAttr    = labelEl.getAttribute('for')
      const hydratedId = forAttr
        ? forAttr.replace(/^_r_([^_]+)_(.*)$/, ':r$1:$2')
        : null

      for (const id of [forAttr, hydratedId].filter(Boolean)) {
        const el = doc.querySelector(`[id="${id}"]`)
        if (el) return cy.wrap(Cypress.$(el))
      }

      // Camada 3: sobe no DOM procurando button/select/combobox dentro do form-item
      let ancestor = labelEl.parentElement
      for (let depth = 0; depth < 6 && ancestor; depth++) {
        const otherLabels = [...ancestor.querySelectorAll('label')].filter(l => l !== labelEl)
        if (otherLabels.length > 0) break
        const trigger = ancestor.querySelector(
          'button:not([type="submit"]):not([type="reset"]), select, [role="combobox"]'
        )
        if (trigger) return cy.wrap(Cypress.$(trigger))
        ancestor = ancestor.parentElement
      }

      throw new Error(`Trigger de dropdown não encontrado para label "${labelMatcher}". for="${forAttr}"`)
    })
}

export const alterarDOLocators = {

  // ─── Título da Página ──────────────────────────────────────────────────────
  tituloPagina: () =>
    cy.contains('Alterar data do D.O', { timeout: 15000 }),

  // ─── Filtros ──────────────────────────────────────────────────────────────
  filtros: {

    secaoFiltros: () =>
      cy.contains('Filtros', { timeout: 10000 }),

    ano:             () => dropdownPorLabel(/^Ano\*$/),
    portariaInicial: () => inputPorLabel('Portaria inicial'),
    portariaFinal:   () => inputPorLabel('Portaria final'),
    nrSei:           () => inputPorLabel('Nº SEI da lauda definitiva'),

    botaoPesquisar: () =>
      cy.contains('button', 'Pesquisar', { timeout: 10000 }),

    botaoLimpar: () =>
      cy.contains('button', 'Limpar filtros', { timeout: 10000 }),
  },

  // ─── Tabela de Portarias ──────────────────────────────────────────────────
  tabela: {

    container: () =>
      cy.get('table', { timeout: 15000 }),

    linhas: () =>
      cy.get('tbody tr', { timeout: 15000 }),

    checkboxPrimeiraLinha: () =>
      cy.get('tbody tr').first().find('input[type="checkbox"]'),

    checkboxLinha: (index) =>
      cy.get('tbody tr').eq(index).find('input[type="checkbox"]'),

    // Primeira linha onde D.O (td[5]) é "-". td[0]=checkbox td[1]=PORTARIA
    linhaSemDO: () => {
      const candidatas = [
        '323232', '3333', '9297169', '9900842',
        '8024679', '8120197', '8147925', '8266922',
      ]
      return cy.get('tbody tr.ant-table-row', { timeout: 15000 }).then($rows => {
        // Tenta primeiro as portarias conhecidas sem D.O
        const $prioritaria = $rows.filter((_, tr) => {
          const numPortaria = Cypress.$(tr).find('td').eq(1).text().trim()
          const semDO       = Cypress.$(tr).find('td').eq(5).text().trim() === '-'
          return candidatas.includes(numPortaria) && semDO
        })
        if ($prioritaria.length > 0) return cy.wrap($prioritaria.first())

        // Fallback: qualquer linha com D.O vazio
        const $qualquer = $rows.filter((_, tr) =>
          Cypress.$(tr).find('td').eq(5).text().trim() === '-'
        )
        expect($qualquer.length, 'Nenhuma portaria sem D.O encontrada na tabela').to.be.greaterThan(0)
        return cy.wrap($qualquer.first())
      })
    },

    // Primeira coluna (checkbox) da linha — usada para scrollIntoView
    colunaPortaria: (linha) =>
      cy.wrap(linha).find('td').eq(0),

    // Checkbox dentro da primeira coluna da linha
    checkboxPortaria: (linha) =>
      cy.wrap(linha).find('td').eq(0).find('input[type="checkbox"]'),

    // Estado vazio da tabela Ant Design quando nenhuma linha é retornada
    estadoVazio: () =>
      cy.get('.ant-empty, .ant-table-empty, [class*="empty"]', { timeout: 10000 }),
  },

  // ─── Campo de Data de Publicação ──────────────────────────────────────────
  dataPublicacao: () =>
    cy.contains('label', 'Data da publicação no Diário Oficial (D.O)', { timeout: 15000 })
      .parent()
      .find('.ant-picker')
      .first(),

  // ─── Seleção de Hoje no datepicker Ant Design ─────────────────────────────
  selecionarHoje: () =>
    cy.get('.ant-picker-dropdown', { timeout: 15000 }).contains('Hoje'),

  // ─── Botão de Alteração ───────────────────────────────────────────────────
  botaoAlterar: () =>
    cy.contains('button', 'Alterar data', { timeout: 15000 }),

  // ─── Feedback / Confirmação ───────────────────────────────────────────────
  mensagemSucesso: () =>
    cy.get(
      '.ant-message-success, .ant-notification-notice-success, [class*="success"]',
      { timeout: 15000 }
    ),

  mensagemErro: () =>
    cy.get(
      '.ant-message-error, .ant-notification-notice-error, [class*="error"]',
      { timeout: 10000 }
    ),
}

// ─── Textos esperados ─────────────────────────────────────────────────────────
export const alterarDOTextos = {
  tituloPagina:  'Alterar data do D.O',
  secaoFiltros:  'Filtros',
}

// ─── URLs de referência ───────────────────────────────────────────────────────
export const alterarDOUrls = {
  paginaAlterarDO: 'alterar-data-do',
}
