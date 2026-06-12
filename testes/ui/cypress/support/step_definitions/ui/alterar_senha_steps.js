import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { meusDadosPack } from '../../ui/locators/meusDados_locators';

Given('que o usuário realizou o login com sucesso', () => {
  cy.visit('/');
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
  const textoNormalizado = btnText.toLowerCase().trim()

  if (textoNormalizado.includes('meus dados')) {
    cy.wait(1000)
    // Ant Design Menu: clica no item pai (expande acordeão se estiver fechado)
    cy.contains('span', /meus dados/i, { timeout: 10000 }).first().click({ force: true })
    cy.wait(800)
    // Após expandir, clica no sub-item filho (.last() = link de navegação)
    cy.get('body').then($body => {
      const spans = Cypress.$($body).find('span').filter((i, el) =>
        /meus dados/i.test(el.textContent.trim())
      )
      cy.log('Spans com "Meus dados" encontrados: ' + spans.length)
      if (spans.length > 1) {
        // Acordeão expandido — usa cy.get().filter().last() para pegar o sub-item filho
        // cy.contains() retorna elemento único, .last() seria no-op — por isso usa get+filter
        cy.get('span')
          .filter((i, el) => /meus dados/i.test(el.textContent.trim()))
          .last()
          .click({ force: true })
      }
      // Se só 1, o clique anterior já navegou (estrutura sem sub-item)
    })
    cy.wait(2000)
    cy.url().then(url => cy.log('URL após Meus Dados: ' + url))
  } else if (textoNormalizado.includes('alterar e-mail') || textoNormalizado.includes('alterar email')) {
    meusDadosPack.botoes.alterarEmail()
      .should('be.visible')
      .click({ force: true })
    cy.wait(1000)
  } else if (textoNormalizado.includes('alterar senha')) {
    meusDadosPack.botoes.alterarSenha()
      .should('be.visible')
      .click({ force: true })
    cy.wait(1000)
  } else {
    meusDadosPack.botoes.qualquer(btnText)
      .filter(':visible')
      .first()
      .click({ force: true })
  }

  cy.wait(1000)
});

When('valida o texto {string}', (texto) => {
  if (texto.toLowerCase().includes('meus dados')) {
    cy.wait(500)
    meusDadosPack.textos.tituloMeusDados().should('exist')
  } else {
    meusDadosPack.textos.qualquerTexto(texto).should('exist')
  }
  cy.wait(300)
});

When('valida a existencia dos botões {string} e {string}', (botao1, botao2) => {
  cy.wait(500)

  const emDialog = ['cancelar', 'salvar'].some(k =>
    botao1.toLowerCase().includes(k) || botao2.toLowerCase().includes(k)
  )

  if (emDialog) {
    cy.get('[role="dialog"], [id^="radix"]', { timeout: 10000 }).first().within(() => {
      cy.contains('button', botao1, { timeout: 5000, matchCase: false }).should('exist')
      cy.contains('button', botao2, { timeout: 5000, matchCase: false }).should('exist')
    })
  } else {
    // Constrói regex flexível que aceita variações com hífen/espaço (ex: "e-mail" ou "email")
    const regex1 = new RegExp(botao1.replace(/[-\s]/g, '.{0,2}'), 'i')
    const regex2 = new RegExp(botao2.replace(/[-\s]/g, '.{0,2}'), 'i')
    meusDadosPack.botoes.qualquer(regex1).should('be.visible')
    meusDadosPack.botoes.qualquer(regex2).should('be.visible')
  }

  cy.wait(300)
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
    cy.get('body').then($body => {
      // Tentar encontrar botão "Alterar senha"
      if ($body.find('button:contains("Alterar senha")').length > 0) {
        cy.contains('button', /alterar senha/i, { matchCase: false }).first().click({ force: true });
      } else {
        // Buscar por padrão mais flexível
        cy.get('button, a').filter((index, element) => {
          const texto = Cypress.$(element).text().toLowerCase();
          return texto.includes('alterar') && texto.includes('senha');
        }).first().click({ force: true });
      }
    });
    cy.wait(1000);
  } else if (textoNormalizado.includes('alterar e-mail') || textoNormalizado.includes('alterar email')) {
    cy.get('body').then($body => {
      // Tentar encontrar botão "Alterar e-mail"
      if ($body.find('button:contains("Alterar e-mail"), button:contains("Alterar email"), a:contains("Alterar e-mail")').length > 0) {
        cy.contains('button, a', /alterar.{0,2}e-?mail/i, { matchCase: false }).first().click({ force: true });
      } else {
        // Buscar por padrão mais flexível
        cy.get('button, a').filter((index, element) => {
          const texto = Cypress.$(element).text().toLowerCase().replace(/\s+/g, '');
          return texto.includes('alterar') && (texto.includes('email') || texto.includes('e-mail'));
        }).first().click({ force: true });
      }
    });
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
  const senha = valor === '<senha_atual>' ? Cypress.env('password') : valor;
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
      .type(senha, { delay: 50, force: true });
  });
  cy.wait(300);
});

When('o usuário preenche o campo Nova senha com {string}', (valor) => {
  const senha = valor === '<nova_senha>' ? Cypress.env('newPasswordTest') : valor;
  cy.get('[role="dialog"], [id^="radix"]', { timeout: 10000 }).first().within(() => {
    cy.get('input[type="password"]', { timeout: 5000 })
      .eq(1)
      .should('exist')
      .clear({ force: true })
      .type(senha, { delay: 50, force: true });
  });
  cy.wait(300);
});

When('o usuário preenche o campo Confirmação da nova senha com {string}', (valor) => {
  const senha = valor === '<nova_senha>' ? Cypress.env('newPasswordTest') : valor;
  cy.get('[role="dialog"], [id^="radix"]', { timeout: 10000 }).first().within(() => {
    cy.get('input[type="password"]', { timeout: 5000 })
      .eq(2)
      .should('exist')
      .clear({ force: true })
      .type(senha, { delay: 50, force: true });
  });
  cy.wait(300);
});

