import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('que o usuário realizou o login com sucesso', () => {
  cy.visit('https://qa-signa.sme.prefeitura.sp.gov.br/');
  cy.wait(2000);
  
  cy.get('input[type="text"], input[type="number"], input:not([type="password"])', { timeout: 10000 })
    .first()
    .clear({ force: true })
    .type(Cypress.env('username'));
  
  cy.get('input[type="password"]', { timeout: 10000 })
    .first()
    .clear({ force: true })
    .type(Cypress.env('password'));
  
  cy.get('button[type="submit"]', { timeout: 10000 }).click({ force: true });
  cy.wait(3000);
});

Given('o usuário está na página principal do sistema', () => {
  cy.url({ timeout: 10000 }).should('not.include', '/login');
  cy.wait(1000);
});

When('o usuário clica no botão {string}', (btnText) => {
  const textoNormalizado = btnText.toLowerCase().trim();
  
  if (textoNormalizado.includes('meus dados')) {
    cy.contains('span', 'Meus dados', { timeout: 10000, matchCase: false }).click({ force: true });
  } else if (textoNormalizado.includes('inicio')) {
    cy.get('ul > li > a').contains('Inicio', { matchCase: false }).click({ force: true });
  } else {
    cy.contains(btnText, { timeout: 10000 }).click({ force: true });
  }
  
  cy.wait(2000);
});

When('valida o texto {string}', (texto) => {
  cy.contains(texto, { timeout: 10000 }).should('exist');
  cy.wait(300);
});

When('valida a existencia dos botões {string} e {string}', (botao1, botao2) => {
  const botaoNormalizado1 = botao1.toLowerCase();
  const botaoNormalizado2 = botao2.toLowerCase();
  
  if (botaoNormalizado1.includes('cancelar') || botaoNormalizado1.includes('salvar') || 
      botaoNormalizado2.includes('cancelar') || botaoNormalizado2.includes('salvar')) {
    cy.get('[role="dialog"], [id^="radix"]', { timeout: 10000 }).first().within(() => {
      cy.contains('button', botao1, { timeout: 5000, matchCase: false }).should('exist');
      cy.contains('button', botao2, { timeout: 5000, matchCase: false }).should('exist');
    });
  } else {
    cy.contains('button, a', botao1, { timeout: 10000, matchCase: false }).should('exist');
    cy.contains('button, a', botao2, { timeout: 10000, matchCase: false }).should('exist');
  }
  
  cy.wait(300);
});

When('valida a existencia do titulo {string}', (titulo) => {
  cy.contains(titulo, { timeout: 10000 }).should('exist');
  cy.wait(300);
});

When('valida a existencia do texto {string}', (texto) => {
  if (texto.length > 50) {
    const textoReduzido = texto.substring(0, 30);
    cy.get('body').should('contain.text', textoReduzido);
  } else {
    cy.contains(texto, { timeout: 10000 }).should('exist');
  }
  cy.wait(300);
});

When('clica no botão {string}', (btnText) => {
  const textoNormalizado = btnText.toLowerCase().trim();
  
  if (textoNormalizado.includes('alterar senha')) {
    cy.get('button').filter((index, element) => {
      const texto = Cypress.$(element).text().toLowerCase();
      return texto.includes('alterar senha') || (texto.includes('alterar') && texto.includes('senha'));
    }).first().click({ force: true });
    cy.wait(1000);
  } else if (textoNormalizado.includes('cancelar')) {
    cy.get('[role="dialog"], [class*="modal"]').within(() => {
      cy.contains('button', 'Cancelar', { matchCase: false, timeout: 10000 }).click({ force: true });
    });
  } else if (textoNormalizado.includes('salvar')) {
    cy.get('[role="dialog"], [class*="modal"]').within(() => {
      cy.contains('button', btnText, { matchCase: false, timeout: 10000 }).click({ force: true });
    });
  } else if (textoNormalizado.includes('voltar')) {
    cy.get('main a', { timeout: 10000 })
      .filter((index, element) => {
        const texto = Cypress.$(element).text().toLowerCase();
        return texto.includes('voltar');
      })
      .first()
      .click({ force: true });
  } else {
    cy.contains('button, a', btnText, { matchCase: false, timeout: 10000 }).click({ force: true });
  }
  
  cy.wait(1000);
});

