class Esqueci_Senha_Localizadores {
  linkEsqueciSenha() {
    return 'body > div.flex.flex-col.md\\:flex-row.w-full.min-h-screen.overflow-x-hidden > div.w-full.md\\:w-1\\/2.flex.flex-col.bg-white.overflow-y-auto.justify-center > div > div > div > div.pt-16.pb-2 > form > button';
  }

  tituloRecuperacao() {
    return 'body > div.flex.flex-col.md\\:flex-row.w-full.min-h-screen.overflow-x-hidden > div.w-full.md\\:w-1\\/2.flex.flex-col.bg-white.overflow-y-auto.justify-center > div > div > div > div.py-5 > h4';
  }

  textoInformativo() {
    return 'body > div.flex.flex-col.md\\:flex-row.w-full.min-h-screen.overflow-x-hidden > div.w-full.md\\:w-1\\/2.flex.flex-col.bg-white.overflow-y-auto.justify-center > div > div > div > div.py-5 > p';
  }

  labelRf() {
    return 'body > div.flex.flex-col.md\\:flex-row.w-full.min-h-screen.overflow-x-hidden > div.w-full.md\\:w-1\\/2.flex.flex-col.bg-white.overflow-y-auto.justify-center > div > div > div > div.py-5 > form > div.space-y-2 > div > label';
  }

  inputRf() {
    return 'input[type="text"], input[type="number"], input:not([type="password"])';
  }

  textoImportante() {
    return 'p';
  }

  botaoContinuar() {
    return 'button[type="submit"]';
  }

  mensagemConfirmacao() {
    return 'body > div.flex.flex-col.md\\:flex-row.w-full.min-h-screen.overflow-x-hidden > div.w-full.md\\:w-1\\/2.flex.flex-col.bg-white.overflow-y-auto.justify-center > div > div > div > div.py-5 > div > div';
  }

  botaoVoltarLogin() {
    return 'a > button, button';
  }

  mensagemErro() {
    return '.alert-danger, .error-message, .text-danger, [class*="error"], [class*="erro"], div[role="alert"]';
  }
}

export default Esqueci_Senha_Localizadores;
