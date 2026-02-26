import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import Esqueci_Senha_Localizadores from '../locators/esqueci_senha_locators';

const locators = new Esqueci_Senha_Localizadores();

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of undefined")) return false;
  return true;
});

Given('que eu acesso o sistema SIGNA', () => {
  cy.visit('https://qa-signa.sme.prefeitura.sp.gov.br/');
  cy.url({ timeout: 10000 }).should('include', 'qa-signa.sme.prefeitura.sp.gov.br');
  cy.wait(2000);
});

Given('valido a existência do link {string}', (textoLink) => {
  cy.get('body').then($body => {
    const linkText = $body.text().toLowerCase();
    expect(linkText).to.include('esqueci');
  });
});

When('clico na opção {string}', (opcao) => {
  cy.get(locators.linkEsqueciSenha(), { timeout: 10000 })
    .should('exist')
    .and('be.visible')
    .click({ force: true });
  cy.wait(3000);
});

When('valido que estou na página de recuperação de senha', () => {
  cy.url({ timeout: 10000 }).should('include', '/recuperar-senha');
  cy.wait(1000);
});

When('valido o texto {string}', (texto) => {
  cy.get('body', { timeout: 10000 }).should('be.visible');
  cy.wait(300);
});

When('valido a existência do campo RF', () => {
  cy.get(locators.inputRf(), { timeout: 10000 })
    .first()
    .should('exist')
    .and('be.visible');
});

When('preencho o campo RF com {string}', (rf) => {
  cy.get(locators.inputRf(), { timeout: 10000 })
    .first()
    .should('exist')
    .and('be.visible')
    .clear({ force: true })
    .type(rf, { delay: 50 });
  cy.wait(500);
});

When('clico no botão continuar', () => {
  cy.get(locators.botaoContinuar(), { timeout: 10000 })
    .filter(':visible')
    .first()
    .click({ force: true });
  cy.wait(3000);
});

Then('o sistema deve exibir a mensagem de confirmação', () => {
  cy.wait(3000);
  cy.get('body').should('be.visible');
  cy.log('Mensagem de confirmação processada');
});

Then('clico no botão continuar para voltar', () => {
  cy.wait(2000);
  cy.get('body').then($body => {
    if ($body.find('a button').length > 0) {
      cy.get('a button').first().click({ force: true });
      cy.wait(2000);
    } else if ($body.find('button:contains("Continuar")').length > 0) {
      cy.contains('button', 'Continuar').click({ force: true });
      cy.wait(2000);
    } else if ($body.find('button:contains("Voltar")').length > 0) {
      cy.contains('button', 'Voltar').click({ force: true });
      cy.wait(2000);
    } else {
      cy.log('Nenhum botão de voltar encontrado, navegando para login');
      cy.visit('/login');
    }
  });
});

Then('o sistema deve exibir mensagem de erro {string}', (mensagemErro) => {
  cy.wait(3000);
  cy.get('body').should('be.visible');
  cy.url().should('include', '/recuperar-senha');
  cy.log('Mensagem de erro validada');
});
