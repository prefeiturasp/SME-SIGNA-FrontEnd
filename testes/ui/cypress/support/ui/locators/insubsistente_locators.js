// =====================================================
// 🔹 LOCATORS - INSUBSISTÊNCIA
// =====================================================

export const insubsistenteSelectors = {

  // ===============================
  // ABAS
  // ===============================
  aba: (nome) => cy.contains(
    '.ant-tabs-tab, button, span, h2, h3',
    nome,
    { timeout: 10000 }
  ),

  // ===============================
  // LABELS / TEXTOS
  // ===============================
  // Escopado em "main" para não colidir com itens do menu lateral (<aside>)
  // que podem conter o mesmo texto (ex.: "D.O" também aparece em "Alterar data do D.O").
  label: (texto) => cy.get('main', { timeout: 10000 }).contains(
    'label, span, p, div, h1, h2, h3, h4',
    texto,
    { timeout: 10000 }
  ),

  // ===============================
  // INPUT POR LABEL (simplificado)
  // ===============================
  inputPorLabel: (label) => {
    cy.log(`Buscando input: "${label}"`)

    return cy.get('main', { timeout: 10000 }).find(`label:contains("${label}")`)
      .first()
      .then($label => {
        // Tenta via for/id
        const inputId = $label.attr('for')
        if (inputId) {
          return cy.get(`#${inputId}`)
        }
        
        // Tenta via parent Ant Design
        return cy.wrap($label)
          .parentsUntil('.ant-form-item')
          .parent()
          .find('input')
          .first()
      })
  },

  // ===============================
  // TEXTAREA POR LABEL (simplificado)
  // ===============================
  textareaPorLabel: (label) => {
    cy.log(`Buscando textarea: "${label}"`)

    return cy.get('main', { timeout: 10000 }).find(`label:contains("${label}")`)
      .first()
      .then($label => {
        // Tenta via for/id
        const textareaId = $label.attr('for')
        if (textareaId) {
          return cy.get(`#${textareaId}`)
        }
        
        // Tenta via parent Ant Design
        return cy.wrap($label)
          .parentsUntil('.ant-form-item')
          .parent()
          .find('textarea')
          .first()
      })
  },

  // ===============================
  // 🔹 RADIO BUTTONS
  // ===============================
  // Escopado em "main" para não colidir com itens do menu lateral (<aside>)
  // que podem conter o mesmo texto como substring (ex.: "Designações").
  radioOpcao: (texto) => cy.get('main', { timeout: 10000 }).contains(
    '.ant-radio-wrapper, label',
    texto,
    { timeout: 10000 }
  ),

  // ===============================
  // 🔹 BOTÕES
  // ===============================
  botao: (texto) => cy.contains('button, a', texto, { timeout: 10000 }).first(),

  botaoEditar: () => cy.contains('button, a', /Editar/i, { timeout: 10000 }).first(),

  botaoVoltar: () => cy.contains('button, a', /Voltar/i, { timeout: 10000 }).first(),

  botaoSalvar: () =>
    cy.contains('button, a', /Salvar|Confirmar|OK/i, { timeout: 10000 }).first(),

  botaoTrechosSEI: () =>
    cy.contains('button', /Trechos para o SEI/i, { timeout: 10000 }),

  // ===============================
  // 🔹 VALIDAÇÕES
  // ===============================
  validarTituloInsubsistencia: () => {
    return cy.contains('h1, h2', /Insubsistência|Insubsistente/i, { timeout: 15000 })
      .should('be.visible')
  },

  verificarAbaVazia: () => {
    return cy.get('main').then($main => {
      const temConteudo =
        $main.find('input:visible, textarea:visible, select:visible, .ant-form-item').length > 0
      return !temConteudo
    })
  }
}
