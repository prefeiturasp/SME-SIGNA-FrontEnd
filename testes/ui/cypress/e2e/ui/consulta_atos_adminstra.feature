# language: pt

@editar-designacao @visualizar
Funcionalidade: Editar e visualizar designação de servidor
  Como gestor de RH no sistema SIGNA
  Eu quero editar designações ativas e consultar os dados de qualquer designação
  Para atualizar informações de portaria/servidor ou apenas conferir os dados sem alterá-los

  Regra: A edição deve ser realizada apenas em designações ativas.

  Contexto:
    Dado que o usuário está autenticado no sistema

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 1 — Editar designação (fluxo completo)            [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @editar-fluxo-completo @smoke
  Cenário: Editar designação e validar todas as seções do formulário

    Dado que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de atos administrativos"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "Tipo, Nº SEI, Observações, Portaria do ato, Servidor indicado, Registro Funcional (RF), Status"
    E Seleciona uma das Designação de forma aleatoria para editar
    E navega para a seção Action
    E clica e seleciona a opção "Editar"
    Então o sistema exibe a Tela "Editar Designação"

    E valida a existencia das seguintes seções:
      | Unidade Proponente         |
      | Portarias de designação    |
      | Dados do servidor indicado |

    E valida a existencia da seção "Dados do Servidor Titular" quando aplicável a esta designação

    E valida a existencia dos botões de edição "Voltar" e "Avançar"
    E clica em "Avançar"
    E clica em "Salvar"
    Então o sistema direciona para a tela "Atos administrativos"

  # ══════════════════════════════════════════════════════════════
  # CENÁRIO 2 — Visualizar designação (somente leitura)       [ATIVO]
  # ══════════════════════════════════════════════════════════════
  @visualizar-fluxo-completo @smoke
  Cenário: Visualizar designação existente e validar todos os dados

    Dado que o usuário está na página do dashboard
    Então valida a existencia do Texto "Lista de atos administrativos"
    E Valida a existencia da Tabela
    E Valida a existencia das Colunas "Tipo, Nº SEI, Observações, Portaria do ato, Servidor indicado, Registro Funcional (RF), Status"
    E Seleciona uma das Designação de forma aleatoria
    E navega para a seção Action
    E clica e seleciona a opção "Editar"
    Então o sistema exibe a Tela "Visualizar Designação"

    E valida a existencia da seção "Unidade Proponente"
    E valida a existencia dos Titulos
      """
      DRE
      Unidade proponente
      """

    E valida a existencia da seção "Portarias de designação"
    E valida a existencia dos Titulos
      """
      Portaria da designação
      Ano Vigente
      Nº SEI
      A partir de
      Até
      Caráter Excepcional
      Motivo do afastamento:
      Pendência:
      """

    E valida a existencia da seção "Dados do servidor indicado"
    E valida a existencia dos Titulos
      """
      Nome Servidor
      Nome Social
      RF
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    E valida a existencia da seção "Dados do Servidor Titular" quando aplicável a esta designação
    E valida a existencia dos Titulos
      """
      Nome Servidor
      Nome Social
      RF
      Cargo base
      Cargo sobreposto/Função atividade
      Local de exercício
      Laudo médico
      """

    E valida a existencia dos botões de edição "Voltar" e "Avançar"
    E clica em "Avançar"
    E clica em "Salvar"
    Então o sistema direciona para a tela "Atos administrativos"
