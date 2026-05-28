import { designacoesSelectors as s } from '../../ui/locators/designacoes_locators'

Cypress.Commands.add('fluxoCessacaoDesignacao', () => {
  // Nota: Autenticação já foi feita pelo step "Dado que o usuário está autenticado no sistema"
  // Este comando agora apenas valida a página de cessação (sem fazer cy.visit, pois já estamos autenticados)
  
  s.tituloLista().should('be.visible')
  s.tabela().should('be.visible')

  // Validação das colunas
  Object.values(s.colunas).forEach(col => {
    col().should('be.visible')
  })

  // Seleção aleatória de designação
  s.linhas().then(rows => {
    const index = Math.floor(Math.random() * rows.length)
    s.botaoAction(index).click()
  })

  // Cessar
  s.opcaoCessar().click()
  s.telaCessacao().should('be.visible')
})
