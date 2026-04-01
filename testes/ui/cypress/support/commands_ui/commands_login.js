// Commands específicos para Login
import { loginLocators, loginUrls } from '../locators/login_locators';

/**
 * Comando para realizar login no sistema
 * @param {string} usuario - RF ou CPF do usuário
 * @param {string} senha - Senha do usuário
 */
Cypress.Commands.add('realizarLogin', (usuario, senha) => {
  cy.visit('/login');
  cy.get(loginLocators.campoRfCpf).clear().type(usuario);
  cy.get(loginLocators.campoSenha).clear().type(senha);
  cy.get(loginLocators.botaoEntrar).click();
  
  // Aguardar redirecionamento
  cy.url().should('not.include', '/login');
  cy.aguardarCarregamento();
});

/**
 * Comando para realizar login com credenciais padrão do ambiente
 */
Cypress.Commands.add('loginPadrao', () => {
  const usuario = Cypress.env('username');
  const senha = Cypress.env('password');
  cy.realizarLogin(usuario, senha);
});

/**
 * Comando para fazer logout do sistema
 */
Cypress.Commands.add('realizarLogout', () => {
  cy.get(loginLocators.menuUsuario).click();
  cy.get(loginLocators.opcaoSair).click();
  cy.url().should('include', '/login');
});

/**
 * Comando para validar elementos da tela de login
 */
Cypress.Commands.add('validarTelaLogin', () => {
  cy.get(loginLocators.logoSistema).should('be.visible');
  cy.get(loginLocators.campoRfCpf).should('be.visible');
  cy.get(loginLocators.campoSenha).should('be.visible');
  cy.get(loginLocators.botaoEntrar).should('be.visible');
  cy.get(loginLocators.linkEsqueciSenha).should('be.visible');
});

/**
 * Comando para tentar login com credenciais inválidas
 * @param {string} usuario - Usuário inválido
 * @param {string} senha - Senha inválida
 */
Cypress.Commands.add('tentarLoginInvalido', (usuario, senha) => {
  cy.visit('/login');
  cy.get(loginLocators.campoRfCpf).clear().type(usuario);
  cy.get(loginLocators.campoSenha).clear().type(senha);
  cy.get(loginLocators.botaoEntrar).click();
  
  // Deve permanecer na página de login
  cy.url().should('include', '/login');
});

/**
 * Comando para visualizar/ocultar senha
 */
Cypress.Commands.add('alternarVisibilidadeSenha', () => {
  cy.get(loginLocators.botaoMostrarSenha).click();
});

/**
 * Comando para verificar se está autenticado
 */
Cypress.Commands.add('verificarAutenticacao', () => {
  cy.url().should('not.include', '/login');
  cy.get(loginLocators.menuPrincipal).should('be.visible');
});

/**
 * Comando para verificar se não está autenticado
 */
Cypress.Commands.add('verificarNaoAutenticado', () => {
  cy.url().should('include', '/login');
});

/**
 * Comando para preencher apenas RF sem senha
 * @param {string} usuario - RF ou CPF
 */
Cypress.Commands.add('preencherApenasRF', (usuario) => {
  cy.get(loginLocators.campoRfCpf).clear().type(usuario);
});

/**
 * Comando para preencher apenas senha sem RF
 * @param {string} senha - Senha
 */
Cypress.Commands.add('preencherApenasSenha', (senha) => {
  cy.get(loginLocators.campoSenha).clear().type(senha);
});

/**
 * Comando para acessar esqueci senha
 */
Cypress.Commands.add('acessarEsqueciSenha', () => {
  cy.visit('/login');
  cy.get(loginLocators.linkEsqueciSenha).click();
  cy.url().should('match', /\/(esqueci-senha|recuperar-senha)/);
});

/**
 * Comando para realizar login via API (mais rápido para testes)
 * @param {string} usuario - RF ou CPF
 * @param {string} senha - Senha
 */
Cypress.Commands.add('loginViaAPI', (usuario, senha) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('baseUrl')}/api/auth/login`,
    body: {
      username: usuario,
      password: senha
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    // Salvar token se necessário
    if (response.body.token) {
      window.localStorage.setItem('token', response.body.token);
    }
  });
});

/**
 * Comando para limpar sessão
 */
Cypress.Commands.add('limparSessao', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();
});
