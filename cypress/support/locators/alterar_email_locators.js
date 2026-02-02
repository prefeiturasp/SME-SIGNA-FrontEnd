// Locators para a página de Alteração de E-mail do SIGNA
// URL: https://qa-signa.sme.prefeitura.sp.gov.br/alterar-email

export const alterarEmailLocators = {
  // Campos de entrada
  campoEmailAtual: '[data-testid="input-email-atual"], #email-atual, input[name="emailAtual"]',
  campoNovoEmail: '[data-testid="input-novo-email"], #novo-email, input[name="novoEmail"], input[placeholder*="Novo E-mail"]',
  campoConfirmarEmail: '[data-testid="input-confirmar-email"], #confirmar-email, input[name="confirmarEmail"], input[placeholder*="Confirmar E-mail"]',
  campoSenha: '[data-testid="input-senha"], #senha, input[name="senha"], input[type="password"]',
  
  // Botões
  botaoSalvar: '[data-testid="btn-salvar"], button[type="submit"], button:contains("Salvar")',
  botaoCancelar: '[data-testid="btn-cancelar"], button:contains("Cancelar")',
  botaoMostrarSenha: '[data-testid="btn-mostrar-senha"], .toggle-password, .show-password',
  
  // Elementos visuais
  tituloAlteracao: 'h1, h2, .titulo-alteracao-email',
  textoAjuda: '[data-testid="texto-ajuda"], .help-text, .info-text',
  iconeInfo: '[data-testid="icone-info"], .icon-info, i.fa-info',
  labelEmailAtual: 'label[for="email-atual"], .label-email-atual',
  
  // Mensagens
  mensagemSucesso: '[data-testid="mensagem-sucesso"], .alert-success, .success-message, .mensagem-sucesso',
  mensagemErro: '[data-testid="mensagem-erro"], .alert-danger, .error-message, .mensagem-erro',
  mensagemCampoObrigatorio: '.campo-obrigatorio, .error-text, .invalid-feedback',
  mensagemConfirmacao: '[data-testid="mensagem-confirmacao"], .alert-info, .info-message',
  
  // Validação de formato
  validacaoEmail: '[data-testid="validacao-email"], .email-validation',
  iconeValidacao: '[data-testid="icone-validacao"], .validation-icon',
  
  // Container
  containerAlteracao: '[data-testid="container-alteracao-email"], .alteracao-email-container, .change-email-wrapper',
  formAlteracao: '[data-testid="form-alteracao-email"], form, .form-alteracao-email'
};

// Textos esperados
export const alterarEmailTextos = {
  titulo: 'Alterar E-mail',
  tituloAlternativo: 'Alteração de E-mail',
  placeholderEmailAtual: 'E-mail Atual',
  placeholderNovoEmail: 'Novo E-mail',
  placeholderConfirmarEmail: 'Confirmar E-mail',
  placeholderSenha: 'Senha',
  botaoSalvar: 'Salvar',
  botaoCancelar: 'Cancelar',
  
  // Mensagens de sucesso
  sucessoAlteracao: 'E-mail alterado com sucesso. Verifique sua caixa de entrada para confirmar',
  sucessoAlteracaoSimples: 'E-mail alterado com sucesso',
  
  // Mensagens de erro
  erroEmailsNaoCoincidem: 'Os e-mails não coincidem',
  erroSenhaIncorreta: 'Senha incorreta',
  erroEmailJaCadastrado: 'Este e-mail já está cadastrado no sistema',
  erroFormatoInvalido: 'Formato de e-mail inválido',
  erroDominioNaoPermitido: 'Apenas e-mails corporativos são permitidos',
  erroCampoObrigatorio: 'Campo obrigatório',
  
  // Textos informativos
  textoAjuda: 'Após alterar o e-mail, você receberá uma mensagem de confirmação',
  textoEmailAtual: 'E-mail cadastrado atualmente:',
  textoDominiosPermitidos: 'Domínios permitidos: @sme.prefeitura.sp.gov.br'
};

// URLs
export const alterarEmailUrls = {
  paginaAlteracao: '/alterar-email',
  paginaAlteracaoAlternativa: '/mudar-email',
  paginaPerfil: '/perfil',
  paginaConfiguracao: '/configuracoes'
};

// Configurações de validação
export const alterarEmailConfig = {
  // Regex para validação de e-mail
  regexEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Domínios permitidos
  dominiosPermitidos: [
    '@sme.prefeitura.sp.gov.br',
    '@prefeitura.sp.gov.br'
  ],
  
  // Tamanho máximo do e-mail
  tamanhoMaximo: 100,
  
  // Timeout para confirmação
  timeoutConfirmacao: 300000 // 5 minutos
};

// Helper para validação
export const validarEmail = (email) => {
  // Validar formato
  if (!alterarEmailConfig.regexEmail.test(email)) {
    return { valido: false, erro: alterarEmailTextos.erroFormatoInvalido };
  }
  
  // Validar domínio
  const dominio = email.substring(email.indexOf('@'));
  const dominioPermitido = alterarEmailConfig.dominiosPermitidos.some(d => dominio.includes(d));
  
  if (!dominioPermitido) {
    return { valido: false, erro: alterarEmailTextos.erroDominioNaoPermitido };
  }
  
  // Validar tamanho
  if (email.length > alterarEmailConfig.tamanhoMaximo) {
    return { valido: false, erro: 'E-mail muito longo' };
  }
  
  return { valido: true };
};
