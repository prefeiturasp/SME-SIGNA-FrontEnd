// Locators para a página de Login do SIGNA
// URL Base: https://qa-signa.sme.prefeitura.sp.gov.br/login

export const loginLocators = {
  // Campos de entrada
  // Fallbacks por placeholder ("RF"/"CPF") foram REMOVIDOS: casavam também
  // com o filtro de RF da listagem de Atos Administrativos.
  campoRfCpf: '#seu_rf, [data-testid="input-rf-cpf"], input[name="seu_rf"]',
  campoSenha: '#senha, [data-testid="input-senha"], input[name="senha"], input[type="password"]',
  
  // Botões
  botaoEntrar: '[data-testid="btn-entrar"], button[type="submit"], button:contains("Entrar")',
  botaoMostrarSenha: '[data-testid="btn-mostrar-senha"], .toggle-password, .show-password',
  botaoOcultarSenha: '[data-testid="btn-ocultar-senha"], .toggle-password, .hide-password',
  
  // Links
  // "Esqueci minha senha" é um <button>, não <a> — seletores de <a> ficam
  // como fallback.
  linkEsqueciSenha: '[data-testid="link-esqueci-senha"], button:contains("Esqueci"), a:contains("Esqueci"), a[href*="recuperar"]',
  
  // Elementos visuais
  logoSistema: '[data-testid="logo-sistema"], .logo, img[alt*="SIGNA"]',
  tituloLogin: 'h1, h2, .titulo-login',
  
  // Mensagens
  mensagemErro: '[data-testid="mensagem-erro"], .alert-danger, .error-message, .mensagem-erro',
  mensagemSucesso: '[data-testid="mensagem-sucesso"], .alert-success, .success-message',
  mensagemCampoObrigatorio: '.campo-obrigatorio, .error-text, .invalid-feedback',
  
  // Menu após login
  menuPrincipal: '[data-testid="menu-principal"], .menu-principal, main, aside',
  // Botão "Sair" fica sempre visível no header, sem menu/dropdown pra abrir.
  opcaoSair: '[data-testid="opcao-sair"], button:contains("Sair"), a:contains("Sair"), .logout',
  
  // Container
  containerLogin: '[data-testid="container-login"], .login-container, .auth-wrapper',
  formLogin: '[data-testid="form-login"], form, .login-form'
};

// Textos esperados
export const loginTextos = {
  titulo: 'Login',
  placeholderRfCpf: 'RF ou CPF',
  placeholderSenha: 'Senha',
  botaoEntrar: 'Entrar',
  linkEsqueciSenha: 'Esqueci minha senha',
  erroCredenciaisInvalidas: 'Usuário ou senha inválidos',
  erroCampoObrigatorio: 'Campo obrigatório',
  sucessoLogin: 'Login realizado com sucesso'
};

// URLs
export const loginUrls = {
  paginaLogin: '/login',
  paginaInicial: '/home',
  paginaDashboard: '/dashboard'
};
