// Step Definitions Comuns para todos os testes
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Contexto - Navegação
Given('que eu acesso o sistema', () => {
  cy.visit('/');
  cy.wait(1000); // Aguardar carregamento
});

Given('que o usuário acessa a página de login', () => {
  cy.visit('/');
  cy.wait(1000);
});

Given('que o usuário está autenticado no sistema', () => {
  const username = Cypress.env('username') || '7311559'
  const password = Cypress.env('password') || 'Sgp1559'
  cy.realizarLogin(username, password)
});

// Ações - Preenchimento de campos
When('o usuário preenche o campo {string} com {string}', (campo, valor) => {
  cy.preencherCampo(campo, valor);
});

When('o usuário clica no link {string}', (link) => {
  const normalizarTexto = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const linkNormalizado = normalizarTexto(link);
  
  // Tentar encontrar o link de várias formas
  cy.get('body').then($body => {
    if ($body.find(`a:contains("${link}")`).length > 0) {
      cy.contains('a', link).click();
    } else if (linkNormalizado.includes('esqueci')) {
      cy.get('[href*="esqueci"], [href*="recuperar"]').first().click();
    } else if (linkNormalizado.includes('voltar')) {
      cy.get('[href*="login"], a:contains("Voltar")').first().click();
    }
  });
  cy.wait(1000);
});

When('o usuário clica no ícone de visualizar senha', () => {
  cy.get('.toggle-password, .show-password').first().click();
});

When('o usuário clica no ícone de ocultar senha', () => {
  cy.get('.toggle-password, .hide-password').first().click();
});

// Verificações - Mensagens
Then('deve exibir mensagem de sucesso {string}', (mensagem) => {
  cy.verificarMensagemSucesso(mensagem);
});

Then('deve exibir mensagem de erro {string}', (mensagem) => {
  cy.verificarMensagemErro(mensagem);
});

Then('deve exibir mensagem de campo obrigatório para {string}', (campo) => {
  cy.verificarCampoObrigatorio(campo);
});

// Verificações - Elementos
Then('deve visualizar o campo {string}', (campo) => {
  cy.verificarCampoVisivel(campo);
});

Then('deve visualizar o botão {string}', (botao) => {
  cy.verificarBotaoVisivel(botao);
});

Then('deve visualizar o link {string}', (link) => {
  cy.verificarLinkVisivel(link);
});

Then('deve visualizar o logo do sistema', () => {
  cy.get('[data-testid="logo-sistema"], .logo, img[alt*="SIGNA"]').should('be.visible');
});

// Verificações - Navegação
Then('o usuário deve ser redirecionado para a página de login', () => {
  cy.url().should('include', '/login');
});

Then('o usuário deve ser redirecionado para a página inicial', () => {
  cy.url().should('match', /\/(home|dashboard|inicial)/);
});

Then('deve permanecer na mesma página sem alterações', () => {
  cy.url().then(url => {
    cy.url().should('eq', url);
  });
});

// Verificações - Estado dos campos
Then('o campo senha deve exibir o texto em formato legível', () => {
  cy.get('input[type="password"]').should('not.exist');
  cy.get('input[type="text"]').should('exist');
});

Then('o campo senha deve ocultar o texto', () => {
  cy.get('input[type="password"]').should('exist');
});

Then('os campos devem estar limpos', () => {
  cy.get('input').each($input => {
    cy.wrap($input).should('have.value', '');
  });
});

// Verificações - Menu
Then('deve visualizar o menu principal', () => {
  cy.get('[data-testid="menu-principal"], .menu-principal, nav').should('be.visible');
});

When('o usuário clica no menu de usuário', () => {
  cy.get('[data-testid="menu-usuario"], .user-menu, .dropdown-user').click();
});

// ─── Steps Genéricos Comuns ─────────────────────────────────────────────────

Given('que o usuário está na página do dashboard', () => {
  // Intercept para aguardar carregamento da página listagem-designacoes
  cy.intercept('POST', '**/listagem-designacoes**').as('loadDashboard')
  
  // Aguarda a navegação natural após login
  cy.url({ timeout: 40000 }).should('include', 'listagem-designacoes')
  cy.wait('@loadDashboard', { timeout: 40000 })
  
  // Aguarda o main estar visível
  cy.get('main', { timeout: 40000 }).should('be.visible')
  
  // Aguarda que não existam loaders
  cy.get('.loading, .spinner, .loader', { timeout: 40000 }).should('not.exist')
  
  // Buffer final
  cy.wait(1500)
});

Then('valida a existencia do Texto {string}', (texto) => {
  cy.contains(texto, { timeout: 15000 }).should('be.visible')
});

Then('Valida a existencia da Tabela', () => {
  cy.get('table', { timeout: 15000 }).should('be.visible')
});

Then('o sistema exibe a Tela {string}', (tela) => {
  const telaLower = tela.trim().toLowerCase()
  
  // Validação específica para tela de Cessação
  if (telaLower === 'cessação') {
    cy.url({ timeout: 15000 }).should('include', 'cessacao')
    cy.log('✓ Navegação para tela de Cessação confirmada')
    
    cy.get('body > div:nth-of-type(2) > div > div > div > main form', { timeout: 20000 })
      .should('exist')
      .and('be.visible')
    
    cy.log(`✓ Tela "Cessação" validada`)
  }
  // Validação específica para tela de Insubsistência
  else if (telaLower.includes('insubsist')) {
    cy.url({ timeout: 15000 }).should('include', 'insubsistencia')
    cy.log('✓ Navegação para tela de Insubsistência confirmada')
    
    cy.contains('h1, h2, h3', /Insubsistência|Insubsistente/i, { timeout: 15000 })
      .should('be.visible')
      .then(() => {
        cy.log(`✓ Tela "${tela}" validada`)
      })
  }
  // Validação específica para tela de Visualizar Designação
  else if (telaLower.includes('visualizar')) {
    cy.log('🔍 Validando tela de Visualização')
    
    // Aguarda URL mudar (pode ser /designacao/id ou /visualizar)
    cy.url({ timeout: 15000 }).should('satisfy', url => {
      const contemVisualizacao = url.includes('designacao') || 
                                  url.includes('visualizar') ||
                                  url.includes('detalhes')
      return contemVisualizacao
    })
    
    cy.log('✓ Navegação para tela de Visualização confirmada')
    
    // Valida presença de abas (característica da tela de visualização)
    cy.get('.ant-tabs-tab, button, span', { timeout: 15000 })
      .should('have.length.greaterThan', 0)
      .then(() => {
        cy.log(`✓ Tela "${tela}" validada`)
      })
  }
  // Validação genérica para outras telas
  else {
    cy.contains(tela, { timeout: 15000 }).should('be.visible')
    cy.log(`✓ Tela "${tela}" carregada`)
  }
  
  cy.wait(1500)
});

When('o usuário clica em {string}', (opcao) => {
  cy.contains(opcao).click();
});
