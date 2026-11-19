// =====================================================
// MENU LATERAL (Sider antd, modo inline)
// =====================================================
// Estrutura do menu (app-new-sidebar.tsx, branch test, nov/2026). Itens com
// grupo ficam num submenu; os demais são folhas na raiz. Não existe mais o
// grupo "Início" — "Atos administrativos" passou para "Designações".

const GRUPO_DO_ITEM = {
  'atos administrativos': 'Designações',
  'publicação no diário oficial': 'Designações',
  'laudas': 'Designações',
  'cargos base': 'Designações',
  'textos de portaria': 'Designações',
  'gestão de acessos': 'Gestão',
  'gestão de remetentes': 'Gestão',
}

const textoExato = (texto) => new RegExp(`^\\s*${Cypress._.escapeRegExp(texto)}\\s*$`, 'i')

const expandirMenuLateral = () => {
  cy.get('aside', { timeout: 15000 }).then(($aside) => {
    if ($aside.hasClass('is-collapsed')) {
      cy.get('aside button[aria-label="Expandir menu"]').click({ force: true })
      cy.get('aside', { timeout: 8000 }).should('not.have.class', 'is-collapsed')
    }
  })
}

// Clica no título do submenu (não no <li>: o handler do antd fica no título)
// e só se ele ainda não estiver aberto — clicar num grupo aberto o fecha.
const abrirGrupo = (grupo) => {
  cy.contains('aside .ant-menu-submenu-title', textoExato(grupo), { timeout: 15000 })
    .then(($titulo) => {
      if (!$titulo.closest('.ant-menu-submenu').hasClass('ant-menu-submenu-open')) {
        cy.wrap($titulo).click({ force: true })
      }
    })
  // Confere pelo título: o <li> do grupo também contém o texto dos filhos,
  // então um match exato direto nele nunca bate.
  cy.contains('aside .ant-menu-submenu-title', textoExato(grupo))
    .closest('.ant-menu-submenu')
    .should('have.class', 'ant-menu-submenu-open')
}

export const navegarPeloMenuLateral = (item) => {
  expandirMenuLateral()

  const grupo = GRUPO_DO_ITEM[item.trim().toLowerCase()]
  if (grupo) abrirGrupo(grupo)

  cy.contains('aside .ant-menu-item', textoExato(item), { timeout: 15000 })
    .should('be.visible')
    .click({ force: true })
}
