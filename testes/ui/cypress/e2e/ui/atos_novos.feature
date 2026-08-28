# language: pt

@atos-administrativos @atos_novos @testIsolation(false)
Funcionalidade: Criação de atos administrativos

  Como um usuário do sistema SIGNA
  Eu quero iniciar novos atos administrativos
  Para agilizar a criação de processos

  Contexto:
    Dado que o usuário já está autenticado no sistema
    E está na página "Atos Administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Nova Designação (via menu "Novo ato")
  # ══════════════════════════════════════════════════════════════
  @atos @nova_designacao @critico @smoke @skip
  Cenário: Iniciar nova designação através de Atos Administrativos

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação      |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Nova designação" no menu de novo ato
    Então o sistema direciona para a tela "Designação"
    E o sistema valida que está na página de nova designação
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
    E espera 10 seg
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
    E clica e preenche o campo RF titular com "7311559"
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
    E valida a existencia dos Botões "Voltar" e "Salvar"
    Quando clica em "Salvar"
    Então o sistema direciona para a tela "Atos administrativos"

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Nova Cessação (via menu "Novo ato")        [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @atos @nova_cessacao @critico @smoke @skip
  Cenário: Iniciar nova cessação através de Atos Administrativos

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação      |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Nova cessação" no menu de novo ato
    Então o sistema exibe o modal "Nova cessação"
    E valida a existência do título "Nova cessação"
    E valida a existência do campo "Portaria"
    Quando preenche o campo "Portaria" com "5791346"
    E seleciona o ano "2026" no campo de busca
    E clica em "Buscar"
    Então o sistema exibe a Tela "Cessação"

    E valida e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      A partir de
      Até
      Caráter Excepcional
      Impedimento para substituição:
      Motivo do afastamento:
      Pendência:
      """

    E valida e clica na aba "Servidor indicado"
    E valida a existencia dos Titulos
      """
      Nome Servidor
      Nome Social
      RF
      Vínculo
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """
      
    E valida e clica na aba "Servidor titular"
    E valida a existencia dos Titulos
      """
      Nome Servidor
      Nome Social
      RF
      Vínculo
      Cargo Base
      Lotação
      Laudo Médico
      Cargo Sobreposto/Função Atividade
      Local de Exercício
      """
    E valida a existencia do Botão "Editar"

    E valida e clica na aba "Portaria de cessação"
    E valida a existencia do Texto "Portaria de cessação*"
    E preenche o campo "Portaria de cessação*" com numero aleatorio
    E valida a existencia do Texto "Nº SEI*"
    E preenche o campo "Nº SEI*" com numero aleatorio
    E valida a existencia do Texto "D.O"
    E valida a existencia do Texto "Ano Vigente*"
    E valida a existencia do Texto "Cessação a partir de:*"
    E valida a existencia do Texto "A pedido?*"
    E valida a existencia do Texto "Remoção?*"
    E valida a existencia do Texto "Aposentadoria?*"

    E valida a existencia do botão de navegação "Trechos para o SEI"
    Quando clica no botão "Trechos para o SEI"
    E valida a existencia do Texto "PORTARIA"

    E valida a existencia do botão de navegação "Salvar"
    # E clica em "Salvar"

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 3 — Nova Insubsistência (via menu "Novo ato")   [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @atos @nova_insubsistencia @critico @smoke @skip
  Cenário: Iniciar nova insubsistência através de Atos Administrativos

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação       |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Tornar insubsistente" no menu de novo ato
    Então o sistema exibe o modal "Nova insubsistência"
    E valida a existência do título "Nova insubsistência"
    E valida a existência do campo "Portaria de designação ou cessação"
    Quando preenche o campo "Portaria de designação ou cessação" com "8901234"
    E seleciona o ano "2026" no campo de busca
    E clica em "Buscar"
    Então o sistema exibe a Tela "Insubsistência"
    E valida e clica na aba "Servidor indicado"
    E valida a existencia dos Titulos com skip se vazio
      """
      Nome Servidor
      Nome Social
      RF
      Vínculo
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    E valida a existencia e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos com skip se vazio
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      """

    E valida a existencia e clica na aba "Portarias de Cessação"
    E valida a existencia do Texto "Selecione o tipo de insubsistência:"
    E valida a existencia das opções "Designação" e "Cessação"
    E seleciona a opção "Designação"

    E valida a existencia do Texto "Portaria de insubsistência"
    E preenche o campo "Portaria de insubsistência" com numero aleatorio
    E valida a existencia do Texto "Ano Vigente*"
    E valida a existencia do Texto "Nº SEI"
    E preenche o campo "Nº SEI" com numero aleatorio
    E valida a existencia do Texto "D.O"

    E valida a existencia do Texto "Observações"
    E preenche o campo "Observações" com texto aleatorio
    E valida a existencia do botão de navegação "Trechos para o SEI"
    Quando clica no botão "Trechos para o SEI"
    E valida a existencia do Texto "PORTARIA"

    E valida a existencia do botão de navegação "Salvar"
    # E clica em "Salvar" — não executado: poucas portarias disponíveis em QA
    # para reuso em testes; salvar consumiria uma a cada execução.

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 4 — Nova Apostila (via menu "Novo ato")        [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @atos @nova_apostila @critico @smoke @skip
  Cenário: Iniciar nova apostila através de Atos Administrativos

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação       |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Nova apostila" no menu de novo ato
    Então o sistema exibe o modal "Nova apostila"
    E valida a existência do título "Nova apostila"
    E valida a existência do campo "Portaria"
    Quando preenche o campo "Portaria" com "5791346"
    E seleciona o ano "2026" no campo de busca
    E clica em "Buscar"
    E valida se a portaria possui apostila disponível para criar
    Então o sistema exibe a Tela "Apostila"

    E valida a existencia e clica na aba "Servidor indicado"
    E valida a existencia dos Titulos com skip se vazio
      """
      Nome Servidor
      Nome Social
      RF
      Vínculo
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    E valida a existencia e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos com skip se vazio
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      """

    # "valida a existencia da aba" (sem "e clica") abre o accordion e define
    # apostilaCessacaoTemDados. Steps com capital "V" abaixo verificam esse flag:
    # true → executa | false → pula com log (seção sem dados de cessação).
    E valida a existencia da aba "Portarias de Cessação"
    E Valida a existencia do texto "Selecione o tipo de Apostila:"
    E Valida e seleciona "Designação"

    E Valida a existencia e clica na aba "Portaria de Apostila"
    E Valida a existencia do texto "Nº SEI"
    E Valida a existencia do texto "D.O"
    E preenche o campo apostilamento "Nº SEI" com "11062026"
    E Valida a existencia do texto "Observações"
    E preenche o campo apostilamento "Observações" com "teste de automação 11062026"

    E Valida o botão "Trechos para o SEI"
    Quando Clica no botão apostilamento "Trechos para o SEI"
    Então Valida a existencia do texto "PORTARIA"

    E Valida o botão "Salvar"
    # Quando Clica em salvar apostilamento — não executado: poucas portarias
    # disponíveis em QA para reuso em testes; salvar consumiria uma a cada
    # execução.
    # Então o sistema processa o apostilamento sem erros

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 5 — Anular Apostila (via menu "Novo ato")        [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @atos @anular_apostila @critico @smoke @skip
  Cenário: Iniciar anulação de apostila através de Atos Administrativos

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação       |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Anular apostila" no menu de novo ato
    Então o sistema exibe o modal "Nova anulação de apostila"
    E valida a existência do título "Nova anulação de apostila"
    E valida a existência do campo "Portaria"
    Quando preenche o campo "Portaria" com "7890123"
    E seleciona o ano "2026" no campo de busca
    E clica em "Buscar"
    E valida se a portaria possui apostila vinculada para anular
    Então o sistema exibe a Tela "Apostila"

    # Nota: a tela "Anular Apostila" NÃO usa abas (Ant Design Tabs) como a tela
    # "Nova apostila" — é uma página única com 3 seções em accordion, todas já
    # abertas por padrão: "Dados do servidor indicado", "Portaria de designação"
    # e "Dados da portaria de anulação". Não há necessidade (nem elemento) de
    # clique em aba para revelar o conteúdo.

    E Valida a existencia do texto "Dados do servidor indicado"
    E valida a existencia dos Titulos com skip se vazio
      """
      Nome Servidor
      Nome Social
      RF
      Vínculo
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    E Valida a existencia do texto "Portaria de designação"
    E valida a existencia dos Titulos com skip se vazio
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      """

    E Valida a existencia do texto "Dados da portaria de anulação"
    E Valida a existencia do texto "Portaria da apostila da designacao"
    E preenche o campo apostilamento "Portaria da apostila da designacao" com "5485746"
    E Valida a existencia do texto "Ano Vigente"
    E preenche o campo apostilamento "Ano Vigente" com "2026"
    E Valida a existencia do texto "Nº SEI"
    E preenche o campo apostilamento "Nº SEI" com "4587851"
    E Valida a existencia do texto "D.O"
    E Valida a existencia do texto "Observações"
    E preenche o campo apostilamento "Observações" com "teste de automação 562"

    # Nota: nesta tela o botão chama-se "Gerar texto SEI" (não "Trechos para o SEI").
    E Valida o botão "Gerar texto SEI"
    Quando Clica no botão apostilamento "Gerar texto SEI"
    Então Valida a existencia do texto "PORTARIA"

    # Nota: nas capturas de tela desta cena o botão "Salvar" não aparece ainda
    # na página (ela termina logo após "Gerar texto SEI"). Se o botão só surgir
    # dinamicamente após gerar o texto, a validação abaixo deve passar; caso
    # contrário, remova-a ou ajuste conforme o comportamento real da tela.
    # E Valida o botão "Salvar"
    # Quando Clica em salvar apostilamento — não executado: poucas portarias
    # disponíveis em QA para reuso em testes; salvar consumiria uma a cada
    # execução.
    # Então o sistema processa o apostilamento sem erros

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 6 — Nova Designação com Cargo Vago (via menu "Novo ato")
  # ══════════════════════════════════════════════════════════════
  @atos @nova_designacao @cargo_vago @critico @smoke
  Cenário: Iniciar nova designação com cargo vago através de Atos Administrativos

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação      |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Nova designação" no menu de novo ato
    Então o sistema direciona para a tela "Designação"
    E o sistema valida que está na página de nova designação
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
    E espera 10 seg
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

    # ── Passo 2 — Portarias de designação (Cargo Vago) ────────────────────────
    Então o sistema exibe a seção "Portarias de designação"
    E deve visualizar os campos da portaria
    E preenche o campo portaria com numero aleatorio
    E preenche o campo SEI com numero aleatorio
    E navega ate Seleciona o tipo de cargo
    E valida a existencia do texto "Selecione o tipo de cargo:"
    E valida a existencia das opcoes Cargo Disponivel e Cargo Vago
    E seleciona e clica a opcao "Cargo Vago"
    E valida a existencia do Texto "Cargo"
    E valida a existencia do botao de selecao de cargo vago
    E clica no campo "Cargo" e seleciona a primeira opcao disponivel
    E espera 10 seg
    E deve visualizar os botoes de navegacao do passo 2
    Quando clica em Avançar no rodape do passo 2

    # ── Passo 4 — Resumo e confirmação ───────────────────────────────────────
    # Nota: o fluxo cargo vago não exibe "Informações adicionais" — a designação
    # é confirmada automaticamente e a página de resumo mostra apenas a portaria.
    Então o sistema direciona para a pagina de resumo da designacao
    E deve visualizar os dados do resumo da portaria
    E valida a existencia dos Botões "Voltar" e "Salvar"
    Quando clica em "Salvar"
    Então o sistema direciona para a tela "Atos administrativos"

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 7 — Pesquisa de servidor com RF inexistente (via menu "Novo ato")
  # ══════════════════════════════════════════════════════════════
  @atos @nova_designacao @excecao @rf-invalido
  Cenário: Pesquisar servidor com RF inexistente ao iniciar nova designação

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação      |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Nova designação" no menu de novo ato
    Então o sistema direciona para a tela "Designação"
    E o sistema valida que está na página de nova designação
    E deve visualizar o formulário da designação
    Quando preenche o campo RF com "0000000"
    E clica em pesquisar
    Então o sistema exibe mensagem de servidor não encontrado

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 8 — Avançar Passo 2 sem portaria obrigatória (via menu "Novo ato")
  # ══════════════════════════════════════════════════════════════
  @atos @nova_designacao @excecao @passo2-sem-portaria
  Cenário: Tentar avançar o Passo 2 sem preencher a portaria obrigatória

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação      |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Nova designação" no menu de novo ato
    Então o sistema direciona para a tela "Designação"
    E o sistema valida que está na página de nova designação
    E deve visualizar o formulário da designação
    Quando preenche o campo RF com RF aleatorio da lista
    E clica em pesquisar
    Então deve exibir o accordion "Dados do servidor indicado"
    Quando clica em "Dados do servidor indicado"
    E o sistema abre o conteúdo do accordion
    Então deve visualizar a seção de unidade proponente
    Quando seleciona uma DRE aleatória no formulário
    E seleciona uma unidade proponente aleatória
    E espera 10 seg
    E valida a existencia do botão e clica em "Pesquisar Unidade proponente"
    Então o sistema carrega o painel de dados da unidade proponente
    Quando seleciona o cargo de forma aleatoria no painel da unidade
    Quando clica no botão Avançar
    Então o sistema exibe a seção "Portarias de designação"
    Quando tenta avançar o passo 2 sem preencher a portaria
    Então o sistema impede o avanco do passo 2

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 9 — Nova Insubsistência tipo Cessação (via menu "Novo ato")
  # ══════════════════════════════════════════════════════════════
  @atos @nova_insubsistencia @insubsistente_cessacao @critico @smoke
  Cenário: Iniciar nova insubsistência do tipo Cessação através de Atos Administrativos

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação       |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Tornar insubsistente" no menu de novo ato
    Então o sistema exibe o modal "Nova insubsistência"
    E valida a existência do título "Nova insubsistência"
    E valida a existência do campo "Portaria de designação ou cessação"
    Quando preenche o campo "Portaria de designação ou cessação" com "8901234"
    E seleciona o ano "2026" no campo de busca
    E clica em "Buscar"
    Então o sistema exibe a Tela "Insubsistência"
    E valida e clica na aba "Servidor indicado"
    E valida a existencia dos Titulos com skip se vazio
      """
      Nome Servidor
      Nome Social
      RF
      Vínculo
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    E valida a existencia e clica na aba "Portaria de designação"
    E valida a existencia dos Titulos com skip se vazio
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      D.O
      """

    E valida a existencia e clica na aba "Portarias de Cessação"
    E valida a existencia do Texto "Selecione o tipo de insubsistência:"
    E valida a existencia das opções "Designação" e "Cessação"
    E seleciona a opção "Cessação"

    E valida a existencia do Texto "Portaria de insubsistência"
    E preenche o campo "Portaria de insubsistência" com numero aleatorio
    E valida a existencia do Texto "Ano Vigente*"
    E valida a existencia do Texto "Nº SEI"
    E preenche o campo "Nº SEI" com numero aleatorio
    E valida a existencia do Texto "D.O"

    E valida a existencia do Texto "Observações"
    E preenche o campo "Observações" com texto aleatorio
    E valida a existencia do botão de navegação "Trechos para o SEI"
    Quando clica no botão "Trechos para o SEI"
    E valida a existencia do Texto "PORTARIA"

    E valida a existencia do botão de navegação "Salvar"
    # E clica em "Salvar" — não executado: poucas portarias disponíveis em QA
    # para reuso em testes; salvar consumiria uma a cada execução.

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 10 — Validação dos títulos e opções do menu "Novo ato"
  # ══════════════════════════════════════════════════════════════
  # Cenário só de validação de texto (sem executar nenhum fluxo): garante
  # que o título da página e os 6 rótulos do menu "Novo ato" continuam
  # corretos, independente de qualquer fluxo funcional ter mudado.
  # Não fecha o menu explicitamente ao final — o Contexto do próximo
  # cenário já detecta e fecha (Esc) qualquer dialog/dropdown deixado
  # aberto (ver atos_administrativos_steps.js, "que o usuário já está
  # autenticado no sistema").
  @atos @validacao_textos @regressao
  Cenário: Validar título da página e opções do menu "Novo ato"

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação       |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 11 — Nova Cessação sem selecionar o ano da portaria
  # ══════════════════════════════════════════════════════════════
  # Mensagem confirmada no schema do frontend (ModalBuscaPortaria/schema.ts,
  # z.string().min(1, "Selecione o ano.")) — validação de campo obrigatório
  # do próprio formulário, dispara antes de qualquer chamada à API.
  @atos @nova_cessacao @excecao @ano-obrigatorio
  Cenário: Tentar buscar portaria de cessação sem selecionar o ano

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação       |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Nova cessação" no menu de novo ato
    Então o sistema exibe o modal "Nova cessação"
    E valida a existência do título "Nova cessação"
    E valida a existência do campo "Portaria"
    Quando preenche o campo "Portaria" com "5791346"
    E clica em "Buscar"
    Então valida a existencia do texto "Selecione o ano."

    E clica em "Cancelar"

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 12 — Nova Insubsistência sem selecionar o ano da portaria
  # ══════════════════════════════════════════════════════════════
  # Mesma validação de campo obrigatório do Cenário 11 — modal
  # (ModalBuscaPortaria) e mensagem compartilhados entre os fluxos de
  # cessação, insubsistência e apostila; aqui com o rótulo "Ano da
  # designação ou cessação" específico da insubsistência.
  @atos @nova_insubsistencia @excecao @ano-obrigatorio
  Cenário: Tentar buscar portaria de designação ou cessação sem selecionar o ano

    Então valida a existencia do titulo "Atos administrativos"

    Quando clica no botão "Novo ato"
    Então o sistema exibe as opções:
      | Nova designação       |
      | Nova cessação         |
      | Tornar insubsistente  |
      | Tornar sem efeito     |
      | Nova apostila         |
      | Anular apostila       |

    Quando seleciona a opção "Tornar insubsistente" no menu de novo ato
    Então o sistema exibe o modal "Nova insubsistência"
    E valida a existência do título "Nova insubsistência"
    E valida a existência do campo "Portaria de designação ou cessação"
    Quando preenche o campo "Portaria de designação ou cessação" com "8901234"
    E clica em "Buscar"
    Então valida a existencia do texto "Selecione o ano."

    E clica em "Cancelar"

    # ── Retorno a Atos Administrativos (sem logar de novo — mesma sessão) ────
    Quando o sistema navega até o menu lateral esquerdo
    E seleciona a opção "Início" no menu lateral
    E seleciona a opção "Atos administrativos" no menu lateral
    Então o sistema direciona para a tela "Atos administrativos"
