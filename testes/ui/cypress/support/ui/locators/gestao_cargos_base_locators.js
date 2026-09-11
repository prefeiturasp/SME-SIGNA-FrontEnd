// =====================================================
// LOCATORS — GESTÃO DE CARGOS BASE (Pesquisa / Filtros)
// =====================================================
// Todos os 5 campos do formulário de filtro (Grupamento, Descrição
// Resumida, Descrição Completa, Situação Funcional, Status) têm
// <label for="..."> associado a um id gerado dinamicamente pelo Radix —
// confirmado por inspeção real do DOM (navegador, tela logada).
//
// Os 3 selects (Grupamento, Situação Funcional, Status) são componentes
// shadcn/ui (Radix Select): o id do "for" aponta para um <select> nativo
// oculto (usado só para acessibilidade/autofill), não para o elemento
// clicável — por isso o trigger real é localizado como o
// <button role="combobox"> irmão do <label>, nunca por getElementById.

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
    // data-testid confirmado no DOM real. "Cadastrar novo cargo" usa
    // data-testid="botao-proximo" — nome genérico (reaproveitado de outro
    // componente da aplicação), não específico desta tela.
    cadastrarNovoCargo: () =>
      cy.get('[data-testid="botao-proximo"]', { timeout: 10000 }),

    limpar: () =>
      cy.get('[data-testid="btn-limpar-filtros"]', { timeout: 10000 }),

    pesquisar: () =>
      cy.get('[data-testid="btn-pesquisar"]', { timeout: 10000 }),
  },

  // Popup do Radix Select — mesmo padrão já usado em
  // atos_administrativos_locators.js (role="option" do Radix, não classes
  // ".ant-select-*").
  dropdown: {
    opcao: (texto) =>
      cy.get('[role="option"]', { timeout: 10000 }).contains(texto),
  },

  tabela: {
    container: () =>
      cy.get('table', { timeout: 15000 }),

    // ":not(.ant-table-measure-row)" exclui a linha oculta de medição de
    // coluna que o Ant Design injeta em tbody — ver comentário no step
    // "a tabela exibe apenas cargos base com" (gestao_cargos_base_steps.js).
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
