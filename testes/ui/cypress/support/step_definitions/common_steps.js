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
  const username = Cypress.env('username')
  const password = Cypress.env('password')

  if (!username || !password) {
    throw new Error(
      'Credenciais não configuradas: defina USERNAME/SIGNA_USERNAME e PASSWORD/SIGNA_PASSWORD no arquivo .env (veja .env.example).'
    )
  }

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
  // Navegação já realizada no Contexto via sidebar — apenas valida o estado atual
  cy.url({ timeout: 40000 }).should('include', 'listagem-designacoes')
  cy.get('main', { timeout: 40000 }).should('be.visible')
  cy.get('.loading, .spinner, .loader').should('not.exist')
  cy.wait(1500)
})

Given('navega até o menu lateral e seleciona {string}', (menuItem) => {
  // Se o sidebar estiver colapsado (is-collapsed), qualquer evento no item de menu
  // dispara navegação em vez de abrir submenu. Expande o sidebar primeiro.
  cy.get('aside').then($aside => {
    if ($aside.hasClass('is-collapsed')) {
      // O botão hamburger (≡) é o primeiro <button> dentro do <aside>
      cy.get('aside').find('button').first().click({ force: true })
      cy.get('aside', { timeout: 8000 }).should('not.have.class', 'is-collapsed')
      cy.wait(600)
    }
  })

  cy.get('aside, nav', { timeout: 10000 }).should('be.visible')

  // Sidebar expandida: clicar no item abre submenu inline (sem navegar)
  // Filtra por :visible pois o Ant Design Menu mantém no DOM uma cópia oculta
  // (popup usado no modo flyout/colapsado) com o mesmo texto, e cy.contains
  // pegaria essa cópia oculta em vez do item realmente exibido.
  cy.contains('span:visible, a:visible, div:visible', new RegExp(`^${menuItem}$`, 'i'), { timeout: 15000 })
    .closest('li, [role="menuitem"]')
    .click({ force: true })

  cy.wait(800)
  cy.log(`✓ Menu lateral "${menuItem}" expandido`)
})

Given('seleciona o submenu {string}', (submenu) => {
  // Filtra por :visible para não colidir com a cópia oculta do popup do menu
  // (mesma questão descrita acima em "navega até o menu lateral e seleciona").
  //
  // {force: true}: o <span> do submenu fica com "pointer-events: none"
  // enquanto a transição CSS do menu Ant Design (abertura do acordeão do
  // item pai, clicado no step anterior) ainda está em andamento — condição
  // de corrida confirmada em execução real (CypressError "has CSS
  // pointer-events: none" em visualiza_designação.feature, mesmo com o
  // cy.wait(800) do step anterior já ter passado). Todo o resto do projeto
  // já usa force:true nos cliques do menu lateral por este mesmo motivo
  // (ver "navega até o menu lateral e seleciona {string}" logo acima);
  // este era o único click() sem force.
  cy.contains('span:visible, a:visible, div:visible', new RegExp(`^${submenu}$`, 'i'), { timeout: 15000 })
    .should('be.visible')
    .click({ force: true })
  cy.url({ timeout: 25000 }).should('include', 'listagem-designacoes')
  cy.get('main', { timeout: 15000 }).should('be.visible')
  cy.log(`✓ Submenu "${submenu}" selecionado — listagem carregada`)
});

Then('valida a existencia do Texto {string}', (texto) => {
  // Escopado em "main" para não colidir com textos do menu lateral (<aside>),
  // que pode conter substrings iguais às validadas no conteúdo da página
  // (ex.: "D.O" também aparece no item de menu "Alterar data do D.O").
  cy.get('main', { timeout: 15000 }).contains(texto, { timeout: 15000 }).should('be.visible')
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
  // Validação específica para tela de Editar Designação
  // URL real: /pages/designacoes/designacoes-passo-2?id=XX
  else if (telaLower.includes('editar')) {
    cy.url({ timeout: 15000 }).should('include', 'designacoes-passo-2')
    cy.log('✓ Navegação para tela de Editar Designação confirmada')
    cy.contains(/Editar Designação/i, { timeout: 15000 }).should('be.visible')
    cy.log(`✓ Tela "${tela}" carregada`)
  }
  // Validação específica para tela de Apostila
  // URL real: /pages/apostila?id=XX  (sem "r" final)
  // Texto real na página: "Apostila" (breadcrumb e título da seção)
  else if (telaLower.includes('apostil')) {
    // "Anular apostila" pode não navegar quando a portaria buscada não tem
    // apostila vinculada (ver "valida se a portaria possui apostila
    // vinculada para anular", atos_administrativos_steps.js) — resultado de
    // negócio válido, não uma falha. O flag é setado explicitamente por
    // aquele step antes deste rodar, então aqui só false (não undefined)
    // deve pular.
    if (Cypress.env('apostilaCessacaoTemDados') === false) {
      cy.log('⚠️ Skip: portaria sem apostila vinculada — não há tela de apostila para validar')
      return
    }
    cy.url({ timeout: 15000 }).should('include', 'apostila')
    cy.log('✓ Navegação para tela Apostila confirmada')
    cy.contains(/Apostila/i, { timeout: 15000 }).should('be.visible')
    cy.log('✓ Tela "Apostila" carregada')
  }
  // Validação genérica para outras telas
  else {
    cy.get('main', { timeout: 15000 }).contains(tela, { timeout: 15000 }).should('be.visible')
    cy.log(`✓ Tela "${tela}" carregada`)
  }
  
  cy.wait(1500)
});

When('o usuário clica em {string}', (opcao) => {
  cy.contains(opcao).click();
});
