# language: pt

@textos_portaria @cadastro_texto_portaria @testIsolation(false)
Funcionalidade: Cadastro de texto de portaria

  Como um usuário do sistema SIGNA
  Eu quero cadastrar um novo texto de portaria para cada tipo de ato administrativo
  Para que ele fique disponível na lista de textos de portarias e seja usado na emissão automática de portarias

  Contexto:
    Dado que o usuário está logado no sistema
    E está na tela "Textos de portarias"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Cadastrar texto de portaria para o tipo "Designação"
  # ══════════════════════════════════════════════════════════════
  @cadastro_fluxo_completo @critico @smoke
  Cenário: Cadastrar um novo texto de portaria para o tipo "Designação"
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Designação"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Designação"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E preenche o campo "Observações" do cadastro de texto de portaria com "QA obs 01"
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E adiciona o texto "QA texto 01" ao final do texto da portaria

    Quando clica no botão "Cadastrar texto"
    Então a notificação de sucesso do cadastro de texto de portaria deve exibir "Tudo certo por aqui!"
    E a notificação de sucesso do cadastro de texto de portaria deve exibir "O texto da portaria foi cadastrado."
    E o sistema retorna para a listagem de textos de portaria
    E o novo modelo de texto aparece na listagem com o tipo "Designação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Cadastrar texto de portaria para o tipo "Cessação"
  # ══════════════════════════════════════════════════════════════
  @cadastro_fluxo_completo @critico
  Cenário: Cadastrar um novo texto de portaria para o tipo "Cessação"
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Cessação"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Cessação"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E preenche o campo "Observações" do cadastro de texto de portaria com "QA obs 02"
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E adiciona o texto "QA texto 02" ao final do texto da portaria

    Quando clica no botão "Cadastrar texto"
    Então a notificação de sucesso do cadastro de texto de portaria deve exibir "O texto da portaria foi cadastrado."
    E o sistema retorna para a listagem de textos de portaria
    E o novo modelo de texto aparece na listagem com o tipo "Cessação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 3 — Cadastrar texto de portaria para o tipo "Insubsistência de Designação"
  # ══════════════════════════════════════════════════════════════
  @cadastro_fluxo_completo @critico
  Cenário: Cadastrar um novo texto de portaria para o tipo "Insubsistência de Designação"
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Insubsistência de Designação"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Insubsistência de Designação"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E preenche o campo "Observações" do cadastro de texto de portaria com "QA obs 03"
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E adiciona o texto "QA texto 03" ao final do texto da portaria

    Quando clica no botão "Cadastrar texto"
    Então a notificação de sucesso do cadastro de texto de portaria deve exibir "O texto da portaria foi cadastrado."
    E o sistema retorna para a listagem de textos de portaria
    E o novo modelo de texto aparece na listagem com o tipo "Insubsistência de Designação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 4 — Cadastrar texto de portaria para o tipo "Insubsistência de Cessação"
  # ══════════════════════════════════════════════════════════════
  @cadastro_fluxo_completo @critico
  Cenário: Cadastrar um novo texto de portaria para o tipo "Insubsistência de Cessação"
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Insubsistência de Cessação"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Insubsistência de Cessação"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E preenche o campo "Observações" do cadastro de texto de portaria com "QA obs 04"
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E adiciona o texto "QA texto 04" ao final do texto da portaria

    Quando clica no botão "Cadastrar texto"
    Então a notificação de sucesso do cadastro de texto de portaria deve exibir "O texto da portaria foi cadastrado."
    E o sistema retorna para a listagem de textos de portaria
    E o novo modelo de texto aparece na listagem com o tipo "Insubsistência de Cessação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 5 — Cadastrar texto de portaria para o tipo "Apostila de Designação"
  # ══════════════════════════════════════════════════════════════
  @cadastro_fluxo_completo @critico
  Cenário: Cadastrar um novo texto de portaria para o tipo "Apostila de Designação"
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Apostila de Designação"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Apostila de Designação"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E preenche o campo "Observações" do cadastro de texto de portaria com "QA obs 05"
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E adiciona o texto "QA texto 05" ao final do texto da portaria

    Quando clica no botão "Cadastrar texto"
    Então a notificação de sucesso do cadastro de texto de portaria deve exibir "O texto da portaria foi cadastrado."
    E o sistema retorna para a listagem de textos de portaria
    E o novo modelo de texto aparece na listagem com o tipo "Apostila de Designação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 6 — Cadastrar texto de portaria para o tipo "Apostila de Cessação"
  # ══════════════════════════════════════════════════════════════
  @cadastro_fluxo_completo @critico
  Cenário: Cadastrar um novo texto de portaria para o tipo "Apostila de Cessação"
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Apostila de Cessação"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Apostila de Cessação"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E preenche o campo "Observações" do cadastro de texto de portaria com "QA obs 06"
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E adiciona o texto "QA texto 06" ao final do texto da portaria

    Quando clica no botão "Cadastrar texto"
    Então a notificação de sucesso do cadastro de texto de portaria deve exibir "O texto da portaria foi cadastrado."
    E o sistema retorna para a listagem de textos de portaria
    E o novo modelo de texto aparece na listagem com o tipo "Apostila de Cessação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 7 — Cadastrar texto de portaria para o tipo "Anulação de Apostila"
  # ══════════════════════════════════════════════════════════════
  @cadastro_fluxo_completo @critico
  Cenário: Cadastrar um novo texto de portaria para o tipo "Anulação de Apostila"
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Anulação de Apostila"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Anulação de Apostila"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E preenche o campo "Observações" do cadastro de texto de portaria com "QA obs 07"
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E adiciona o texto "QA texto 07" ao final do texto da portaria

    Quando clica no botão "Cadastrar texto"
    Então a notificação de sucesso do cadastro de texto de portaria deve exibir "O texto da portaria foi cadastrado."
    E o sistema retorna para a listagem de textos de portaria
    E o novo modelo de texto aparece na listagem com o tipo "Anulação de Apostila"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 8 — Cadastrar texto de portaria para o tipo "Tornar sem efeito"
  # ══════════════════════════════════════════════════════════════
  @cadastro_fluxo_completo @critico
  Cenário: Cadastrar um novo texto de portaria para o tipo "Tornar sem efeito"
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Tornar sem efeito"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Tornar sem efeito"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E preenche o campo "Observações" do cadastro de texto de portaria com "QA obs 08"
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E adiciona o texto "QA texto 08" ao final do texto da portaria

    Quando clica no botão "Cadastrar texto"
    Então a notificação de sucesso do cadastro de texto de portaria deve exibir "O texto da portaria foi cadastrado."
    E o sistema retorna para a listagem de textos de portaria
    E o novo modelo de texto aparece na listagem com o tipo "Tornar sem efeito"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 9 — Estrutura do modal e do formulário de cadastro
  # ══════════════════════════════════════════════════════════════
  @validacao_estrutura @smoke
  Cenário: Validar estrutura do modal "Novo texto de portaria" e do formulário de cadastro
    Quando clica no botão "Cadastrar novo texto"
    Então o sistema exibe o modal de novo texto de portaria
    E o modal de novo texto de portaria exibe o texto "Escolha como deseja criar o texto da portaria."
    E o modal de novo texto de portaria exibe o texto "Você pode iniciar um novo texto ou utilizar como base o último texto cadastrado para o ato administrativo selecionado."
    E o modal de novo texto de portaria exibe o texto "Criar um novo texto"
    E o modal de novo texto de portaria exibe o texto "Usar o último texto cadastrado"
    E a opção "Criar um novo texto" já vem selecionada por padrão no modal de novo texto de portaria

    Quando clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    E valida a existencia do Texto "Informações gerais"
    E valida a existencia do Texto "Tipo de portaria"
    E valida a existencia do Texto "Status*"
    E valida a existencia do Texto "Nome do Modelo"
    E valida a existencia do Texto "Tipo de cargo"
    E valida a existencia do Texto "Variavel*"
    E valida a existencia do Texto "Observações"
    E valida a existencia do Texto "Texto da portaria*"
    E valida a existencia do Texto "Atenção ao editar o texto!"

    Quando clica no botão "Cancelar" do cadastro de texto de portaria
    Então o sistema retorna para a listagem de textos de portaria

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 10 — Cadastrar sem preencher nenhum campo obrigatório
  # ══════════════════════════════════════════════════════════════
  @excecao @campos_obrigatorios
  Cenário: Tentar cadastrar texto de portaria sem preencher nenhum campo obrigatório
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando clica no botão "Cadastrar texto"
    Então cada campo obrigatorio do cadastro de texto de portaria exibe a mensagem de campo obrigatorio
    E o sistema permanece na tela de cadastro de texto de portaria

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 11 — Variável selecionada sem o placeholder correspondente no texto
  # ══════════════════════════════════════════════════════════════
  @excecao @validacao_variaveis
  Cenário: Selecionar uma variável sem manter o placeholder correspondente no texto bloqueia o cadastro
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Designação"
    E seleciona uma opção aleatória no campo "Status" do cadastro de texto de portaria
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Designação"
    E seleciona uma opção aleatória no campo "Tipo de cargo" do cadastro de texto de portaria
    E seleciona as variáveis "Portaria, Nº SEI, Cargo" no texto da portaria
    E apaga o conteúdo do texto da portaria mantendo as variáveis selecionadas

    Quando clica no botão "Cadastrar texto"
    Então o sistema exibe o modal de revisão de variáveis do texto
    E o modal de revisão de variáveis exibe o texto "Algumas variáveis estão diferentes do formato esperado e podem impedir o preenchimento automático das informações na portaria."
    E o modal de revisão de variáveis exibe o texto "Por favor, volte ao texto e verifique se todas as variáveis estão no formato"

    Quando clica no botão "Revisar texto"
    Então o sistema permanece na tela de cadastro de texto de portaria

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 12 — Cancelar o cadastro descarta os dados preenchidos
  # ══════════════════════════════════════════════════════════════
  @excecao @cancelar_cadastro
  Cenário: Cancelar o cadastro sem salvar descarta os dados preenchidos
    Quando clica no botão "Cadastrar novo texto"
    E clica no botão "Criar texto"
    Então o sistema direciona para a tela de cadastro de texto de portaria

    Quando seleciona o tipo de portaria "Cessação"
    E preenche o campo "Nome do Modelo" do cadastro de texto de portaria com um nome único de automação para "Cessação"

    Quando clica no botão "Cancelar" do cadastro de texto de portaria
    Então o sistema retorna para a listagem de textos de portaria
    E o modelo de texto preenchido não aparece na listagem
