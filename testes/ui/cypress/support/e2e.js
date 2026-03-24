require('@shelex/cypress-allure-plugin');

import 'cypress-cucumber-preprocessor/steps';

import './commands';
import './commands_ui/commands_globais';
import './commands_ui/commands_login';

Cypress.on('uncaught:exception', () => false);

beforeEach(() => {
  cy.viewport(1920, 1080);
});

afterEach(function () {
  if (this.currentTest.state === 'failed') {
    const testName = this.currentTest.title.replace(/\s+/g, '_');
    cy.screenshot(`failed-${testName}`);
  }
});