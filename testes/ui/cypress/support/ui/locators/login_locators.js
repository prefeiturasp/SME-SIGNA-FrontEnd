// Locators para a página de Login do SIGNA
// URL Base: https://qa-signa.sme.prefeitura.sp.gov.br/login

export const loginLocators = {
  // Campos de entrada
  // "#seu_rf"/"#senha" confirmados via inspeção real do DOM da tela de login
  // (name="seu_rf"/"senha", sem data-testid). Os fallbacks antigos
  // "input[placeholder*='RF']"/"input[placeholder*='CPF']" foram REMOVIDOS:
  // são específicos demais pra parecerem seguros mas casam com QUALQUER
  // input da aplicação cujo placeholder contenha essas letras — confirmado
  // em execução real que o filtro "Registro Funcional (RF)" da listagem de
  // Atos Administrativos (placeholder "Entre com o RF") também casava,
  // quebrando qualquer asserção "não deve existir campo de RF/CPF" feita
  // fora da tela de login (ex.: signa_extra.feature, cenário de sessão
  // autenticada acessando "/").
  campoRfCpf: '#seu_rf, [data-testid="input-rf-cpf"], input[name="seu_rf"]',
  campoSenha: '#senha, [data-testid="input-senha"], input[name="senha"], input[type="password"]',
  
  // Botões
  botaoEntrar: '[data-testid="btn-entrar"], button[type="submit"], button:contains("Entrar")',
  botaoMostrarSenha: '[data-testid="btn-mostrar-senha"], .toggle-password, .show-password',
  botaoOcultarSenha: '[data-testid="btn-ocultar-senha"], .toggle-password, .hide-password',
  
  // Links
  // A tela real renderiza "Esqueci minha senha" como <button type="button"
  // variant="link"> (shadcn/Button), não como uma tag <a> — confirmado no
  // componente LoginForm (src/components/login/LoginForm/index.tsx) e no
  // HTML servido pelo ambiente de QA. Os seletores de <a> ficam como
  // fallback caso a implementação volte a usar um link real no futuro.
  linkEsqueciSenha: '[data-testid="link-esqueci-senha"], button:contains("Esqueci"), a:contains("Esqueci"), a[href*="recuperar"]',
  
  // Elementos visuais
  logoSistema: '[data-testid="logo-sistema"], .logo, img[alt*="SIGNA"]',
  tituloLogin: 'h1, h2, .titulo-login',
  
  // Mensagens
  mensagemErro: '[data-testid="mensagem-erro"], .alert-danger, .error-message, .mensagem-erro',
  mensagemSucesso: '[data-testid="mensagem-sucesso"], .alert-success, .success-message',
  mensagemCampoObrigatorio: '.campo-obrigatorio, .error-text, .invalid-feedback',
  
  // Menu após login
  // Não existe <nav>, data-testid="menu-principal" nem ".menu-principal" na
  // aplicação real — o layout autenticado (src/app/pages/layout.tsx) sempre
  // renderiza <main> (conteúdo) e o <aside> do menu lateral (Sider), então
  // esses dois elementos servem como indicador confiável de "autenticado".
  menuPrincipal: '[data-testid="menu-principal"], .menu-principal, main, aside',
  // Não existe menu/dropdown de usuário na Navbar (src/components/dashboard/
  // Navbar/Navbar.tsx) — o botão "Sair" (SignOutButton.tsx) fica sempre
  // visível diretamente no header, sem precisar abrir nada antes.
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