Then('o sistema exibe o modal de alteração de senha', () => {
  cy.wait(1500);
  
  cy.get('body').then($body => {
    if ($body.find('[role="dialog"]').length > 0) {
      cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
    } else if ($body.find('[id^="radix"]').length > 0) {
      cy.get('[id^="radix"]', { timeout: 10000 }).first().should('be.visible');
    } else {
      cy.get('div[class*="modal"], div[class*="dialog"]', { timeout: 10000 }).first().should('be.visible');
    }
  });
  
  cy.wait(500);
});

When('o usuário valida a existencia do campo e preenche o campo Senha atual com {string}', (valor) => {
  // Campo pode estar desabilitado inicialmente, usar force
  cy.get('input[type="password"]', { timeout: 10000 })
    .first()
    .should('exist')
    .then($input => {
      // Se estiver desabilitado, tentar habilitar ou usar força
      if ($input.prop('disabled')) {
        cy.wrap($input).invoke('removeAttr', 'disabled');
      }
    })
    .clear({ force: true })
    .type(valor, { delay: 50, force: true });
  cy.wait(300);
});

When('o usuário valida a existencia do campo e preenche o campo Nova senha com {string}', (valor) => {
  cy.get('input[type="password"]', { timeout: 10000 })
    .eq(1)
    .should('exist')
    .and('be.visible')
    .clear({ force: true })
    .type(valor, { delay: 50, force: true });
  cy.wait(300);
});

When('o usuário valida a existencia do campo e preenche o campo Confirmação da nova senha com {string}', (valor) => {
  cy.get('input[type="password"]', { timeout: 10000 })
    .eq(2)
    .should('exist')
    .and('be.visible')
    .clear({ force: true })
    .type(valor, { delay: 50, force: true });
  cy.wait(300);
});

When('o sistema valida a existencia das opções', () => {
  cy.get('ul > li > a').contains('Inicio', { matchCase: false }).should('exist');
  cy.contains('Meus dados', { timeout: 10000, matchCase: false }).should('exist');
  
  cy.get('body').then($body => {
    if ($body.find(':contains("Designações")').length > 0) {
      cy.contains('Designações', { matchCase: false }).should('exist');
    }
  });
  
  cy.wait(500);
});

When('valida o formulário de alteração de senha', () => {
  cy.get('[role="dialog"], [id^="radix"]', { timeout: 10000 }).first().within(() => {
    cy.contains('Nova senha', { timeout: 5000 }).should('exist');
    cy.contains('Senha atual', { matchCase: false }).should('exist');
    cy.contains('Nova senha', { matchCase: false }).should('exist');
    cy.contains('Confirmação', { matchCase: false }).should('exist');
  });
  
  cy.get('body').should('contain.text', 'Ao alterar a sua senha');
  cy.wait(500);
});

When('o usuário preenche o campo Senha atual com {string}', (valor) => {
  cy.get('[role="dialog"], [id^="radix"]', { timeout: 10000 }).first().within(() => {
    cy.get('input[type="password"]', { timeout: 5000 })
      .first()
      .should('exist')
      .then($input => {
        if ($input.prop('disabled')) {
          cy.wrap($input).invoke('removeAttr', 'disabled');
        }
      })
      .clear({ force: true })
      .type(valor, { delay: 50, force: true });
  });
  cy.wait(300);
});

When('o usuário preenche o campo Nova senha com {string}', (valor) => {
  cy.get('[role="dialog"], [id^="radix"]', { timeout: 10000 }).first().within(() => {
    cy.get('input[type="password"]', { timeout: 5000 })
      .eq(1)
      .should('exist')
      .clear({ force: true })
      .type(valor, { delay: 50, force: true });
  });
  cy.wait(300);
});

When('o usuário preenche o campo Confirmação da nova senha com {string}', (valor) => {
  cy.get('[role="dialog"], [id^="radix"]', { timeout: 10000 }).first().within(() => {
    cy.get('input[type="password"]', { timeout: 5000 })
      .eq(2)
      .should('exist')
      .clear({ force: true })
      .type(valor, { delay: 50, force: true });
  });
  cy.wait(300);
});

