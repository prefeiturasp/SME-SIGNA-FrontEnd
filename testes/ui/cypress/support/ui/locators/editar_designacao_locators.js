// =====================================================
// LOCATORS — EDITAR DESIGNAÇÃO (SIGNA)
// =====================================================

export const editarDesignacaoLocators = {

  // ─── Dashboard / Listagem ──────────────────────────────────────────────────
  linhas:          'table tbody tr.ant-table-row',
  dropdownTrigger: '.ant-dropdown-trigger, [class*="dropdown-trigger"]',

  // ─── Tela Editar Designação ────────────────────────────────────────────────
  tituloPagina: 'Editar Designação',

  // ─── Accordions (Ant Design Collapse) ─────────────────────────────────────
  // Selectors para o cabeçalho clicável de cada seção
  accordion: (nome) =>
    cy.contains(
      '.ant-collapse-header, [class*="collapse"] button, [role="button"]',
      nome,
      { timeout: 10000 }
    ),

  // Verifica se o item collapse pai está ativo (expandido)
  accordionAberto: ($header) =>
    Cypress.$($header).closest('.ant-collapse-item').hasClass('ant-collapse-item-active'),

  // ─── Tipo de Cargo (Ant Design Radio) ─────────────────────────────────────
  textoTipoCargo:   'Selecione o tipo de cargo:',
  radioCargoDisponivel: () =>
    cy.contains('.ant-radio-wrapper, label, [role="radio"]', 'Cargo Disponivel', { timeout: 8000 }),
  radioCargoVago: () =>
    cy.contains('.ant-radio-wrapper, label, [role="radio"]', 'Cargo Vago', { timeout: 8000 }),

  // ─── Campo RF Titular ──────────────────────────────────────────────────────
  labelRfTitular: 'RF Titular',
  inputRfTitular: () =>
    cy.contains('label', 'RF Titular', { timeout: 10000 }).first().then($label => {
      const id = $label.attr('for')
      if (id) return cy.get(`#${CSS.escape(id)}`)
      return cy.wrap($label)
        .parentsUntil('.ant-form-item').parent()
        .find('input').not('[type="hidden"]').first()
    }),

  // ─── Botões de navegação ──────────────────────────────────────────────────
  botaoVoltar:  () => cy.contains('button', 'Voltar',  { timeout: 10000 }),
  botaoAvancar: () => cy.contains('button', 'Avançar', { timeout: 10000 }),
}
