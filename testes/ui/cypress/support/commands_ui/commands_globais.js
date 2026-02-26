// Commands Globais para o projeto SIGNA
// Comandos reutilizáveis em todo o projeto

import { loginLocators } from '../locators/login_locators';

/**
 * Comando para preencher um campo genérico
 * @param {string} campo - Nome do campo a ser preenchido
 * @param {string} valor - Valor a ser inserido
 */
Cypress.Commands.add('preencherCampo', (campo, valor) => {
  const normalizarCampo = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const campoNormalizado = normalizarCampo(campo);
  
  // Mapear campos comuns
  const mapeamentoCampos = {
    'rf ou cpf': loginLocators.campoRfCpf,
    'rf': loginLocators.campoRfCpf,
    'cpf': loginLocators.campoRfCpf,
    'senha': 'input[type="password"], input[name*="senha"]',
    'senha atual': 'input[name*="senhaAtual"], input[placeholder*="Senha Atual"]',
    'nova senha': 'input[name*="novaSenha"], input[placeholder*="Nova Senha"]',
    'confirmar nova senha': 'input[name*="confirmar"], input[placeholder*="Confirmar"]',
    'novo e-mail': 'input[name*="novoEmail"], input[placeholder*="Novo E-mail"]',
    'confirmar e-mail': 'input[name*="confirmarEmail"], input[placeholder*="Confirmar E-mail"]',
    'e-mail': 'input[type="email"], input[name*="email"]'
  };
  
  const seletor = mapeamentoCampos[campoNormalizado] || `input[placeholder*="${campo}"], input[name*="${campo}"]`;
  
  cy.get(seletor).first().clear().type(valor);
});

/**
 * Comando para clicar em um botão
 * @param {string} botao - Texto do botão
 */
Cypress.Commands.add('clicarBotao', (botao) => {
  cy.contains('button', botao).click();
});

/**
 * Comando para clicar em um link
 * @param {string} link - Texto do link
 */
Cypress.Commands.add('clicarLink', (link) => {
  cy.contains('a', link).click();
});

/**
 * Comando para verificar mensagem de sucesso
 * @param {string} mensagem - Mensagem esperada
 */
Cypress.Commands.add('verificarMensagemSucesso', (mensagem) => {
  cy.get('[data-testid="mensagem-sucesso"], .alert-success, .success-message, .mensagem-sucesso')
    .should('be.visible')
    .and('contain.text', mensagem);
});

/**
 * Comando para verificar mensagem de erro
 * @param {string} mensagem - Mensagem esperada
 */
Cypress.Commands.add('verificarMensagemErro', (mensagem) => {
  cy.get('[data-testid="mensagem-erro"], .alert-danger, .error-message, .mensagem-erro')
    .should('be.visible')
    .and('contain.text', mensagem);
});

/**
 * Comando para verificar campo obrigatório
 * @param {string} campo - Nome do campo
 */
Cypress.Commands.add('verificarCampoObrigatorio', (campo) => {
  cy.contains('label', campo)
    .parent()
    .find('.campo-obrigatorio, .error-text, .invalid-feedback')
    .should('be.visible');
});

/**
 * Comando para verificar se um campo está visível
 * @param {string} campo - Nome do campo
 */
Cypress.Commands.add('verificarCampoVisivel', (campo) => {
  cy.contains('label', campo).should('be.visible');
  cy.get(`input[placeholder*="${campo}"], input[name*="${campo}"]`).should('be.visible');
});

/**
 * Comando para verificar se um botão está visível
 * @param {string} botao - Texto do botão
 */
Cypress.Commands.add('verificarBotaoVisivel', (botao) => {
  cy.contains('button', botao).should('be.visible');
});

/**
 * Comando para verificar se um link está visível
 * @param {string} link - Texto do link
 */
Cypress.Commands.add('verificarLinkVisivel', (link) => {
  cy.contains('a', link).should('be.visible');
});

/**
 * Comando para aguardar carregamento da página
 */
Cypress.Commands.add('aguardarCarregamento', () => {
  cy.get('.loading, .spinner, .loader').should('not.exist');
  cy.get('body').should('be.visible');
});

/**
 * Comando para fazer screenshot com nome customizado
 * @param {string} nome - Nome do screenshot
 */
Cypress.Commands.add('capturarTela', (nome) => {
  const timestamp = new Date().getTime();
  cy.screenshot(`${nome}-${timestamp}`);
});

/**
 * Comando para limpar todos os campos de um formulário
 */
Cypress.Commands.add('limparFormulario', () => {
  cy.get('input').each($input => {
    if (!$input.prop('disabled')) {
      cy.wrap($input).clear();
    }
  });
});

/**
 * Comando para validar URL
 * @param {string} urlEsperada - URL ou parte da URL esperada
 */
Cypress.Commands.add('validarUrl', (urlEsperada) => {
  cy.url().should('include', urlEsperada);
});

/**
 * Comando para verificar se elemento existe
 * @param {string} seletor - Seletor CSS do elemento
 */
Cypress.Commands.add('elementoExiste', (seletor) => {
  cy.get(seletor).should('exist');
});

/**
 * Comando para verificar se elemento não existe
 * @param {string} seletor - Seletor CSS do elemento
 */
Cypress.Commands.add('elementoNaoExiste', (seletor) => {
  cy.get(seletor).should('not.exist');
});
