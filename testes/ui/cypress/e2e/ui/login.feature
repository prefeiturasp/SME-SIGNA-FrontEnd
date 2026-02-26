# language: pt

@login @autenticacao @smoke
Funcionalidade: Autenticação no Sistema SIGNA
  Como um usuário do sistema SIGNA
  Eu quero realizar login com minhas credenciais
  Para que eu possa acessar as funcionalidades do sistema

  Contexto:
    Dado que eu acesso o sistema

  @login-sucesso @critico
  Cenário: Login com credenciais válidas
    Quando eu insiro credenciais válidas
    E clico no botão de acessar
    Então devo ser redirecionado para o dashboard
    E devo visualizar a página principal do sistema

  @login-falha @validacao
  Cenário: Tentativa de login com credenciais inválidas
    Quando eu insiro credenciais inválidas
    E clico no botão de acessar
    Então devo visualizar mensagem de erro de autenticação

  @validacao-campo @obrigatoriedade
  Cenário: Validação de campo senha obrigatório
    Quando eu insiro apenas o RF sem senha
    E clico no botão de acessar
    Então devo visualizar validação de senha obrigatória

  @validacao-campo @obrigatoriedade
  Cenário: Validação de campo RF obrigatório
    Quando eu insiro apenas a senha sem RF
    E clico no botão de acessar
    Então devo visualizar validação de RF obrigatório 

