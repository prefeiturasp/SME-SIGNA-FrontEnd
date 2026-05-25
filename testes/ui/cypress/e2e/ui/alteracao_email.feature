# language: pt
Funcionalidade: Alteração de e-mail

  Cenário: Usuário valida as opções de alteração na seção Meus Dados
    Dado que o usuário realizou o login com sucesso
    E o usuário está na página principal do sistema
    E o usuário clica no botão "Meus dados"
    E valida o texto "Meus Dados"
    E valida a existencia dos botões "Alterar e-mail" e "Alterar senha"

  Cenário: Usuário acessa a alteração de e-mail via Meus Dados
    Dado que o usuário realizou o login com sucesso
    E o usuário está na página principal do sistema
    E o usuário clica no botão "Meus dados"
    E valida o texto "Meus Dados"
    E valida a existencia dos botões "Alterar e-mail" e "Alterar senha"
    E o usuário clica no botão "Alterar e-mail"
    E preenche o campo E-mail com "teste_qa@sme.prefeitura.sp.gov.br"
    Então o sistema deve apresentar a mensagem alertando o usuário sobre a alteração do e-mail

  Cenário: Usuário realiza a alteração do e-mail
    Dado que o usuário realizou o login com sucesso
    E o usuário está na página principal do sistema
    E o usuário clica no botão "Meus dados"
    E o usuário clica no botão "Alterar e-mail"
    E preenche o campo E-mail com "teste_qa@sme.prefeitura.sp.gov.br"
    Então o sistema deve apresentar a mensagem alertando o usuário sobre a alteração do e-mail
