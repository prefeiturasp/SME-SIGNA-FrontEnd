# language: pt
Funcionalidade: Alteração de senha

  Cenário: Usuário valida os campos obrigatórios no formulário de alteração de senha
    Dado que o usuário realizou o login com sucesso
    E o usuário está na página principal do sistema
    E o usuário clica no botão "Meus dados"
    E valida o texto "Meus Dados"
    E valida a existencia dos botões "Alterar e-mail" e "Alterar senha"
    E clica no botão "Alterar senha"
    Então o sistema exibe o modal de alteração de senha
    E valida o formulário de alteração de senha
    E valida a existencia dos botões "Cancelar" e "Salvar senha"
    E clica no botão "Cancelar"

  Cenário: Usuário acessa o modal de alteração de senha e cancela sem preencher
    Dado que o usuário realizou o login com sucesso
    E o usuário está na página principal do sistema
    E o usuário clica no botão "Meus dados"
    E valida o texto "Meus Dados"
    E valida a existencia dos botões "Alterar e-mail" e "Alterar senha"
    E clica no botão "Alterar senha"
    Então o sistema exibe o modal de alteração de senha
    E valida o formulário de alteração de senha
    E valida a existencia dos botões "Cancelar" e "Salvar senha"
    E clica no botão "Cancelar"
    E valida o texto "Meus Dados"

  Cenário: Usuário preenche os campos de senha e retorna para a página inicial sem salvar
    Dado que o usuário realizou o login com sucesso
    E o usuário está na página principal do sistema
    E o usuário clica no botão "Meus dados"
    E valida o texto "Meus Dados"
    E valida a existencia dos botões "Alterar e-mail" e "Alterar senha"
    E clica no botão "Alterar senha"
    Então o sistema exibe o modal de alteração de senha
    E valida o formulário de alteração de senha
    E o usuário preenche o campo Senha atual com "<senha_atual>"
    E o usuário preenche o campo Nova senha com "<nova_senha>"
    E o usuário preenche o campo Confirmação da nova senha com "<nova_senha>"
    E valida a existencia dos botões "Cancelar" e "Salvar senha"
    E clica no botão "Cancelar"
    E clica no botão "voltar"

  Cenário: Usuário realiza a alteração da senha
    Dado que o usuário realizou o login com sucesso
    E o usuário está na página principal do sistema
    E o usuário clica no botão "Meus dados"
    E valida o texto "Meus Dados"
    E valida a existencia dos botões "Alterar e-mail" e "Alterar senha"
    E clica no botão "Alterar senha"
    Então o sistema exibe o modal de alteração de senha
    E valida o formulário de alteração de senha
    E o usuário preenche o campo Senha atual com "<senha_atual>"
    E o usuário preenche o campo Nova senha com "<nova_senha>"
    E o usuário preenche o campo Confirmação da nova senha com "<nova_senha>"
    E valida a existencia dos botões "Cancelar" e "Salvar senha"
    E clica no botão "Cancelar"
    E clica no botão "voltar"

