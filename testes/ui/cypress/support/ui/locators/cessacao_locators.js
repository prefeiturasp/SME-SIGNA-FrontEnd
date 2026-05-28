export const cessacaoSelectors = {

  aba: (nome) => cy.contains(
    '.ant-tabs-tab, button, span, h2, h3',
    nome,
    { timeout: 10000 }
  ),

  label: (texto) => cy.contains(
    'label, span, p, div, h1, h2, h3, h4',
    texto,
    { timeout: 10000 }
  ),

  inputPorLabel: (label) => {
    cy.log(`Buscando input para label: "${label}"`)
    
    return cy.get('body').then($body => {
      const $labelAntD = $body.find(`.ant-form-item:has(*:contains("${label}")) input`).first()
      if ($labelAntD.length > 0) {
        cy.log('Encontrado via Ant Design')
        return cy.wrap($labelAntD)
      }

      const $label = $body.find(`label:contains("${label}")`).first()
      if ($label.length > 0 && $label.attr('for')) {
        const inputId = $label.attr('for')
        const $inputById = $body.find(`#${inputId}`)
        if ($inputById.length > 0) {
          cy.log(`Encontrado via for/id (${inputId})`)
          return cy.wrap($inputById)
        }
      }

      if ($label.length > 0) {
        const $inputSibling = $label.next('input')
        if ($inputSibling.length > 0) {
          cy.log('Encontrado como sibling')
          return cy.wrap($inputSibling)
        }
      }

      if ($label.length > 0) {
        const $inputParent = $label.parent().find('input').first()
        if ($inputParent.length > 0) {
          cy.log('Encontrado no parent direto')
          return cy.wrap($inputParent)
        }
      }

      const $anyContainer = $body.find(`*:has(*:contains("${label}")) input`).first()
      if ($anyContainer.length > 0) {
        cy.log('Encontrado via busca genérica')
        return cy.wrap($anyContainer)
      }

      cy.log(`Nenhum input encontrado para "${label}"`)
      if ($label.length > 0) {
        cy.log(`Label existe mas input não encontrado. HTML: ${$label.parent().html()}`)
      }
      throw new Error(`Input não encontrado para label: "${label}"`)
    })
  },

  inputGenerico: () => cy.get('input:visible'),

  botao: (texto) => cy.contains('button, a', texto, { timeout: 10000 }).first(),

  botaoEditar: () => cy.contains('button, a', /Editar/i, { timeout: 10000 }).first(),

  botaoVoltar: () => cy.contains('button, a', /Voltar/i, { timeout: 10000 }).first(),

  botaoSalvar: () =>
    cy.contains('button, a', /Salvar|Confirmar|OK/i, { timeout: 10000 }).first(),

  opcaoSimNao: (label) =>
    cy.contains('.ant-form-item', label, { timeout: 10000 })
      .find('.ant-radio, .ant-checkbox'),

  preencherNumeroAleatorio: (selector) => {
    const numero = Math.floor(1000000 + Math.random() * 9000000)
    return selector.clear().type(numero.toString())
  },

  validarTituloCessacao: () => {
    return cy.contains('h1, h2', 'Cessação', { timeout: 15000 })
      .should('be.visible')
  }
}
