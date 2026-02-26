# language: pt

Funcionalidade: Fluxo esqueci a senha no sistema SIGNA
  
  Cenário: Fluxo esqueci a senha com RF válido
    Dado que eu acesso o sistema SIGNA
    E valido a existência do link "Esqueci minha senha"
    Quando clico na opção "Esqueci minha senha"
    E valido que estou na página de recuperação de senha
    E valida a existencia do texto "Informe o seu usuário ou RF. Você recebera um e-mail com orientações para redefinir sua senha."
    E valido o texto "RF"
    E valido a existência do campo RF
    E preencho o campo RF com "7311559"
    E valida a existencia do texto "Importante: Ao alterar a sua senha, ela se tornará padrão e será utilizada para acessar todos os sistemas da SME aos quais você já possui acesso."
    E clico no botão continuar
    Então o sistema deve exibir a mensagem de confirmação
    E clico no botão continuar para voltar

  Cenário: Fluxo esqueci a senha com RF inválido
    Dado que eu acesso o sistema SIGNA
    E valido a existência do link "Esqueci minha senha"
    Quando clico na opção "Esqueci minha senha"
    E valido que estou na página de recuperação de senha
    E valida a existencia do texto "Informe o seu usuário ou RF. Você recebera um e-mail com orientações para redefinir sua senha."
    E valido o texto "RF"
    E valido a existência do campo RF
    E preencho o campo RF com "0000000"
    E valida a existencia do texto "Importante: Ao alterar a sua senha, ela se tornará padrão e será utilizada para acessar todos os sistemas da SME aos quais você já possui acesso."
    E clico no botão continuar
    Então o sistema deve exibir mensagem de erro "Usuário ou RF não encontrado"
