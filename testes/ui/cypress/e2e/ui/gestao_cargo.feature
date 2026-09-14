# language: pt

# "Testar laudo?" e "Pesquisar Licenças no SIGPEC" existem na tela ao vivo mas
# não em FormCargosBaseSecundario.tsx neste checkout local — checkout
# desatualizado em relação ao publicado em QA (confirmado por inspeção real
# do DOM). Ambos têm step de interação (Cenários 6 e 7).
@gestão_base @cadastro_cargo @testIsolation(false)
Funcionalidade: Cadastro de cargo base

  Como um usuário do sistema SIGNA
  Eu quero cadastrar um novo cargo base
  Para que ele fique disponível na lista de cargos base

  Contexto:
    Dado que o usuário está logado no sistema
    E está na tela "Gestão de cargos base"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Cadastrar novo cargo base (fluxo completo)     [BLOQUEADO]
  # ══════════════════════════════════════════════════════════════
  # Nota: este cenário cadastra de fato (POST real) — cria um registro novo
  # de cargo base em QA a cada execução. Se isso passar a poluir a listagem
  # com registros de teste, considerar excluir o cargo ao final ou marcar a
  # descrição de forma identificável (já feito: "criado por automação").
  #
  # @skip (2026-09-09): os 5 códigos do combobox "Código do cargo no EOL"
  # (ASSISTENTE DE DIRETOR DE ESCOLA, DIRETOR DE ESCOLA, COORDENADOR
  # PEDAGOGICO, SECRETARIO DE ESCOLA, SUPERVISOR ESCOLAR) já têm cargo base
  # cadastrado em QA — confirmado testando os 5 manualmente contra o
  # ambiente real, todos retornam "codigo_cargo: cargo base com este Código
  # cargo no EOL já existe." no submit. O combobox não filtra os já usados,
  # então continuará oferecendo essas 5 opções mesmo esgotadas. Sem código
  # livre não há como este cenário (nem os Cenários 4/5/6/7, mesma causa)
  # completar um cadastro novo — falta de massa de dado no ambiente, não bug
  # de código. Reativar removendo esta tag quando algum código for liberado
  # (excluindo/inativando um cargo base de teste existente) ou o catálogo de
  # códigos do formulário for ampliado no backend.
  @cadastro_fluxo_completo @critico @smoke @skip
  Cenário: Cadastrar novo cargo base selecionando múltiplas opções de utilização
    Quando clica no botão "Cadastrar novo cargo"
    Então o sistema direciona para a tela de cadastro de cargo base

    Quando seleciona um código de cargo aleatório no EOL
    E seleciona a opção "Docentes" no campo "Grupamento"
    E preenche o campo "Descrição Resumida" do cargo base com "Cargo criado por automação de testes"
    E seleciona a opção "Efetivo" no campo "Situação Funcional"
    E seleciona a opção "Ativo" no campo "Status"

    E ativa a opção "Utilizado para funções?" de utilização do cargo
    E ativa a opção "Utilizado para designações?" de utilização do cargo
    E ativa a opção "Utilizado para permutas?" de utilização do cargo

    Quando clica no botão "Cadastrar cargo" do cadastro de cargo base
    Então a notificação de sucesso do cadastro de cargo base deve exibir "Tudo certo por aqui!"
    E a notificação de sucesso do cadastro de cargo base deve exibir "O cargo base foi criado."
    E o sistema retorna para a listagem de cargos base

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Localizar na listagem o cargo base recém-cadastrado [ATIVO]
  # ══════════════════════════════════════════════════════════════
  # Depende do Cenário 1 ter rodado antes, na mesma sessão (@testIsolation
  # (false) na Funcionalidade) — separado num cenário próprio pra confirmar,
  # de forma isolada, que o cadastro do Cenário 1 realmente persistiu em QA
  # (busca pela mesma Descrição Resumida usada lá).
  @cadastro_fluxo_completo @critico
  Cenário: Localizar na listagem o cargo base cadastrado no cenário anterior
    Quando preenche o filtro "Descrição Resumida" com "Cargo criado por automação de testes"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "Cargo criado por automação de testes"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 3 — Título, campos, textos e botões do formulário    [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @validacao_estrutura @smoke
  Cenário: Validar título, campos, textos e botões do cadastro de cargo base
    Quando clica no botão "Cadastrar novo cargo"
    Então o sistema direciona para a tela de cadastro de cargo base

    E valida a existencia do Texto "Informações do cargo"
    E valida a existencia do Texto "Dados de identificação e classificação funcional."
    E valida a existencia do Texto "Código do cargo no EOL"
    E valida a existencia do Texto "Grupamento"
    E valida a existencia do Texto "Descrição Resumida"
    E valida a existencia do Texto "Situação Funcional"
    E valida a existencia do Texto "Status"

    E valida a existencia do Texto "Utilização do cargo"
    E valida a existencia do Texto "Selecione os processos em que este cargo poderá ser utilizado."
    E valida a existencia do Texto "Utilizado para funções?"
    E valida a existencia do Texto "Permite utilizar este cargo em processos de atribuição de funções."
    E valida a existencia do Texto "Utilizado para designações?"
    E valida a existencia do Texto "Permite utilizar este cargo em processos de designação."
    E valida a existencia do Texto "Utilizado para STE?"
    E valida a existencia do Texto "Permite utilizar este cargo em processos de STE."
    E valida a existencia do Texto "Utilizado para permutas?"
    E valida a existencia do Texto "Permite utilizar este cargo em processos de permuta."
    E valida a existencia do Texto "Cargo Base fictício?"
    E valida a existencia do Texto "Testar laudo?"
    E valida a existencia do Texto "Pesquisar Licenças no SIGPEC"

    E valida a existencia do botão de navegação "Cancelar"
    E valida a existencia do botão de navegação "Cadastrar cargo"

    Quando clica no botão "Cancelar" do cadastro de cargo base
    Então o sistema retorna para a listagem de cargos base

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 4 — Cadastrar cargo base com todas as opções de utilização [BLOQUEADO]
  # ══════════════════════════════════════════════════════════════
  # Nota: mesma observação do Cenário 1 — cadastra de fato (POST real) em QA.
  # @skip (2026-09-09): mesma causa do Cenário 1 — códigos EOL esgotados em
  # QA. Ver comentário completo lá.
  @cadastro_fluxo_completo @critico @skip
  Cenário: Cadastrar novo cargo base selecionando todas as opções de utilização
    Quando clica no botão "Cadastrar novo cargo"
    Então o sistema direciona para a tela de cadastro de cargo base

    Quando seleciona um código de cargo aleatório no EOL
    E seleciona a opção "Docentes" no campo "Grupamento"
    E preenche o campo "Descrição Resumida" do cargo base com "Cargo com todas as opcoes criado por automacao"
    E seleciona a opção "Efetivo" no campo "Situação Funcional"
    E seleciona a opção "Ativo" no campo "Status"

    E ativa a opção "Utilizado para funções?" de utilização do cargo
    E ativa a opção "Utilizado para designações?" de utilização do cargo
    E ativa a opção "Utilizado para STE?" de utilização do cargo
    E ativa a opção "Utilizado para permutas?" de utilização do cargo
    E ativa a opção "Cargo Base fictício?" de utilização do cargo

    Quando clica no botão "Cadastrar cargo" do cadastro de cargo base
    Então a notificação de sucesso do cadastro de cargo base deve exibir "Tudo certo por aqui!"
    E a notificação de sucesso do cadastro de cargo base deve exibir "O cargo base foi criado."
    E o sistema retorna para a listagem de cargos base

    Quando preenche o filtro "Descrição Resumida" com "Cargo com todas as opcoes criado por automacao"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "Cargo com todas as opcoes criado por automacao"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 5 — Cadastrar cargo base em situação "Cargo em comissão"  [BLOQUEADO]
  # ══════════════════════════════════════════════════════════════
  # Nota: mesma observação do Cenário 1 — cadastra de fato (POST real) em QA.
  # @skip (2026-09-09): mesma causa do Cenário 1 — códigos EOL esgotados em
  # QA. Ver comentário completo lá.
  @cadastro_fluxo_completo @critico @skip
  Cenário: Cadastrar novo cargo base com situação funcional "Cargo em comissão"
    Quando clica no botão "Cadastrar novo cargo"
    Então o sistema direciona para a tela de cadastro de cargo base

    Quando seleciona um código de cargo aleatório no EOL
    E seleciona a opção "Docentes" no campo "Grupamento"
    E preenche o campo "Descrição Resumida" do cargo base com "QA auto comissao ste"
    E seleciona a opção "Cargo em comissão" no campo "Situação Funcional"
    E seleciona a opção "Ativo" no campo "Status"

    E ativa a opção "Utilizado para funções?" de utilização do cargo
    E ativa a opção "Utilizado para STE?" de utilização do cargo

    Quando clica no botão "Cadastrar cargo" do cadastro de cargo base
    Então a notificação de sucesso do cadastro de cargo base deve exibir "Tudo certo por aqui!"
    E a notificação de sucesso do cadastro de cargo base deve exibir "O cargo base foi criado."
    E o sistema retorna para a listagem de cargos base

    Quando preenche o filtro "Descrição Resumida" com "QA auto comissao ste"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "QA auto comissao ste"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 6 — Cadastrar cargo base com "Testar laudo?" habilitado  [BLOQUEADO]
  # ══════════════════════════════════════════════════════════════
  # Nota: mesma observação do Cenário 1 — cadastra de fato (POST real) em QA.
  # @skip (2026-09-09): mesma causa do Cenário 1 — códigos EOL esgotados em
  # QA. Ver comentário completo lá.
  @cadastro_fluxo_completo @critico @skip
  Cenário: Cadastrar novo cargo base com a opção "Testar laudo?" habilitada
    Quando clica no botão "Cadastrar novo cargo"
    Então o sistema direciona para a tela de cadastro de cargo base

    Quando seleciona um código de cargo aleatório no EOL
    E seleciona a opção "Docentes" no campo "Grupamento"
    E preenche o campo "Descrição Resumida" do cargo base com "QA auto testar laudo"
    E seleciona a opção "Efetivo" no campo "Situação Funcional"
    E seleciona a opção "Ativo" no campo "Status"

    E ativa a opção "Utilizado para funções?" de utilização do cargo
    E ativa a opção "Testar laudo?" de utilização do cargo

    Quando clica no botão "Cadastrar cargo" do cadastro de cargo base
    Então a notificação de sucesso do cadastro de cargo base deve exibir "Tudo certo por aqui!"
    E a notificação de sucesso do cadastro de cargo base deve exibir "O cargo base foi criado."
    E o sistema retorna para a listagem de cargos base

    Quando preenche o filtro "Descrição Resumida" com "QA auto testar laudo"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "QA auto testar laudo"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 7 — Cadastrar cargo base com "Pesquisar Licenças no SIGPEC" [BLOQUEADO]
  # ══════════════════════════════════════════════════════════════
  # Nota: mesma observação do Cenário 1 — cadastra de fato (POST real) em QA.
  # @skip (2026-09-09): mesma causa do Cenário 1 — códigos EOL esgotados em
  # QA. Ver comentário completo lá.
  @cadastro_fluxo_completo @critico @skip
  Cenário: Cadastrar novo cargo base com a opção "Pesquisar Licenças no SIGPEC" habilitada
    Quando clica no botão "Cadastrar novo cargo"
    Então o sistema direciona para a tela de cadastro de cargo base

    Quando seleciona um código de cargo aleatório no EOL
    E seleciona a opção "Docentes" no campo "Grupamento"
    E preenche o campo "Descrição Resumida" do cargo base com "QA auto licenca sigpec"
    E seleciona a opção "Efetivo" no campo "Situação Funcional"
    E seleciona a opção "Ativo" no campo "Status"

    E ativa a opção "Utilizado para funções?" de utilização do cargo
    E ativa a opção "Pesquisar Licenças no SIGPEC" de utilização do cargo
    E preenche o campo "Quantidade máxima de dias de licença" do cargo base com "15"

    Quando clica no botão "Cadastrar cargo" do cadastro de cargo base
    Então a notificação de sucesso do cadastro de cargo base deve exibir "Tudo certo por aqui!"
    E a notificação de sucesso do cadastro de cargo base deve exibir "O cargo base foi criado."
    E o sistema retorna para a listagem de cargos base

    Quando preenche o filtro "Descrição Resumida" com "QA auto licenca sigpec"
    E clica no botão "Pesquisar"
    Então a tabela exibe apenas cargos base com "QA auto licenca sigpec"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 8 — Cadastrar sem preencher nenhum campo obrigatório  [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @excecao @campos_obrigatorios
  Cenário: Tentar cadastrar cargo base sem preencher nenhum campo nem selecionar utilização
    Quando clica no botão "Cadastrar novo cargo"
    Então o sistema direciona para a tela de cadastro de cargo base

    Quando clica no botão "Cadastrar cargo" do cadastro de cargo base
    Então cada campo obrigatorio do cargo base exibe a mensagem de campo obrigatorio
    E o sistema direciona para a tela de cadastro de cargo base

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 9 — Cancelar descarta os dados preenchidos            [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @excecao @cancelar_cadastro
  Cenário: Cancelar o cadastro sem salvar descarta os dados preenchidos
    Quando clica no botão "Cadastrar novo cargo"
    Então o sistema direciona para a tela de cadastro de cargo base

    Quando seleciona um código de cargo aleatório no EOL
    E seleciona a opção "Docentes" no campo "Grupamento"
    E preenche o campo "Descrição Resumida" do cargo base com "Cargo que nao deve ser salvo"
    E ativa a opção "Utilizado para funções?" de utilização do cargo

    Quando clica no botão "Cancelar" do cadastro de cargo base
    Então o sistema retorna para a listagem de cargos base
    E valida a existencia do Texto "Lista de cargos base"
