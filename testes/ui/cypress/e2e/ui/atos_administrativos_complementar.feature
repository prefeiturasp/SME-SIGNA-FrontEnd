# language: pt

@atos-administrativos @acoes_listagem @testIsolation(false)
Funcionalidade: Ações da listagem de Atos Administrativos

  Como um usuário do sistema SIGNA
  Eu quero executar ações (Apostilar, Cessar, Tornar insubsistente, Anular
  apostila, Tornar sem efeito, Excluir) a partir do menu de cada linha da
  listagem de Atos Administrativos
  Para dar continuidade a um ato já existente sem precisar buscá-lo de novo
  pelo menu "Novo ato"

  Contexto:
    Dado que o usuário já está autenticado no sistema
    E está na página "Atos Administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Apostilar uma designação publicada pela listagem
  # ══════════════════════════════════════════════════════════════
  @acoes_listagem @apostilar @critico @smoke
  Cenário: Apostilar uma designação publicada a partir do menu de ações da listagem

    Quando seleciona uma designação publicada de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Apostilar"
    Então o sistema exibe a Tela "Apostila"
    E os dados da designação selecionada já aparecem carregados na tela
    E não deve exibir o modal de busca de portaria

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Cessar uma designação publicada pela listagem
  # ══════════════════════════════════════════════════════════════
  @acoes_listagem @cessar @critico @smoke
  Cenário: Cessar uma designação publicada a partir do menu de ações da listagem

    Quando seleciona uma designação publicada de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Cessar"
    Então o sistema exibe a Tela "Cessação"
    E os dados da designação selecionada já aparecem carregados na tela
    E não deve exibir o modal de busca de portaria

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 3 — Tornar insubsistente uma designação pela listagem
  # ══════════════════════════════════════════════════════════════
  @acoes_listagem @tornar_insubsistente @critico @smoke
  Cenário: Tornar insubsistente uma designação a partir do menu de ações da listagem

    Quando seleciona uma designação publicada de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Tornar insubsistente"
    Então o sistema exibe a Tela "Insubsistência"
    E os dados da designação selecionada já aparecem carregados na tela
    E não deve exibir o modal de busca de portaria

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 4 — Apostilar uma cessação pela listagem
  # ══════════════════════════════════════════════════════════════
  @acoes_listagem @apostilar @critico
  Cenário: Apostilar uma cessação a partir do menu de ações da listagem

    Quando seleciona uma cessação de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Apostilar"
    Então o sistema exibe a Tela "Apostila"
    E o tipo de apostila pré-selecionado é "Cessação"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 5 — Tornar insubsistente uma cessação pela listagem
  # ══════════════════════════════════════════════════════════════
  @acoes_listagem @tornar_insubsistente @critico
  Cenário: Tornar insubsistente uma cessação a partir do menu de ações da listagem

    Quando seleciona uma cessação de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Tornar insubsistente"
    Então o sistema exibe a Tela "Insubsistência"
    E os dados da cessação selecionada já aparecem carregados na tela

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 6 — Anular apostila pela listagem
  # ══════════════════════════════════════════════════════════════
  # Caminho direto: pula o modal "Nova anulação de apostila" (busca por
  # portaria) que o Cenário 5 de atos_novos.feature exercita.
  @acoes_listagem @anular_apostila @critico
  Cenário: Anular uma apostila a partir do menu de ações da listagem

    Quando seleciona uma apostila de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Anular Apostila"
    Então o sistema exibe a tela de anulação de apostila
    E os dados da apostila selecionada já aparecem carregados na tela
    E não deve exibir o modal de busca de portaria

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 7 — Tornar sem efeito uma insubsistência pela listagem
  # ══════════════════════════════════════════════════════════════
  # Único caminho de acesso a esta tela no sistema — não existe entrada
  # equivalente pelo menu "Novo ato".
  @acoes_listagem @tornar_sem_efeito @critico
  Cenário: Tornar sem efeito uma insubsistência a partir do menu de ações da listagem

    Quando seleciona uma insubsistência de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Tornar sem efeito"
    Então o sistema direciona para a tela de detalhes da insubsistência
    E deve visualizar o texto "Portaria do ato tornar sem efeito"
    E valida a existencia do botão de navegação "Gerar texto SEI"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 8 — Excluir uma designação não publicada pela listagem
  # ══════════════════════════════════════════════════════════════
  @acoes_listagem @excluir @critico
  Cenário: Excluir uma designação não publicada a partir do menu de ações da listagem

    Quando seleciona uma designação não publicada de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Excluir"
    Então o sistema exibe o modal de confirmação "Excluir designação"
    E o modal exibe o texto "Tem certeza que deseja excluir esta designação? Essa ação não pode ser desfeita."
    Quando confirma a exclusão clicando em "Excluir"
    Então o sistema exibe a notificação "Designação excluída com sucesso!"
    E a designação excluída não aparece mais na listagem

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 9 — Cancelar a exclusão mantém a designação na listagem
  # ══════════════════════════════════════════════════════════════
  @acoes_listagem @excluir @excecao
  Cenário: Cancelar a exclusão de uma designação mantém o registro na listagem

    Quando seleciona uma designação não publicada de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Excluir"
    Então o sistema exibe o modal de confirmação "Excluir designação"
    Quando cancela a exclusão clicando em "Cancelar"
    Então o modal de confirmação é fechado
    E a designação permanece na listagem

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 10 — Designação publicada não oferece Editar nem Excluir
  # ══════════════════════════════════════════════════════════════
  # "Editar"/"Excluir" só aparecem para status "não publicada". Cessar/Tornar
  # insubsistente são cobertos à parte nos Cenários 12 e 13.
  @acoes_listagem @regras_menu @regressao
  Cenário: Menu de ações de uma designação publicada não oferece Editar nem Excluir

    Quando seleciona uma designação publicada de forma aleatoria na listagem
    E navega para a seção Action
    Então o menu de ações exibe as opções:
      | Apostilar             |
    E o menu de ações não exibe a opção "Editar"
    E o menu de ações não exibe a opção "Excluir"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 11 — Designação não publicada oferece Editar e Excluir
  # ══════════════════════════════════════════════════════════════
  # Mesma ressalva do Cenário 10 sobre Cessar/Tornar insubsistente.
  @acoes_listagem @regras_menu @regressao
  Cenário: Menu de ações de uma designação não publicada oferece Editar e Excluir

    Quando seleciona uma designação não publicada de forma aleatoria na listagem
    E navega para a seção Action
    Então o menu de ações exibe as opções:
      | Editar                |
      | Apostilar             |
      | Excluir               |

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 12 — Designação já cessada não oferece "Cessar" de novo
  # ══════════════════════════════════════════════════════════════
  # Regra de negócio: não é possível cessar duas vezes o mesmo ato.
  @acoes_listagem @regras_menu @regressao
  Cenário: Menu de ações de uma designação já cessada não exibe a opção Cessar novamente

    Quando seleciona uma designação com cessação vinculada de forma aleatoria na listagem
    E navega para a seção Action
    Então o menu de ações não exibe a opção "Cessar"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 13 — Ato já com insubsistência não oferece "Tornar insubsistente" de novo [BLOQUEADO]
  # ══════════════════════════════════════════════════════════════
  # Regra de negócio: não é possível tornar insubsistente duas vezes o mesmo
  # ato. @skip: nenhuma designação publicada com insubsistência vinculada
  # existe hoje em QA — falta de massa de dado, não bug. Reativar quando
  # existir esse dado.
  @acoes_listagem @regras_menu @regressao @skip
  Cenário: Menu de ações de um ato já com insubsistência vinculada não exibe Tornar insubsistente novamente

    Quando seleciona um ato com insubsistência vinculada de forma aleatoria na listagem
    E navega para a seção Action
    Então o menu de ações não exibe a opção "Tornar insubsistente"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 14 — Anular apostila de cessação pela listagem      [BLOQUEADO]
  # ══════════════════════════════════════════════════════════════
  # Mesmo caminho do Cenário 6, para o tipo "Apostila de Cessação".
  # @skip: filtro retorna "Não há dados" em QA — falta de massa de dado, não
  # bug. Reativar quando existir esse dado.
  @acoes_listagem @anular_apostila @critico @skip
  Cenário: Anular uma apostila de cessação a partir do menu de ações da listagem

    Quando seleciona uma apostila de cessação de forma aleatoria na listagem
    E navega para a seção Action
    E clica e seleciona a opção "Anular Apostila"
    Então o sistema exibe a tela de anulação de apostila
    E os dados da apostila selecionada já aparecem carregados na tela
    E não deve exibir o modal de busca de portaria
