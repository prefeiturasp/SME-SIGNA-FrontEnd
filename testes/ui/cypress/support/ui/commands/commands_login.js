// Commands específicos para Login
import { loginLocators, loginUrls } from '../locators/login_locators';

/**
 * Comando para realizar login no sistema
 * @param {string} usuario - RF ou CPF do usuário
 * @param {string} senha - Senha do usuário
 */
Cypress.Commands.add('realizarLogin', (usuario, senha) => {
  cy.visit('/login');
  cy.wait(1000); // buffer para carregamento da página

  cy.get(loginLocators.campoRfCpf, { timeout: 40000 })
    .should('be.visible')
    .and('not.be.disabled')
    .clear()
    .type(usuario, { delay: 100 });
  cy.wait(500);

  cy.get(loginLocators.campoSenha, { timeout: 40000 })
    .should('be.visible')
    .and('not.be.disabled')
    .clear({ force: true })
    .wait(300)
    .type(senha, { delay: 100, force: true });
  cy.wait(500);

  cy.get(loginLocators.botaoEntrar, { timeout: 40000 })
    .should('be.visible')
    .and('not.be.disabled')
    .click();

  cy.url({ timeout: 40000 }).should('not.include', '/login');
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
 *
 * O botão "Sair" (SignOutButton) fica sempre visível na Navbar, sem menu
 * de usuário para abrir antes — clica direto nele. Após o logout a app
 * redireciona para "/" (raiz), não para "/login" (rota que não existe
 * neste projeto — confirmado em src/proxy.ts e na estrutura de rotas em
 * src/app), por isso a checagem valida que a URL saiu de "/pages/*".
 */
Cypress.Commands.add('realizarLogout', () => {
  cy.get(loginLocators.opcaoSair).should('be.visible').click();
  cy.url({ timeout: 15000 }).should('not.include', '/pages');
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

  // Login inválido não navega para dentro de "/pages/*" (mesma lógica de
  // "/login" explicada em realizarLogout acima).
  cy.url().should('not.include', '/pages');
});

/**
 * Comando para visualizar/ocultar senha
 */
Cypress.Commands.add('alternarVisibilidadeSenha', () => {
  cy.get(loginLocators.botaoMostrarSenha).click();
});

/**
 * Comando para verificar se está autenticado
 *
 * Toda tela autenticada vive sob "/pages/*" (ver src/proxy.ts) — checagem
 * mais confiável do que "not.include('/login')", já que a app nem usa essa
 * rota.
 */
Cypress.Commands.add('verificarAutenticacao', () => {
  cy.url({ timeout: 15000 }).should('include', '/pages');
  cy.get(loginLocators.menuPrincipal).should('be.visible');
});

/**
 * Comando para verificar se não está autenticado
 *
 * A tela de login real fica em "/" (raiz), não em "/login" — a rota
 * "/login" não existe na aplicação (ver src/proxy.ts e src/app). Verifica
 * a saída de "/pages/*" e a presença do campo de RF/CPF, que só existe na
 * tela de login.
 */
Cypress.Commands.add('verificarNaoAutenticado', () => {
  cy.url({ timeout: 15000 }).should('not.include', '/pages');
  cy.get(loginLocators.campoRfCpf, { timeout: 15000 }).should('be.visible');
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
