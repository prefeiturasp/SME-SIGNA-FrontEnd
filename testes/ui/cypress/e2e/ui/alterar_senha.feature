# language: pt
Funcionalidade: Alteração de senha

  Cenário: Usuário realiza a alteração da senha
    Dado que o usuário realizou o login com sucesso
    E o usuário está na página principal do sistema
    E o usuário clica no botão "Meus dados"
    E valida o texto "Meus Dados"
    E valida a existencia dos botões "Alterar e-mail" e "Alterar senha"
    E clica no botão "Alterar senha"
    Então o sistema exibe o modal de alteração de senha
    E valida o formulário de alteração de senha
    E o usuário preenche o campo Senha atual com "Sgp1559"
    E o usuário preenche o campo Nova senha com "Sgp0418!"
    E o usuário preenche o campo Confirmação da nova senha com "Sgp0418!"
    E valida a existencia dos botões "Cancelar" e "Salvar senha"
    E clica no botão "Cancelar"
    E clica no botão "voltar"

