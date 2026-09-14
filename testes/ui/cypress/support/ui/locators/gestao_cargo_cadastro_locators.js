// =====================================================
// LOCATORS — GESTÃO DE CARGOS BASE (Cadastro / Edição)
// =====================================================
// Tela /pages/gestao/criar-editar-cargo-base, aberta a partir do botão
// "Cadastrar novo cargo" da listagem (gestao_cargos_base_locators.js).
// Confirmado contra o código-fonte real (não só inspeção de tela):
//   - src/app/pages/gestao/criar-editar-cargo-base/page.tsx
//   - src/components/dashboard/Gestao/FormCargosBase/FormCargosBasePrincipal.tsx
//   - src/components/dashboard/Gestao/FormCargosBase/FormCargosBaseSecundario.tsx
//   - src/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase.ts
//
// "Código do cargo no EOL" usa um Combobox pesquisável (Popover + cmdk, não
// o mesmo Select shadcn dos outros 3 campos) — as opções vêm de uma lista
// carregada via API (useBuscarCargosBase), então não há valores fixos pra
// selecionar; os steps escolhem uma opção aleatória entre as visíveis.
//
// "Testar laudo?" e "Pesquisar Licenças no SIGPEC" (vistos na tela ao vivo)
// NÃO existem em FormCargosBaseSecundario.tsx neste checkout local —
// checkout desatualizado em relação ao publicado em QA (confirmado por
// inspeção real do DOM). "Pesquisar Licenças no SIGPEC" habilitado revela um
// campo condicional extra, "Quantidade máxima de dias de licença", que usa o
// mesmo padrão de <label for="..."> dos outros campos do formulário — por
// isso reaproveita campoPorLabel() abaixo em vez de um locator próprio.

const campoPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .invoke('attr', 'for')
    .then((forId) => cy.get(`#${forId}`))

const comboboxPorLabel = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('button[role="combobox"]')

// Rótulo exibido → data-testid do Switch (SwitchField), confirmado em
// FormCargosBaseSecundario.tsx.
//
// "Testar laudo?" (input-testar-laudo) foi confirmado com data-testid
// próprio em inspeção real do DOM em QA (2026-09-09) — o comentário antigo
// aqui dizia que ele não tinha e localizava por posição fixa entre os
// [role="switch"] (frágil: quebra se a ordem visual mudar); hoje tem testid
// igual aos outros, não precisa mais do fallback posicional.
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
    // cmdk (biblioteca por trás do Combobox) marca cada item com o atributo
    // "cmdk-item" — não documentado via prop React, comportamento padrão da
    // lib. [role="option"] entra como reforço caso a versão em uso difira.
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

  // FormMessage (src/components/ui/form.tsx) renderiza erro de validação
  // como <p class="... text-destructive">; só existe no DOM quando há erro
  // (senão o componente retorna um espaço em branco vazio ou nada).
  mensagensDeErro: () =>
    cy.get('p.text-destructive', { timeout: 10000 }),
}

export const gestaoCargoCadastroUrls = {
  pagina: 'gestao/criar-editar-cargo-base',
}
