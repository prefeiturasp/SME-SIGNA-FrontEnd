// =====================================================
// LOCATORS — AÇÕES DA LISTAGEM DE ATOS ADMINISTRATIVOS (SIGNA)
// =====================================================
// Colunas reais da tabela (ListagemDeAtosAdministrativos.tsx, showCamposExtras
// padrão true): 0 Tipo, 1 Nº SEI, 2 Observações, 3 Portaria do ato,
// 4 Servidor indicado, 5 Registro Funcional (RF), 6 Status, 7 Action (ícone).

export const acoesListagemLocators = {
  linhas: 'table tbody tr:not(.ant-table-measure-row)',

  linha: (index) =>
    cy.get('table tbody tr:not(.ant-table-measure-row)').eq(index),

  colunaTipo: (index) =>
    cy.get('table tbody tr:not(.ant-table-measure-row)').eq(index).find('td').eq(0),

  colunaNumeroSei: (index) =>
    cy.get('table tbody tr:not(.ant-table-measure-row)').eq(index).find('td').eq(1),

  colunaServidorIndicado: (index) =>
    cy.get('table tbody tr:not(.ant-table-measure-row)').eq(index).find('td').eq(4),

  colunaStatus: (index) =>
    cy.get('table tbody tr:not(.ant-table-measure-row)').eq(index).find('td').eq(6),

  dropdownTrigger: (index) =>
    cy.get('table tbody tr:not(.ant-table-measure-row)').eq(index)
      .find('.ant-dropdown-trigger, [class*="dropdown-trigger"]')
      .first(),

  // Itens do dropdown de ações — mesmo seletor usado em
  // "clica e seleciona a opção" (cessacao_steps.js).
  itensMenuAbertos: () => cy.get('ul li span'),

  // Modal.confirm do antd (Modal.useModal(), usado em handleExcluirDesignacao)
  // — distinto do modal Radix/shadcn de busca de portaria (role="dialog").
  modalConfirm: {
    container: () => cy.get('.ant-modal-confirm', { timeout: 10000 }),
    titulo: () => cy.get('.ant-modal-confirm-title'),
    conteudo: () => cy.get('.ant-modal-confirm-content'),
    botao: (texto) => cy.get('.ant-modal-confirm-btns, .ant-modal-confirm-btns-reverse').contains('button', texto),
  },

  notificacao: (texto) =>
    cy.get('.ant-notification-notice', { timeout: 15000 }).contains(texto),

  modalBuscaPortaria: () => cy.get('[role="dialog"]'),
}
