// =====================================================
// LOCATORS — ATOS ADMINISTRATIVOS (Pesquisa / Filtros)
// =====================================================
// Campos de filtro sem label/for estável são localizados por ordem de
// aparição no formulário: Tipo, Nº SEI, Período, Portaria de designação,
// Servidor, RF, Status.

const formulario = () =>
  cy.get('main form', { timeout: 10000 }).first()

// Exclui os inputs internos do RangePicker (ficam :visible mesmo com o
// calendário fechado e deslocariam os índices dos campos seguintes).
const camposTexto = () =>
  formulario().find('input').filter(':visible').not('.ant-picker-range input')

export const atosAdministrativosPack = {

  // Escopado em "main": o item de submenu "Atos administrativos" fica oculto
  // no DOM (.ant-menu-hidden) e um cy.contains genérico pegaria ele em vez
  // do <h1> real da página.
  titulo: () =>
    cy.get('main', { timeout: 15000 }).contains('Atos administrativos', { timeout: 15000 }),

  textoInstrucao: () =>
    cy.contains('Selecione os campos para buscar as portarias disponíveis.', { timeout: 10000 }),

  filtros: {
    // Triggers shadcn/ui não exibem "Tipo"/"Status" como texto — localização
    // posicional: 1º e 2º <button> do formulário (os dois últimos são as
    // ações "Limpar filtros"/"Pesquisar").
    tipo: () =>
      formulario().find('button').eq(0),

    numeroSei: () =>
      camposTexto().eq(0),

    periodo: () =>
      formulario().find('.ant-picker-range').first(),

    periodoInputs: () =>
      formulario().find('.ant-picker-range input'),

    portariaDesignacao: () =>
      camposTexto().eq(1),

    servidor: () =>
      camposTexto().eq(2),

    rf: () =>
      camposTexto().eq(3),

    status: () =>
      formulario().find('button').eq(1),
  },

  botoes: {
    limpar: () =>
      cy.contains('button', 'Limpar filtros', { timeout: 10000 }),

    pesquisar: () =>
      cy.contains('button', 'Pesquisar', { timeout: 10000 }),
  },

  dropdown: {
    opcao: (texto) =>
      cy.get('[role="option"]', { timeout: 10000 }).contains(texto),
  },

  // Escopado em ".ant-dropdown:not(.ant-dropdown-hidden)": o Ant Design
  // mantém instâncias antigas/fechadas do dropdown "Novo ato +" no DOM,
  // causando falso "not visible" sem esse filtro.
  novoAto: {
    opcao: (texto) =>
      cy.get('.ant-dropdown:not(.ant-dropdown-hidden) [role="menuitem"], .ant-dropdown:not(.ant-dropdown-hidden) li, .ant-dropdown:not(.ant-dropdown-hidden) button, .ant-dropdown:not(.ant-dropdown-hidden) div', { timeout: 10000 })
        .filter(':visible')
        .contains(new RegExp(`^${texto}$`, 'i')),
  },

  // Dialog Radix/shadcn (role="dialog"), NÃO Ant Design.
  modal: {
    container: () =>
      cy.get('[role="dialog"]', { timeout: 15000 }),

    contendo: (texto) =>
      cy.get('[role="dialog"]', { timeout: 15000 }).contains(texto),

    campoPorLabel: (label) =>
      cy.get('[role="dialog"]', { timeout: 15000 })
        .contains('label', label)
        .invoke('attr', 'for')
        .then((forId) => cy.get(`[role="dialog"] #${forId}`)),

    selectAno: () =>
      cy.get('[role="dialog"] [data-testid="select-busca-ano"]', { timeout: 15000 }),
  },

  tabela: {
    container: () =>
      cy.get('table', { timeout: 15000 }),

    // Exclui a linha fantasma de medição de colunas do Ant Design Table.
    linhas: () =>
      cy.get('tbody tr', { timeout: 15000 }).not('.ant-table-measure-row'),

    // Esta tela não usa o componente Empty padrão do Ant Design — estado
    // vazio é texto customizado "Não há dados" dentro do tbody.
    estadoVazio: () =>
      cy.get('tbody', { timeout: 15000 }).contains(/não há dados/i),
  },
}

export const atosAdministrativosTextos = {
  titulo: 'Atos administrativos',
  instrucao: 'Selecione os campos para buscar as portarias disponíveis.',
}

export const atosAdministrativosUrls = {
  pagina: 'atos-administrativos',
}
