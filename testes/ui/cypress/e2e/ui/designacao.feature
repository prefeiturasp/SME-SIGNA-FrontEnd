# language: pt

@designacao @smoke
Funcionalidade: Designação de Servidores
  Como um usuário do sistema SIGNA
  Eu quero gerenciar designações de servidores
  Para verificar aptidão e designar servidores para cargos ou funções disponíveis

  Contexto:
    Dado que o usuário está autenticado no sistema

  @skip @designacao-fluxo-completo @critico
  Cenário: Nova designação de servidor Cargo Disponivel
    Dado que o usuário está na página do dashboard
    Quando navega pelo menu lateral e clica em "Designações"
    Quando clica no botão Nova Designação
    Então o sistema valida que está na página de nova designação
    E deve visualizar o texto "Designação"
    E deve visualizar o formulário da designação
    Quando preenche o campo RF com "7311559"
    E clica em pesquisar
    Então deve exibir o accordion "Dados do servidor indicado"
    Quando clica em "Dados do servidor indicado"
    E o sistema abre o conteúdo do accordion
    Então deve visualizar os campos de dados do servidor
    Quando clica no botão de editar servidor
    Então deve abrir o modal de edição dos dados do servidor
    E o modal deve exibir os campos editáveis do servidor
    Quando cancela a edição no modal
    Então o modal de edição deve ser fechado
    E deve visualizar a seção de unidade proponente
    Quando seleciona uma DRE aleatória no formulário
    E seleciona uma unidade proponente aleatória
    E espera 20 seg
    E valida a existencia do botão e clica em "Pesquisar Unidade proponente"
    Então o sistema carrega o painel de dados da unidade proponente
    E deve visualizar o texto "DRE"
    E deve visualizar o texto "Unidade proponente"
    E deve visualizar o texto "Código Estrutura hierárquica"
    E deve visualizar o texto "Funcionários da unidade"
    Quando seleciona o cargo "ASSISTENTE DE DIRETOR DE ESCOLA" no painel da unidade
    Então deve visualizar o texto "Qtd. Turmas"
    E deve visualizar o texto "Cargo sobreposto"
    E deve visualizar o texto "Módulos"
    Quando clica no botão Avançar

    # ── Passo 2 — Portarias de designação ────────────────────────────────────
    Então o sistema exibe a seção "Portarias de designação"
    E deve visualizar os campos da portaria
    E preenche o campo portaria com numero aleatorio
    E preenche o campo SEI com numero aleatorio
    E navega ate Seleciona o tipo de cargo
    E valida a existencia das opcoes Cargo Disponivel e Cargo Vago
    E seleciona a opcao "Cargo Disponível"
    E clica e preenche o campo RF titular com um dos RF da lista
    E valida a existencia do botao e clica em pesquisar o titular
    Então o sistema carrega e exibe os dados do titular
    E deve visualizar os campos do servidor titular
    Quando clica no botao editar do titular
    Então deve abrir o modal de edicao do servidor titular
    E o modal deve exibir os campos editaveis do titular
    Quando cancela a edicao no modal do titular
    Então o modal de edicao do titular deve ser fechado
    E deve visualizar os botoes de navegacao do passo 2
    Quando clica em Avançar no rodape do passo 2

    # ── Passo 4 — Resumo e confirmação ───────────────────────────────────────
    # Nota: o fluxo cargo disponivel não exibe "Informações adicionais" — a
    # designação é confirmada e a página de resumo mostra apenas a portaria.
    Então o sistema direciona para a pagina de resumo da designacao
    E deve visualizar os dados do resumo da portaria

  @skip @designacao-fluxo-completo @critico @cargo-vago
  Cenário: Nova designação de servidor com cargo vago
    Dado que o usuário está na página do dashboard
    Quando navega pelo menu lateral e clica em "Designações"
    Quando clica no botão Nova Designação
    Então o sistema valida que está na página de nova designação
    E deve visualizar o texto "Designação"
    E deve visualizar o formulário da designação
    Quando preenche o campo RF com RF aleatorio da lista
    E clica em pesquisar
    Então deve exibir o accordion "Dados do servidor indicado"
    Quando clica em "Dados do servidor indicado"
    E o sistema abre o conteúdo do accordion
    Então deve visualizar os campos de dados do servidor
    Quando clica no botão de editar servidor
    Então deve abrir o modal de edição dos dados do servidor
    E o modal deve exibir os campos editáveis do servidor
    Quando cancela a edição no modal
    Então o modal de edição deve ser fechado
    E deve visualizar a seção de unidade proponente
    Quando seleciona uma DRE aleatória no formulário
    E seleciona uma unidade proponente aleatória
    E espera 20 seg
    E valida a existencia do botão e clica em "Pesquisar Unidade proponente"
    Então o sistema carrega o painel de dados da unidade proponente
    E deve visualizar o texto "DRE"
    E deve visualizar o texto "Unidade proponente"
    E deve visualizar o texto "Código Estrutura hierárquica"
    E deve visualizar o texto "Funcionários da unidade"
    Quando seleciona o cargo de forma aleatoria no painel da unidade
    Então deve visualizar o texto "Qtd. Turmas"
    E deve visualizar o texto "Cargo sobreposto"
    E deve visualizar o texto "Módulos"
    Quando clica no botão Avançar

    # ── Passo 2 — Portarias de designação ────────────────────────────────────
    Então o sistema exibe a seção "Portarias de designação"
    E deve visualizar os campos da portaria
    E preenche o campo portaria com numero aleatorio
    E preenche o campo SEI com numero aleatorio
    E navega ate Seleciona o tipo de cargo
    E valida a existencia do texto "Selecione o tipo de cargo:"
    E valida a existencia das opcoes Cargo Disponivel e Cargo Vago
    E seleciona e clica a opcao "Cargo Vago"
    E valida a existencia do texto "Selecione o cargo"
    E clica no campo e seleciona aleatoriamente um dos cargos vagos
    E espera 20 seg
    E deve visualizar os botoes de navegacao do passo 2
    Quando clica em Avançar no rodape do passo 2

    # ── Passo 4 — Resumo e confirmação ───────────────────────────────────────
    # Nota: o fluxo cargo vago não exibe "Informações adicionais" — a designação
    # é confirmada automaticamente e a página de resumo mostra apenas a portaria.
    Então o sistema direciona para a pagina de resumo da designacao
    E deve visualizar os dados do resumo da portaria

  # ══════════════════════════════════════════════════════════════════════════════
  # CENÁRIOS DE EXCEÇÃO
  # ══════════════════════════════════════════════════════════════════════════════

  @excecao @rf-invalido
  Cenário: Pesquisa de servidor com RF inexistente no sistema
    Dado que o usuário está na página do dashboard
    Quando navega pelo menu lateral e clica em "Designações"
    Quando clica no botão Nova Designação
    Então o sistema valida que está na página de nova designação
    E deve visualizar o formulário da designação
    Quando preenche o campo RF com "0000000"
    E clica em pesquisar
    Então o sistema exibe mensagem de servidor não encontrado

  @excecao @passo2-sem-portaria
  Cenário: Tentativa de avançar o Passo 2 sem preencher a portaria obrigatória
    Dado que o usuário está na página do dashboard
    Quando navega pelo menu lateral e clica em "Designações"
    Quando clica no botão Nova Designação
    Então o sistema valida que está na página de nova designação
    E deve visualizar o formulário da designação
    Quando preenche o campo RF com RF aleatorio da lista
    E clica em pesquisar
    Então deve exibir o accordion "Dados do servidor indicado"
    Quando clica em "Dados do servidor indicado"
    E o sistema abre o conteúdo do accordion
    Então deve visualizar a seção de unidade proponente
    Quando seleciona uma DRE aleatória no formulário
    E seleciona uma unidade proponente aleatória
    E espera 20 seg
    E valida a existencia do botão e clica em "Pesquisar Unidade proponente"
    Então o sistema carrega o painel de dados da unidade proponente
    Quando seleciona o cargo de forma aleatoria no painel da unidade
    Quando clica no botão Avançar
    Então o sistema exibe a seção "Portarias de designação"
    Quando tenta avançar o passo 2 sem preencher a portaria
    Então o sistema impede o avanco do passo 2

  @excecao @rf-titular-invalido
  Cenário: Pesquisa de titular com RF inválido no Passo 2
    Dado que o usuário está na página do dashboard
    Quando navega pelo menu lateral e clica em "Designações"
    Quando clica no botão Nova Designação
    Então o sistema valida que está na página de nova designação
    E deve visualizar o formulário da designação
    Quando preenche o campo RF com RF aleatorio da lista
    E clica em pesquisar
    Então deve exibir o accordion "Dados do servidor indicado"
    Quando clica em "Dados do servidor indicado"
    E o sistema abre o conteúdo do accordion
    Então deve visualizar a seção de unidade proponente
    Quando seleciona uma DRE aleatória no formulário
    E seleciona uma unidade proponente aleatória
    E espera 20 seg
    E valida a existencia do botão e clica em "Pesquisar Unidade proponente"
    Então o sistema carrega o painel de dados da unidade proponente
    Quando seleciona o cargo de forma aleatoria no painel da unidade
    Quando clica no botão Avançar
    Então o sistema exibe a seção "Portarias de designação"
    E deve visualizar os campos da portaria
    E preenche o campo portaria com numero aleatorio
    E preenche o campo SEI com numero aleatorio
    E navega ate Seleciona o tipo de cargo
    E seleciona a opcao "Cargo Disponível"
    E clica e preenche o campo RF titular com "0000000"
    E espera 20 seg
    E valida a existencia do botao e clica em pesquisar o titular
    Então o sistema exibe mensagem de titular não encontrado

  @excecao @rf-vazio
  Cenário: Tentativa de pesquisa sem preencher o campo RF
    Dado que o usuário está na página do dashboard
    Quando navega pelo menu lateral e clica em "Designações"
    Quando clica no botão Nova Designação
    Então o sistema valida que está na página de nova designação
    E deve visualizar o formulário da designação
    Quando tenta pesquisar sem preencher o campo RF
    Então o sistema impede a pesquisa sem RF

  @excecao @cargo-vago-sem-selecao
  Cenário: Tentativa de avançar com Cargo Vago sem selecionar o cargo específico
    Dado que o usuário está na página do dashboard
    Quando navega pelo menu lateral e clica em "Designações"
    Quando clica no botão Nova Designação
    Então o sistema valida que está na página de nova designação
    E deve visualizar o formulário da designação
    Quando preenche o campo RF com RF aleatorio da lista
    E clica em pesquisar
    Então deve exibir o accordion "Dados do servidor indicado"
    Quando clica em "Dados do servidor indicado"
    E o sistema abre o conteúdo do accordion
    Então deve visualizar a seção de unidade proponente
    Quando seleciona uma DRE aleatória no formulário
    E seleciona uma unidade proponente aleatória
    E espera 20 seg
    E valida a existencia do botão e clica em "Pesquisar Unidade proponente"
    Então o sistema carrega o painel de dados da unidade proponente
    Quando seleciona o cargo de forma aleatoria no painel da unidade
    Quando clica no botão Avançar
    Então o sistema exibe a seção "Portarias de designação"
    E deve visualizar os campos da portaria
    E preenche o campo portaria com numero aleatorio
    E preenche o campo SEI com numero aleatorio
    E navega ate Seleciona o tipo de cargo
    E valida a existencia do texto "Selecione o tipo de cargo:"
    E valida a existencia das opcoes Cargo Disponivel e Cargo Vago
    E seleciona e clica a opcao "Cargo Vago"
    E valida a existencia do texto "Selecione o cargo"
    Quando tenta avançar o passo 2 sem preencher a portaria
    Então o sistema impede o avanco do passo 2
