// ==========================================
// SELECTORS - CESSAÇÃO DE DESIGNAÇÃO
// ==========================================

export const designacoesSelectors = {
  // 📍 Página / Dashboard
  dashboardUrl: '/dashboard',

  // 📍 Título da página
  tituloLista: () => cy.contains('Lista de designações', { timeout: 40000 }),

  // 📍 Tabela principal
  tabela: () => cy.get('table', { timeout: 40000 }),

  // 📍 Cabeçalhos (colunas)
  colunas: {
    rfIndicado: () => cy.contains('th', 'RF INDICADO', { timeout: 15000 }),
    servidorIndicado: () => cy.contains('th', 'SERVIDOR INDICADO', { timeout: 15000 }),
    rfTitular: () => cy.contains('th', 'RF TITULAR', { timeout: 15000 }),
    servidorTitular: () => cy.contains('th', 'SERVIDOR TITULAR', { timeout: 15000 }),
    sei: () => cy.contains('th', 'SEI', { timeout: 15000 }),
    portaria: () => cy.contains('th', 'PORTARIA DESIGNAÇÃO', { timeout: 15000 }),
    ano: () => cy.contains('th', 'ANO DESIGNAÇÃO', { timeout: 15000 }),
    dre: () => cy.contains('th', 'DRE', { timeout: 15000 }),
    unidade: () => cy.contains('th', 'UNIDADE', { timeout: 15000 }),
    cargo: () => cy.contains('th', 'CARGO', { timeout: 15000 }),
    status: () => cy.contains('th', 'Status', { timeout: 15000 }),
    action: () => cy.contains('th', 'Action', { timeout: 15000 }),
  },

  // 📍 Linhas da tabela
  linhas: () => cy.get('tbody tr', { timeout: 15000 }),

  // 📍 Linha específica
  linhaPorIndex: (index) => cy.get('tbody tr', { timeout: 15000 }).eq(index),

  // 📍 Coluna Action (última coluna)
  colunaAction: (index) => 
    cy.get('tbody tr', { timeout: 15000 })
      .eq(index)
      .find('td')
      .last(),

  // 📍 Botão dentro do Action
  botaoAction: (index) =>
    cy.get('tbody tr', { timeout: 15000 })
      .eq(index)
      .find('td')
      .last()
      .find('button', { timeout: 10000 }),

  // 📍 Opção "Cessar"
  opcaoCessar: () => 
    cy.contains('button', 'cessar', { timeout: 15000 }),

  // 📍 Tela de cessação
  telaCessacao: () => 
    cy.contains('Cessação', { timeout: 15000 }),

  // 📍 Elemento genérico da tela (fallback)
  telaCessacaoContainer: () =>
    cy.get('h1, h2, span').contains('Cessação'),
}
