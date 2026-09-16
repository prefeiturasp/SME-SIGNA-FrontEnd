// =====================================================
// LOCATORS — GESTÃO DE CARGOS BASE (Cadastro / Edição)
// =====================================================

const campoPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .invoke('attr', 'for')
    .then((forId) => cy.get(`#${forId}`))

const comboboxPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('button[role="combobox"]')

// Rótulo exibido → data-testid do Switch (SwitchField).
const SWITCH_TESTID_POR_LABEL = {
  'Utilizado para funções?': 'input-utilizacao-funcoes',
  'Utilizado para designações?': 'input-utilizacao-designacoes',
  'Utilizado para STE?': 'input-utilizado-para-ste',
  'Utilizado para permutas?': 'input-utilizado-para-permutas',
  'Cargo Base fictício?': 'input-cargo-base-ficticio',
  'Testar laudo?': 'input-testar-laudo',
  'Pesquisar Licenças no SIGPEC': 'input-pesquisar-licencas-no-sigpec',
}

export const gestaoCargoCadastroPack = {
  titulo: () =>
    cy.get('main', { timeout: 15000 }).contains('h1', 'Cadastrar cargo base', { timeout: 15000 }),

  campoPorLabel,
  comboboxPorLabel,

  codigoCargoEol: {
    trigger: () =>
      cy.get('[data-testid="select-codigo-cargo-eol"]', { timeout: 15000 }),
    opcoes: () =>
      cy.get('[cmdk-item], [role="option"]', { timeout: 10000 }),
  },

  switchPorLabel: (label) => {
    const testId = SWITCH_TESTID_POR_LABEL[label]
    if (!testId) {
      throw new Error(`Switch de "Utilização do cargo" não mapeado para o rótulo "${label}". Rótulos conhecidos: ${Object.keys(SWITCH_TESTID_POR_LABEL).join(', ')}`)
    }
    return cy.get(`[data-testid="${testId}"]`, { timeout: 10000 })
  },

  mensagensDeErro: () =>
    cy.get('p.text-destructive', { timeout: 10000 }),
}

export const gestaoCargoCadastroUrls = {
  pagina: 'gestao/criar-editar-cargo-base',
}
