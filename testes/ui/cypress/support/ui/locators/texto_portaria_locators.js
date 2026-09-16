// =====================================================
// LOCATORS — TEXTOS DE PORTARIA (Listagem / Modal / Cadastro)
// =====================================================

const campoPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('input, textarea')

const comboboxPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('button[role="combobox"]')

const botaoVariavelPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('button')

export const textoPortariaPack = {
  listagem: {
    titulo: () =>
      cy.get('main', { timeout: 15000 }).contains('h1', 'Textos de portarias', { timeout: 15000 }),

    linhas: () =>
      cy.get('tbody tr:not(.ant-table-measure-row)', { timeout: 15000 }),
  },

  modalNovoTexto: {
    dialog: () =>
      cy.contains('[role="dialog"]', 'Novo texto de portaria', { timeout: 15000 }),
  },

  cadastro: {
    titulo: () =>
      cy.get('main', { timeout: 15000 }).contains('h1', 'Cadastrar texto de portaria', { timeout: 15000 }),

    botaoCancelar: () =>
      cy.get('[data-testid="btn-voltar"]', { timeout: 15000 }),

    campoPorLabel,
    comboboxPorLabel,

    tipoPortaria: () =>
      cy.get('[data-testid="select-listar-para"]', { timeout: 15000 }),

    variavel: {
      botao: () => botaoVariavelPorLabel('Variavel'),

      opcao: (nome) =>
        cy.get('[role="listbox"]', { timeout: 10000 })
          .contains('[role="option"]', new RegExp(`^${nome}$`, 'i')),
    },

    // Editor rich-text (Tiptap/ProseMirror) — não é <textarea>, não entra em
    // campoPorLabel. Nunca usar .clear(): apaga os placeholders [[NOME]].
    editor: () =>
      cy.get('.simple-editor-wrapper [contenteditable="true"]', { timeout: 15000 }),

    mensagensDeErro: () =>
      cy.get('main [id$="-form-item-message"]', { timeout: 10000 }),
  },

  modalRevisarVariaveis: {
    dialog: () =>
      cy.contains('[role="dialog"]', 'Revise as variáveis do texto', { timeout: 10000 }),
  },
}

export const textoPortariaUrls = {
  listagem: 'gestao/textos-de-portaria',
  cadastro: 'gestao/criar-textos-de-portaria',
}

export const TIPOS_DE_PORTARIA = [
  'Designação',
  'Cessação',
  'Insubsistência de Designação',
  'Insubsistência de Cessação',
  'Apostila de Designação',
  'Apostila de Cessação',
  'Anulação de Apostila',
  'Tornar sem efeito',
]

// A coluna "Tipo de portaria" da LISTAGEM usa um rótulo diferente do
// combobox de CADASTRO pra 3 dos 8 tipos (provável inconsistência de
// nomenclatura no próprio sistema, vale reportar ao time de dev).
export const TIPO_PORTARIA_NA_LISTAGEM = {
  'Designação': 'Designação',
  'Cessação': 'Cessação de Designação',
  'Insubsistência de Designação': 'Insubsistência de Designação',
  'Insubsistência de Cessação': 'Insubsistência de Cessação',
  'Apostila de Designação': 'Apostila de Designação',
  'Apostila de Cessação': 'Apostila de Cessação',
  'Anulação de Apostila': 'Insubsistência de Apostila',
  'Tornar sem efeito': 'Insubsistência de Insubsistência',
}
