// =====================================================
// LOCATORS — APOSTILAR DESIGNAÇÃO (SIGNA)
// =====================================================

export const apostilarLocators = {

  // ─── Dashboard / Listagem ──────────────────────────────────────────────────
  tituloListagem:   'Lista de designações',
  tabela:           'table',
  // tr.ant-table-row → somente linhas de dados reais (exclui placeholder e measure rows)
  linhas:           'table tbody tr.ant-table-row',
  dropdownTrigger:  '.ant-dropdown-trigger, [class*="dropdown-trigger"]',

  // ─── Tela Apostilar ────────────────────────────────────────────────────────
  tituloPagina: 'Apostilar',

  // ─── Abas (Ant Design Tabs) ────────────────────────────────────────────────
  abaServidorIndicado:  '.ant-tabs-tab:contains("Servidor indicado")',
  abaPortariaDesignacao: '.ant-tabs-tab:contains("Portaria de designação")',
  abaPortariasCessacao:  '.ant-tabs-tab:contains("Portarias de Cessação")',

  // ─── Tipo de Apostilar (Radix UI radio group) ─────────────────────────────
  textoTipoApostilar: 'Selecione o tipo de Apostila:',
  radioGroup:         '[role="radiogroup"]',
  radioDesignacao:    '[role="radio"][value*="designa"], [role="radiogroup"] label',
  radioCessacao:      '[role="radio"][value*="cessa"], [role="radiogroup"] label',

  // ─── Formulário de Apostilamento ──────────────────────────────────────────
  labelPortariaApostilar: 'Portaria de Apostilar',
  labelNroSEI:            'Nº SEI',
  labelDO:                'D.O',

  // ─── Observações ──────────────────────────────────────────────────────────
  labelObservacoes: 'Observações',

  // ─── Botões ───────────────────────────────────────────────────────────────
  botaoTrechosSEI: 'button:contains("Trechos para o SEI")',
  botaoSalvar:     'button:contains("Salvar")',

  // ─── Texto da portaria (preview SEI) ──────────────────────────────────────
  textoPortaria: 'PORTARIA',

  // ─── Helpers dinâmicos ────────────────────────────────────────────────────

  // Retorna o input de um label Ant Design pelo texto da label
  inputPorLabel: (label) => {
    return cy.get(`label:contains("${label}")`, { timeout: 10000 })
      .first()
      .then($label => {
        const inputId = $label.attr('for')
        if (inputId) return cy.get(`#${CSS.escape(inputId)}`)
        return cy.wrap($label)
          .parentsUntil('.ant-form-item')
          .parent()
          .find('input')
          .not('[type="radio"]').not('[type="checkbox"]').not('[type="hidden"]')
          .first()
      })
  },

  // Retorna o textarea de um label Ant Design pelo texto da label
  textareaPorLabel: (label) => {
    return cy.get(`label:contains("${label}")`, { timeout: 10000 })
      .first()
      .then($label => {
        const textareaId = $label.attr('for')
        if (textareaId) return cy.get(`#${CSS.escape(textareaId)}`)
        return cy.wrap($label)
          .parentsUntil('.ant-form-item')
          .parent()
          .find('textarea')
          .first()
      })
  },
}

// ─── Textos esperados ──────────────────────────────────────────────────────────
export const apostilarTextos = {
  tituloPagina:       'Apostilar',
  tituloListagem:     'Lista de designações',
  tipoApostilar:      'Selecione o tipo de Apostilar:',
  textoPortaria:      'PORTARIA',
}

// ─── URLs de referência ────────────────────────────────────────────────────────
export const apostilarUrls = {
  listagem: '/pages/listagem-designacoes',
  apostilar: 'apostila',
}
