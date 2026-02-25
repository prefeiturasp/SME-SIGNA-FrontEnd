// Arquivo principal de suporte do Cypress
// Importa todos os comandos personalizados e configurações

// Importar comandos do Cypress
import './commands';

// Importar comandos personalizados
import './commands_ui/commands_globais';
import './commands_ui/commands_login';

// Configurações globais
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retorna false para prevenir que erros não capturados falhem o teste
  // Útil para ignorar erros de terceiros que não afetam o teste
  return false;
});

// Before hook global - executa antes de cada teste
beforeEach(() => {
  // Configurar viewport padrão
  cy.viewport(1920, 1080);
});

// After hook global - executa após cada teste
afterEach(function() {
  // Capturar screenshot em caso de falha
  if (this.currentTest.state === 'failed') {
    const testName = this.currentTest.title.replace(/\s+/g, '_');
    cy.screenshot(`failed-${testName}`);
  }
});
