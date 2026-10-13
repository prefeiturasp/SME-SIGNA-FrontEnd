// =====================================================
// LOCATORS — GESTÃO DE CARGOS BASE (Pesquisa / Filtros)
// =====================================================
// Selects (Grupamento, Situação Funcional, Status) apontam via "for" pra um
// <select> nativo oculto — o trigger real é o <button role="combobox"> irmão.

const campoPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .invoke('attr', 'for')
    .then((forId) => cy.get(`#${forId}`))

const comboboxPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('button[role="combobox"]')

export const gestaoCargosBasePack = {
  titulo: () =>
    cy.get('main', { timeout: 15000 }).contains('h1', 'Gestão de cargos base', { timeout: 15000 }),

  textoInstrucao: () =>
    cy.contains('Aqui você encontra todos os cargos base cadastrados no sistema.', { timeout: 10000 }),

  filtros: {
    grupamento: () => comboboxPorLabel('Grupamento'),
    descricaoResumida: () => campoPorLabel('Descrição Resumida'),
    descricaoCompleta: () => campoPorLabel('Descrição Completa'),
    situacaoFuncional: () => comboboxPorLabel('Situação Funcional'),
    status: () => comboboxPorLabel('Status'),
  },

  botoes: {
    // data-testid="botao-proximo": nome genérico reaproveitado de outro
    // componente, não específico desta tela.
    cadastrarNovoCargo: () =>
      cy.get('[data-testid="botao-proximo"]', { timeout: 10000 }),

    limpar: () =>
      cy.get('[data-testid="btn-limpar-filtros"]', { timeout: 10000 }),

    pesquisar: () =>
      cy.get('[data-testid="btn-pesquisar"]', { timeout: 10000 }),
  },

  dropdown: {
    opcao: (texto) =>
      cy.get('[role="option"]', { timeout: 10000 }).contains(texto),
  },

  tabela: {
    container: () =>
      cy.get('table', { timeout: 15000 }),

    linhas: () =>
      cy.get('tbody tr:not(.ant-table-measure-row)', { timeout: 15000 }),
  },
}

export const gestaoCargosBaseTextos = {
  titulo: 'Gestão de cargos base',
  instrucao: 'Aqui você encontra todos os cargos base cadastrados no sistema.',
  colunas: 'Grupamento, Descrição resumida, Descrição completa, Situação funcional, Usado em funções, Usado em designações, Usado em STE, Usado em permutas, Cargo base fictício, Status',
}

export const gestaoCargosBaseUrls = {
  pagina: 'gestao/cargos-base',
}
