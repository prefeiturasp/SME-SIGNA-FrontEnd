// =====================================================
// LOCATORS — TEXTOS DE PORTARIA (Listagem / Modal / Cadastro)
// =====================================================
// Telas cobertas:
//   - /pages/gestao/textos-de-portaria       (listagem — textoPortariaPack.listagem)
//   - modal "Novo texto de portaria"         (textoPortariaPack.modalNovoTexto)
//   - /pages/gestao/criar-textos-de-portaria (cadastro — textoPortariaPack.cadastro)
//   - modal "Revise as variáveis do texto"   (textoPortariaPack.modalRevisarVariaveis)
//
// Tela não existe neste checkout local (fora de src/ — mesma situação já
// documentada em gestao_cargo_cadastro_locators.js pra "Testar laudo?"):
// todos os seletores abaixo vêm de inspeção real do DOM em QA (2026-09-11,
// via playwright-extension), não de leitura de componente React.
//
// Mesmo padrão de campoPorLabel/comboboxPorLabel de
// gestao_cargo_cadastro_locators.js: label e campo são irmãos dentro do
// mesmo <div class="space-y-2"> (shadcn Form), então basta subir pro pai do
// label e procurar o elemento de input/combobox ali dentro.

const campoPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('input, textarea')

const comboboxPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('button[role="combobox"]')

// "Variavel*" usa um botão próprio com aria-haspopup="listbox" (não
// button[role="combobox"] como os outros 3 campos de seleção da tela) —
// por isso não reaproveita comboboxPorLabel.
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
    // Radix Dialog não renderiza "Novo texto de portaria" e "Revise as
    // variáveis do texto" ao mesmo tempo — escopar pelo texto do heading
    // (em vez de pegar o primeiro [role="dialog"] do DOM) evita ambiguidade
    // caso mais de um dialog exista montado e oculto.
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

    // Editor rich-text (Tiptap/ProseMirror) — não é um <textarea>, por isso
    // não entra em campoPorLabel. Selecionar uma "Variavel" insere o
    // placeholder [[NOME]] correspondente aqui automaticamente; texto
    // digitado à mão deve ser adicionado DEPOIS de selecionar as variáveis
    // (cy.type acrescenta no cursor — não usar .clear() nem set direto do
    // value, que substituem o conteúdo inteiro e apagam os placeholders já
    // inseridos, confirmado em inspeção manual).
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

// Os 8 tipos de portaria do combobox "Tipo de portaria" da tela de
// cadastro, na ordem em que aparecem no DOM (confirmado em QA) — um modelo
// de texto por tipo é a única forma de cobrir o combobox inteiro.
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
// combobox da tela de CADASTRO pra 3 dos 8 tipos — confirmado em execução
// real em QA (2026-09-11, print da listagem após cadastrar os 8 modelos):
// um modelo cadastrado com "Tornar sem efeito" no combobox aparece na
// listagem como "Insubsistência de Insubsistência"; um cadastrado com
// "Anulação de Apostila" aparece como "Insubsistência de Apostila"; um
// cadastrado com "Cessação" aparece como "Cessação de Designação". Os
// outros 5 tipos usam o mesmo texto nas duas telas. Provável inconsistência
// de nomenclatura no próprio sistema (mesmo valor de backend, rótulo de
// exibição diferente por tela) — vale reportar pro time de desenvolvimento,
// não é só um detalhe de teste.
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
