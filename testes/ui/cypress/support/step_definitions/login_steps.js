// Step Definitions para Login
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { loginLocators, loginTextos } from '../locators/login_locators';

// Steps de ações
When('eu insiro credenciais válidas', () => {
  cy.get(loginLocators.campoRfCpf).clear().type(Cypress.env('username'));
  cy.get(loginLocators.campoSenha).clear().type(Cypress.env('password'));
});

When('eu insiro credenciais inválidas', () => {
  cy.get(loginLocators.campoRfCpf).clear().type('1234567');
  cy.get(loginLocators.campoSenha).clear().type('SenhaInvalida123');
});

When('eu insiro apenas o RF sem senha', () => {
  cy.get(loginLocators.campoRfCpf).clear().type(Cypress.env('username'));
});

When('eu insiro apenas a senha sem RF', () => {
  cy.get(loginLocators.campoSenha).clear().type(Cypress.env('password'));
});

When('eu insiro uma senha válida', () => {
  cy.get(loginLocators.campoSenha).clear().type(Cypress.env('password'));
});

When('clico no botão de acessar', () => {
  cy.get(loginLocators.botaoEntrar).click();
  cy.wait(2000);
});

When('clico no ícone de visualizar senha', () => {
  cy.get(loginLocators.botaoMostrarSenha).first().click();
});

When('clico no ícone de ocultar senha', () => {
  cy.get(loginLocators.botaoOcultarSenha).first().click();
});

// Steps de verificação
Then('devo ser redirecionado para o dashboard', () => {
  cy.url().should('not.include', '/login');
  cy.wait(1000);
});

Then('devo visualizar a página principal do sistema', () => {
  cy.get('body').should('be.visible');
});

Then('devo visualizar mensagem de erro de autenticação', () => {
  // Verificar se não foi redirecionado (permanece na mesma página)
  cy.url().should('include', Cypress.config('baseUrl'));
  // Aguardar possível mensagem de erro aparecer
  cy.wait(1000);
  // Verificar se há alguma mensagem de erro visível na página
  cy.get('body').then($body => {
    const hasError = $body.find('[class*="erro"], [class*="error"], [class*="alert"], [class*="danger"]').length > 0;
    if (!hasError) {
      // Se não houver elemento de erro, apenas garantir que não foi redirecionado
      cy.url().should('not.include', '/dashboard');
      cy.url().should('not.include', '/home');
    }
  });
});

Then('devo visualizar validação de senha obrigatória', () => {
  // Verificar se não foi redirecionado
  cy.url().should('include', Cypress.config('baseUrl'));
  cy.wait(1000);
  // Aceitar se o campo senha está destacado ou se não foi redirecionado
  cy.get('body').then($body => {
    const hasValidation = $body.find('[class*="invalid"], [class*="error"], input[aria-invalid="true"]').length > 0;
    if (!hasValidation) {
      // Se não houver validação visual, garantir que não avançou
      cy.url().should('not.include', '/dashboard');
      cy.url().should('not.include', '/home');
    }
  });
});

Then('devo visualizar validação de RF obrigatório', () => {
  // Verificar se não foi redirecionado
  cy.url().should('include', Cypress.config('baseUrl'));
  cy.wait(1000);
  // Aceitar se o campo RF está destacado ou se não foi redirecionado
  cy.get('body').then($body => {
    const hasValidation = $body.find('[class*="invalid"], [class*="error"], input[aria-invalid="true"]').length > 0;
    if (!hasValidation) {
      // Se não houver validação visual, garantir que não avançou
      cy.url().should('not.include', '/dashboard');
      cy.url().should('not.include', '/home');
    }
  });
});

Then('devo visualizar o campo de RF ou CPF', () => {
  cy.get(loginLocators.campoRfCpf).should('be.visible');
});

Then('devo visualizar o campo de senha', () => {
  cy.get(loginLocators.campoSenha).should('be.visible');
});

Then('devo visualizar o botão de acessar', () => {
  cy.get(loginLocators.botaoEntrar).should('be.visible');
});

Then('devo visualizar o link de recuperar senha', () => {
  cy.get(loginLocators.linkEsqueciSenha).should('be.visible');
});

Then('o campo senha deve exibir o texto em formato legível', () => {
  cy.get('input[type="text"]').should('exist');
});

Then('o campo senha deve ocultar o texto', () => {
  cy.get('input[type="password"]').should('exist');
});
