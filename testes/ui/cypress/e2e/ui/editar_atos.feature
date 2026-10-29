# language: pt

@atos-administrativos @editar-atos @testIsolation(false)
Funcionalidade: Editar Designação, Cessação, Insubsistência e Apostila a partir de Atos Administrativos

  Como um usuário do sistema SIGNA
  Eu quero localizar uma designação, cessação, insubsistência ou apostila pela portaria e editar seus dados
  Para corrigir ou atualizar informações sem alterar o número da portaria

  Contexto:
    Dado que o usuário já está autenticado no sistema
    E está na página "Atos Administrativos"

  # ==========================================================
  # DESIGNAÇÃO
  # ==========================================================
  Regra: Edição de Designação

    # CENÁRIO 1 — Editar todos os campos editáveis da designação e conferir na reabertura da edição
    @editar-designacao @editar-campos @critico @smoke
    Cenário: Editar vários campos da designação da portaria 3546645, salvar e conferir na edição

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "3546645"

      Quando clica no menu de ações e seleciona "Editar" para a designação filtrada
      Então o sistema exibe a Tela "Editar Designação"

      Quando edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E edita o campo de data "A partir de" com uma data entre 1 e 30 dias após hoje e guarda o valor para conferência
      E edita o campo de data "Até" para um período de 16 a 30 dias contados de "A partir de" e guarda o valor para conferência
      E inverte a opção do campo "Carater Especial" e guarda o valor para conferência
      E seleciona uma opção diferente no campo "Impedimento para substituição:" e guarda o valor para conferência
      E marca a opção "Sim" no campo "Com afastamento?"
      E preenche o campo de texto "Motivo do afastamento" com um texto único e guarda o valor para conferência
      E marca a opção "Sim" no campo "Possui pendência?"
      E preenche o campo de texto "Descrição da pendência" com um texto único e guarda o valor para conferência
      E clica no botão Avançar
      Então o sistema exibe a etapa de confirmação da edição da designação

      Quando preenche o campo de texto "Informações adicionais" com um texto único e guarda o valor para conferência
      E seleciona uma opção diferente no campo "Detalhe para quadro de histórico por ano" e guarda o valor para conferência
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica no menu de ações e seleciona "Editar" para a designação filtrada
      Então o sistema exibe a Tela "Editar Designação"
      E o campo "Portaria da designação" da edição exibe o valor "3546645"
      E o campo "Nº SEI" da edição exibe o valor guardado
      E o campo "A partir de" da edição exibe o valor guardado
      E o campo "Até" da edição exibe o valor guardado
      E a opção guardada está marcada no campo "Carater Especial"
      E o campo "Impedimento para substituição:" da edição exibe a opção guardada
      E a opção "Sim" está marcada no campo "Com afastamento?"
      E o campo "Motivo do afastamento" da edição exibe o valor guardado
      E a opção "Sim" está marcada no campo "Possui pendência?"
      E o campo "Descrição da pendência" da edição exibe o valor guardado

      Quando clica no botão Avançar
      Então o sistema exibe a etapa de confirmação da edição da designação
      E o campo "Informações adicionais" da edição exibe o valor guardado
      E o campo "Detalhe para quadro de histórico por ano" da edição exibe a opção guardada

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 2 — Editar vários campos (removendo afastamento e pendência) e conferir na consulta
    @editar-designacao @editar-campos @critico
    Cenário: Editar vários campos da designação da portaria 3546645, salvar e conferir na consulta

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "3546645"

      Quando clica no menu de ações e seleciona "Editar" para a designação filtrada
      Então o sistema exibe a Tela "Editar Designação"

      Quando edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E edita o campo de data "A partir de" com uma data entre 1 e 30 dias após hoje e guarda o valor para conferência
      E edita o campo de data "Até" para um período de 16 a 30 dias contados de "A partir de" e guarda o valor para conferência
      E inverte a opção do campo "Carater Especial" e guarda o valor para conferência
      E marca a opção "Não" no campo "Com afastamento?"
      E marca a opção "Não" no campo "Possui pendência?"
      E clica no botão Avançar
      Então o sistema exibe a etapa de confirmação da edição da designação

      Quando preenche o campo de texto "Informações adicionais" com um texto único e guarda o valor para conferência
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica na designação encontrada na listagem para consultar
      Então a seção "Portarias de designação" da consulta exibe os valores editados:
        | item da consulta    | campo editado    |
        | Nº SEI              | Nº SEI           |
        | A partir de         | A partir de      |
        | Até                 | Até              |
        | Caráter Excepcional | Carater Especial |
      E a seção "Portarias de designação" da consulta exibe "-" no item "Motivo do afastamento:"
      E a seção "Portarias de designação" da consulta exibe "-" no item "Pendência:"
      E o campo "Informações adicionais" da consulta exibe o valor guardado

      Quando clica em "Voltar"
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 3 — Validar campos e textos da tela "Editar Designação"
    @editar-designacao @editar-validacao-campos
    Cenário: Validar os campos e textos da tela Editar Designação da portaria 3546645

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "3546645"

      Quando clica no menu de ações e seleciona "Editar" para a designação filtrada
      Então o sistema exibe a Tela "Editar Designação"
      E valida o título da página "Editar Designação"
      E a tela de edição exibe os textos:
        | Servidor indicado |
        | Designação        |
        | Portaria          |
        | Histórico         |

      E valida a existencia das seguintes seções:
        | Unidade Proponente         |
        | Portarias de designação    |
        | Dados do servidor indicado |

      Quando expande a seção "Unidade Proponente"
      Então a tela de edição exibe os textos:
        | DRE                          |
        | Unidade proponente           |
        | Código Estrutura Hierarquica |

      E a tela de edição exibe os textos:
        | Portaria da designação         |
        | Ano Vigente                    |
        | Nº SEI                         |
        | D.O                            |
        | A partir de                    |
        | Até                            |
        | Carater Especial               |
        | Impedimento para substituição: |
        | Com afastamento?               |
        | Possui pendência?              |
      E o campo "Portaria da designação" da edição exibe o valor "3546645"
      E o campo "Nº SEI" da edição está preenchido
      E o campo "D.O" da edição está desabilitado

      E a tela de edição exibe os textos:
        | Nome Servidor                     |
        | Nome Social                       |
        | RF                                |
        | Vínculo                           |
        | Cargo base                        |
        | Lotação                           |
        | Cursos/Títulos                    |
        | Cargo sobreposto/Função atividade |
        | Local de exercício                |
        | Laudo médico                      |

      E a tela de edição exibe os textos:
        | Selecione o tipo de cargo: |
        | Cargo Disponível           |
        | Cargo Vago                 |
      E valida a existencia da seção "Dados do Servidor Titular" quando aplicável a esta designação
      E valida a existencia dos botões de edição "Voltar" e "Avançar"

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

  # ==========================================================
  # CESSAÇÃO
  # ==========================================================
  Regra: Edição de Cessação

    # CENÁRIO 4 — Editar todos os campos editáveis da cessação e conferir na reabertura da edição
    @editar-cessacao @editar-campos @critico @smoke
    Cenário: Editar vários campos da cessação da portaria 45666, salvar e conferir na edição

      Quando clica em tipo e seleciona "Cessação"
      E preencho o filtro "Portaria de designação" com "45666"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "45666"

      Quando clica no menu de ações e seleciona "Editar" para a cessação filtrada
      Então o sistema exibe a tela de edição da cessação

      Quando expande a seção "Portaria de cessação"
      E o campo "Portaria de cessação" da edição exibe o valor "45666"
      E edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E edita o campo de data "Cessação a partir de" com uma data entre 1 e 30 dias após hoje e guarda o valor para conferência
      E inverte a opção do campo "A pedido?" e guarda o valor para conferência
      E inverte a opção do campo "Remoção?" e guarda o valor para conferência
      E inverte a opção do campo "Aposentadoria?" e guarda o valor para conferência
      E clico no botão "Trechos para o SEI"
      E valida a existencia do Texto "PORTARIA"
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Cessação"
      E preencho o filtro "Portaria de designação" com "45666"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica no menu de ações e seleciona "Editar" para a cessação filtrada
      Então o sistema exibe a tela de edição da cessação
      Quando expande a seção "Portaria de cessação"
      Então o campo "Portaria de cessação" da edição exibe o valor "45666"
      E o campo "Nº SEI" da edição exibe o valor guardado
      E o campo "Cessação a partir de" da edição exibe o valor guardado
      E a opção guardada está marcada no campo "A pedido?"
      E a opção guardada está marcada no campo "Remoção?"
      E a opção guardada está marcada no campo "Aposentadoria?"

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 5 — Editar vários campos da cessação e conferir na consulta
    @editar-cessacao @editar-campos @critico
    Cenário: Editar vários campos da cessação da portaria 45666, salvar e conferir na consulta

      Quando clica em tipo e seleciona "Cessação"
      E preencho o filtro "Portaria de designação" com "45666"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "45666"

      Quando clica no menu de ações e seleciona "Editar" para a cessação filtrada
      Então o sistema exibe a tela de edição da cessação

      Quando expande a seção "Portaria de cessação"
      E o campo "Portaria de cessação" da edição exibe o valor "45666"
      E edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E edita o campo de data "Cessação a partir de" com uma data entre 1 e 30 dias após hoje e guarda o valor para conferência
      E inverte a opção do campo "A pedido?" e guarda o valor para conferência
      E inverte a opção do campo "Remoção?" e guarda o valor para conferência
      E inverte a opção do campo "Aposentadoria?" e guarda o valor para conferência
      E clico no botão "Trechos para o SEI"
      E valida a existencia do Texto "PORTARIA"
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Cessação"
      E preencho o filtro "Portaria de designação" com "45666"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica na cessação encontrada na listagem para consultar
      Então a seção "Portarias de Cessação" da consulta exibe os valores editados:
        | item da consulta   | campo editado        |
        | Nº SEI             | Nº SEI               |
        | Cessar a partir de | Cessação a partir de |
        | A pedido           | A pedido?            |
        | Remoção            | Remoção?             |
        | Aposentadoria      | Aposentadoria?       |

      Quando clica em "Voltar"
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 6 — Validar campos e textos da tela de edição da cessação
    @editar-cessacao @editar-validacao-campos
    Cenário: Validar os campos e textos da tela de edição da cessação da portaria 45666

      Quando clica em tipo e seleciona "Cessação"
      E preencho o filtro "Portaria de designação" com "45666"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "45666"

      Quando clica no menu de ações e seleciona "Editar" para a cessação filtrada
      Então o sistema exibe a tela de edição da cessação
      E valida o título da página iniciando com "Cessação - Servidor:"
      E valida a existencia das seguintes seções:
        | Portaria de designação |
        | Servidor indicado      |
        | Servidor titular       |
        | Portaria de cessação   |

      Quando expande a seção "Portaria de designação"
      Então a seção "Portaria de designação" exibe os textos:
        | Portaria da designação         |
        | Ano Vigente                    |
        | Nº SEI                         |
        | D.O                            |
        | A partir de                    |
        | Até                            |
        | Caráter Excepcional            |
        | Impedimento para substituição: |
        | Motivo do afastamento:         |
        | Pendência:                     |

      Quando expande a seção "Servidor indicado"
      Então a seção "Servidor indicado" exibe os textos:
        | Nome Servidor                     |
        | Nome Social                       |
        | RF                                |
        | Vínculo                           |
        | Cargo base                        |
        | Categoria                         |
        | Cargo sobreposto/Função atividade |
        | Local de exercício                |
        | Laudo médico                      |

      Quando expande a seção "Servidor titular"
      Então a seção "Servidor titular" exibe os textos ou a mensagem "Não há servidor titular":
        | Nome Servidor                     |
        | Nome Social                       |
        | RF                                |
        | Vínculo                           |
        | Cargo Base                        |
        | Lotação                           |
        | Laudo Médico                      |
        | Cargo Sobreposto/Função Atividade |
        | Local de Exercício                |

      Quando expande a seção "Portaria de cessação"
      Então a seção "Portaria de cessação" exibe os textos:
        | Portaria de cessação  |
        | Nº SEI                |
        | D.O                   |
        | Ano Vigente           |
        | Cessação a partir de: |
        | A pedido?             |
        | Remoção?              |
        | Aposentadoria?        |
      E o campo "Portaria de cessação" da edição exibe o valor "45666"
      E o campo "Nº SEI" da edição está preenchido
      E o campo "D.O" da edição está desabilitado
      E valida a existencia dos botões:
        | Trechos para o SEI |

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

  # ==========================================================
  # INSUBSISTÊNCIA DE DESIGNAÇÃO
  # ==========================================================
  Regra: Edição de Insubsistência de Designação

    # CENÁRIO 7 — Editar Ano Vigente, Nº SEI e Observações da insubsistência e conferir na reabertura da edição
    @editar-insubsistencia @editar-campos @critico @smoke
    Cenário: Editar Ano Vigente, Nº SEI e Observações da insubsistência de designação da portaria 88, salvar e conferir na edição

      Quando clica em tipo e seleciona "Insubsistência de Designação"
      E preencho o filtro "Portaria de designação" com "88"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "88"

      Quando clica no menu de ações e seleciona "Editar" para a insubsistência filtrada
      Então o sistema exibe a tela de edição da insubsistência
      E o campo "Portaria de insubsistência" da edição exibe o valor "88"

      Quando seleciona um ano diferente no campo "Ano Vigente" confirmando a mudança e guarda o valor para conferência
      E edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E preenche o campo de texto "Observações" com um texto único e guarda o valor para conferência
      E clico no botão "Trechos para o SEI"
      E valida a existencia do Texto "PORTARIA"
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Insubsistência de Designação"
      E preencho o filtro "Portaria de designação" com "88"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica no menu de ações e seleciona "Editar" para a insubsistência filtrada
      Então o sistema exibe a tela de edição da insubsistência
      E o campo "Portaria de insubsistência" da edição exibe o valor "88"
      E o campo "Ano Vigente" da edição exibe a opção guardada
      E o campo "Nº SEI" da edição exibe o valor guardado
      E o campo "Observações" da edição exibe o valor guardado

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 8 — Editar Ano Vigente, Nº SEI e Observações da insubsistência e conferir na consulta
    @editar-insubsistencia @editar-campos @critico
    Cenário: Editar Ano Vigente, Nº SEI e Observações da insubsistência de designação da portaria 88, salvar e conferir na consulta

      Quando clica em tipo e seleciona "Insubsistência de Designação"
      E preencho o filtro "Portaria de designação" com "88"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "88"

      Quando clica no menu de ações e seleciona "Editar" para a insubsistência filtrada
      Então o sistema exibe a tela de edição da insubsistência
      E o campo "Portaria de insubsistência" da edição exibe o valor "88"

      Quando seleciona um ano diferente no campo "Ano Vigente" confirmando a mudança e guarda o valor para conferência
      E edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E preenche o campo de texto "Observações" com um texto único e guarda o valor para conferência
      E clico no botão "Trechos para o SEI"
      E valida a existencia do Texto "PORTARIA"
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Insubsistência de Designação"
      E preencho o filtro "Portaria de designação" com "88"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica na insubsistência encontrada na listagem para consultar
      Então a seção "Portaria de insubsistência" da consulta exibe "88" no item "Portaria de insubsistência"
      E a seção "Portaria de insubsistência" da consulta exibe os valores editados:
        | item da consulta | campo editado |
        | Ano vigente      | Ano Vigente   |
        | Nº SEI           | Nº SEI        |
        | Observações      | Observações   |

      Quando clica em "Voltar"
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 9 — Validar campos e textos da tela de edição da insubsistência
    @editar-insubsistencia @editar-validacao-campos
    Cenário: Validar os campos e textos da tela de edição da insubsistência de designação da portaria 88

      Quando clica em tipo e seleciona "Insubsistência de Designação"
      E preencho o filtro "Portaria de designação" com "88"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "88"

      Quando clica no menu de ações e seleciona "Editar" para a insubsistência filtrada
      Então o sistema exibe a tela de edição da insubsistência
      E valida o título da página iniciando com "Tornar Insubsistente - Servidor indicado -"
      E valida a existencia das seguintes seções:
        | Servidor indicado          |
        | Portaria de designação     |
        | Portarias de Cessação      |
        | Portaria de Insubsistência |
      E a tela de edição exibe os textos:
        | Selecione o tipo de insubsistência: |
      E o tipo de insubsistência "Designação" está marcado e bloqueado para edição

      Quando expande a seção "Servidor indicado"
      Então a seção "Servidor indicado" exibe os textos:
        | Nome Servidor                     |
        | Nome Social                       |
        | RF                                |
        | Vínculo                           |
        | Cargo base                        |
        | Categoria                         |
        | Lotação                           |
        | Cargo sobreposto/Função atividade |
        | Local de exercício                |
        | Laudo médico                      |

      Quando expande a seção "Portaria de designação"
      Então a seção "Portaria de designação" exibe os textos:
        | Portaria da designação |
        | Ano Vigente            |
        | Nº SEI                 |
        | D.O                    |

      Quando expande a seção "Portarias de Cessação"
      Então a seção "Portarias de Cessação" exibe os textos ou a mensagem "Não há portaria de cessão":
        | Nº Portaria de Cessação |
        | Ano da Cessação         |
        | Nº SEI                  |
        | D.O                     |

      Quando expande a seção "Portaria de Insubsistência"
      Então a seção "Portaria de Insubsistência" exibe os textos:
        | Portaria de insubsistência |
        | Ano Vigente                |
        | Nº SEI                     |
        | D.O                        |
        | Observações                |
      E o campo "Portaria de insubsistência" da edição exibe o valor "88"
      E o campo "Nº SEI" da edição está preenchido
      E o campo "D.O" da edição está desabilitado
      E valida a existencia dos botões:
        | Trechos para o SEI |

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

  # ==========================================================
  # INSUBSISTÊNCIA DE CESSAÇÃO
  # ==========================================================
  Regra: Edição de Insubsistência de Cessação

    # CENÁRIO 10 — Editar Ano Vigente, Nº SEI e Observações da insubsistência de cessação e conferir na reabertura da edição
    @editar-insubsistencia-cessacao @editar-campos @critico @smoke
    Cenário: Editar Ano Vigente, Nº SEI e Observações da insubsistência de cessação da portaria 5021588, salvar e conferir na edição

      Quando clica em tipo e seleciona "Insubsistência de Cessação"
      E preencho o filtro "Portaria de designação" com "5021588"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "5021588"

      Quando clica no menu de ações e seleciona "Editar" para a insubsistência filtrada
      Então o sistema exibe a tela de edição da insubsistência
      E o campo "Portaria de insubsistência" da edição exibe o valor "5021588"

      Quando seleciona um ano diferente no campo "Ano Vigente" confirmando a mudança e guarda o valor para conferência
      E edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E preenche o campo de texto "Observações" com um texto único e guarda o valor para conferência
      E clico no botão "Trechos para o SEI"
      E valida a existencia do Texto "PORTARIA"
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Insubsistência de Cessação"
      E preencho o filtro "Portaria de designação" com "5021588"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica no menu de ações e seleciona "Editar" para a insubsistência filtrada
      Então o sistema exibe a tela de edição da insubsistência
      E o campo "Portaria de insubsistência" da edição exibe o valor "5021588"
      E o campo "Ano Vigente" da edição exibe a opção guardada
      E o campo "Nº SEI" da edição exibe o valor guardado
      E o campo "Observações" da edição exibe o valor guardado

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 11 — Editar Ano Vigente, Nº SEI e Observações da insubsistência de cessação e conferir na consulta
    @editar-insubsistencia-cessacao @editar-campos @critico
    Cenário: Editar Ano Vigente, Nº SEI e Observações da insubsistência de cessação da portaria 5021588, salvar e conferir na consulta

      Quando clica em tipo e seleciona "Insubsistência de Cessação"
      E preencho o filtro "Portaria de designação" com "5021588"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "5021588"

      Quando clica no menu de ações e seleciona "Editar" para a insubsistência filtrada
      Então o sistema exibe a tela de edição da insubsistência
      E o campo "Portaria de insubsistência" da edição exibe o valor "5021588"

      Quando seleciona um ano diferente no campo "Ano Vigente" confirmando a mudança e guarda o valor para conferência
      E edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E preenche o campo de texto "Observações" com um texto único e guarda o valor para conferência
      E clico no botão "Trechos para o SEI"
      E valida a existencia do Texto "PORTARIA"
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Insubsistência de Cessação"
      E preencho o filtro "Portaria de designação" com "5021588"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica na insubsistência encontrada na listagem para consultar
      Então a seção "Portaria de insubsistência" da consulta exibe "5021588" no item "Portaria de insubsistência"
      E a seção "Portaria de insubsistência" da consulta exibe os valores editados:
        | item da consulta | campo editado |
        | Ano vigente      | Ano Vigente   |
        | Nº SEI           | Nº SEI        |
        | Observações      | Observações   |

      Quando clica em "Voltar"
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 12 — Validar campos e textos da tela de edição da insubsistência de cessação
    @editar-insubsistencia-cessacao @editar-validacao-campos
    Cenário: Validar os campos e textos da tela de edição da insubsistência de cessação da portaria 5021588

      Quando clica em tipo e seleciona "Insubsistência de Cessação"
      E preencho o filtro "Portaria de designação" com "5021588"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "5021588"

      Quando clica no menu de ações e seleciona "Editar" para a insubsistência filtrada
      Então o sistema exibe a tela de edição da insubsistência
      E valida o título da página iniciando com "Tornar Insubsistente - Servidor indicado -"
      E valida a existencia das seguintes seções:
        | Servidor indicado          |
        | Portaria de designação     |
        | Portarias de Cessação      |
        | Portaria de Insubsistência |
      E a tela de edição exibe os textos:
        | Selecione o tipo de insubsistência: |
      E o tipo de insubsistência "Cessação" está marcado e bloqueado para edição

      Quando expande a seção "Servidor indicado"
      Então a seção "Servidor indicado" exibe os textos:
        | Nome Servidor                     |
        | Nome Social                       |
        | RF                                |
        | Vínculo                           |
        | Cargo base                        |
        | Categoria                         |
        | Lotação                           |
        | Cargo sobreposto/Função atividade |
        | Local de exercício                |
        | Laudo médico                      |

      Quando expande a seção "Portaria de designação"
      Então a seção "Portaria de designação" exibe os textos:
        | Portaria da designação |
        | Ano Vigente            |
        | Nº SEI                 |
        | D.O                    |

      Quando expande a seção "Portarias de Cessação"
      Então a seção "Portarias de Cessação" exibe os textos:
        | Nº Portaria de Cessação |
        | Ano da Cessação         |
        | Nº SEI                  |
        | D.O                     |

      Quando expande a seção "Portaria de Insubsistência"
      Então a seção "Portaria de Insubsistência" exibe os textos:
        | Portaria de insubsistência |
        | Ano Vigente                |
        | Nº SEI                     |
        | D.O                        |
        | Observações                |
      E o campo "Portaria de insubsistência" da edição exibe o valor "5021588"
      E o campo "Nº SEI" da edição está preenchido
      E o campo "D.O" da edição está desabilitado
      E valida a existencia dos botões:
        | Trechos para o SEI |

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

  # ==========================================================
  # APOSTILA DE DESIGNAÇÃO
  # ==========================================================
  Regra: Edição de Apostila de Designação

    # CENÁRIO 13 — Editar todos os campos editáveis da apostila de designação e conferir na reabertura da edição
    @editar-apostila @editar-campos @critico @smoke
    Cenário: Editar vários campos da apostila de designação da portaria 789012333, salvar e conferir na edição

      Quando clica em tipo e seleciona "Apostila de Designação"
      E preencho o filtro "Portaria de designação" com "789012333"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "789012333"

      Quando clica no menu de ações e seleciona "Editar Apostila" para a apostila filtrada
      Então o sistema exibe a tela de edição da apostila
      E o campo "Portaria da designação" da edição exibe o valor "789012333"

      Quando seleciona um ano diferente no campo "Ano Vigente" confirmando a mudança e guarda o valor para conferência
      E edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E edita o campo de data "A partir de" com uma data entre 1 e 30 dias após hoje e guarda o valor para conferência
      E edita o campo de data "Até" para um período de 16 a 30 dias contados de "A partir de" e guarda o valor para conferência
      E inverte a opção do campo "Carater Especial" e guarda o valor para conferência
      E seleciona uma opção diferente no campo "Impedimento para substituição:" e guarda o valor para conferência
      E marca a opção "Sim" no campo "Com afastamento?"
      E preenche o campo de texto "Motivo do afastamento" com um texto único e guarda o valor para conferência
      E marca a opção "Sim" no campo "Possui pendência?"
      E preenche o campo de texto "Descrição da pendência" com um texto único e guarda o valor para conferência
      E preenche o campo de texto "Nome Social" com um texto único e guarda o valor para conferência
      E preenche o campo de texto "Informações adicionais" com um texto único e guarda o valor para conferência
      E seleciona uma opção diferente no campo "Detalhe para quadro de histórico por ano" e guarda o valor para conferência
      E clico no botão "Gerar texto SEI"
      E a tela de edição exibe os textos:
        | Texto SEI |
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Apostila de Designação"
      E preencho o filtro "Portaria de designação" com "789012333"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica no menu de ações e seleciona "Editar Apostila" para a apostila filtrada
      Então o sistema exibe a tela de edição da apostila
      E o campo "Portaria da designação" da edição exibe o valor "789012333"
      E o campo "Ano Vigente" da edição exibe a opção guardada
      E o campo "Nº SEI" da edição exibe o valor guardado
      E o campo "A partir de" da edição exibe o valor guardado
      E o campo "Até" da edição exibe o valor guardado
      E a opção guardada está marcada no campo "Carater Especial"
      E o campo "Impedimento para substituição:" da edição exibe a opção guardada
      E a opção "Sim" está marcada no campo "Com afastamento?"
      E o campo "Motivo do afastamento" da edição exibe o valor guardado
      E a opção "Sim" está marcada no campo "Possui pendência?"
      E o campo "Descrição da pendência" da edição exibe o valor guardado
      E o campo "Nome Social" da edição exibe o valor guardado
      E o campo "Informações adicionais" da edição exibe o valor guardado
      E o campo "Detalhe para quadro de histórico por ano" da edição exibe a opção guardada

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 14 — Editar todos os campos editáveis da apostila de designação e conferir na consulta
    @editar-apostila @editar-campos @critico
    Cenário: Editar vários campos da apostila de designação da portaria 789012333, salvar e conferir na consulta

      Quando clica em tipo e seleciona "Apostila de Designação"
      E preencho o filtro "Portaria de designação" com "789012333"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "789012333"

      Quando clica no menu de ações e seleciona "Editar Apostila" para a apostila filtrada
      Então o sistema exibe a tela de edição da apostila
      E o campo "Portaria da designação" da edição exibe o valor "789012333"

      Quando seleciona um ano diferente no campo "Ano Vigente" confirmando a mudança e guarda o valor para conferência
      E edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E edita o campo de data "A partir de" com uma data entre 1 e 30 dias após hoje e guarda o valor para conferência
      E edita o campo de data "Até" para um período de 16 a 30 dias contados de "A partir de" e guarda o valor para conferência
      E inverte a opção do campo "Carater Especial" e guarda o valor para conferência
      E seleciona uma opção diferente no campo "Impedimento para substituição:" e guarda o valor para conferência
      E marca a opção "Sim" no campo "Com afastamento?"
      E preenche o campo de texto "Motivo do afastamento" com um texto único e guarda o valor para conferência
      E marca a opção "Sim" no campo "Possui pendência?"
      E preenche o campo de texto "Descrição da pendência" com um texto único e guarda o valor para conferência
      E preenche o campo de texto "Nome Social" com um texto único e guarda o valor para conferência
      E preenche o campo de texto "Informações adicionais" com um texto único e guarda o valor para conferência
      E seleciona uma opção diferente no campo "Detalhe para quadro de histórico por ano" e guarda o valor para conferência
      E clico no botão "Gerar texto SEI"
      E a tela de edição exibe os textos:
        | Texto SEI |
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Apostila de Designação"
      E preencho o filtro "Portaria de designação" com "789012333"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica na apostila encontrada na listagem para consultar
      Então a seção "Dados da apostila" da consulta exibe "789012333" no item "Portaria da apostila"
      E a seção "Dados da apostila" da consulta exibe os valores editados:
        | item da consulta | campo editado |
        | Nº SEI           | Nº SEI        |
      E a seção "Portarias de designação" da consulta exibe os valores editados:
        | item da consulta               | campo editado                  |
        | Ano Vigente                    | Ano Vigente                    |
        | Nº SEI                         | Nº SEI                         |
        | A partir de                    | A partir de                    |
        | Até                            | Até                            |
        | Caráter Excepcional            | Carater Especial               |
        | Impedimento para substituição: | Impedimento para substituição: |
        | Motivo do afastamento:         | Motivo do afastamento          |
        | Pendência:                     | Descrição da pendência         |
      E a seção "Dados do servidor indicado" da consulta exibe os valores editados:
        | item da consulta | campo editado |
        | Nome Social      | Nome Social   |

      Quando clica em "Voltar"
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 15 — Validar campos e textos da tela de edição da apostila de designação
    @editar-apostila @editar-validacao-campos
    Cenário: Validar os campos e textos da tela de edição da apostila de designação da portaria 789012333

      Quando clica em tipo e seleciona "Apostila de Designação"
      E preencho o filtro "Portaria de designação" com "789012333"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "789012333"

      Quando clica no menu de ações e seleciona "Editar Apostila" para a apostila filtrada
      Então o sistema exibe a tela de edição da apostila
      E valida o título da página "Apostila de designação"
      E valida a existencia das seguintes seções:
        | Dados da apostila       |
        | Portarias de designação |
        | Unidade Proponente      |
        | Servidor Indicado       |

      Quando expande a seção "Dados da apostila"
      Então a seção "Dados da apostila" exibe os textos:
        | Nº Portaria |
        | Nº SEI      |
        | D.O         |
      E o campo "Nº Portaria" da edição exibe o valor "789012333"
      E o campo "Nº Portaria" da edição está desabilitado
      E o campo "D.O" da edição está desabilitado

      Quando expande a seção "Portarias de designação"
      Então a seção "Portarias de designação" exibe os textos:
        | Portaria da designação         |
        | Ano Vigente                    |
        | Nº SEI                         |
        | D.O                            |
        | A partir de                    |
        | Até                            |
        | Carater Especial               |
        | Impedimento para substituição: |
        | Com afastamento?               |
        | Possui pendência?              |
      E o campo "Portaria da designação" da edição exibe o valor "789012333"
      E o campo "Nº SEI" da edição está preenchido

      Quando expande a seção "Unidade Proponente"
      Então a seção "Unidade Proponente" exibe os textos:
        | DRE                          |
        | Unidade proponente           |
        | Código Estrutura Hierárquica |
      E o campo "Código Estrutura Hierárquica" da edição está preenchido
      E o campo "Código Estrutura Hierárquica" da edição está desabilitado

      Quando expande a seção "Servidor Indicado"
      Então a seção "Servidor Indicado" exibe os textos:
        | Nome servidor                     |
        | Nome Social                       |
        | RF                                |
        | Vínculo                           |
        | Cargo base                        |
        | Lotação                           |
        | Cursos/Títulos                    |
        | Cargo sobreposto/Função atividade |
        | Local de exercício                |
        | Laudo médico                      |
      E o campo "Nome servidor" da edição está preenchido

      E a tela de edição exibe os textos:
        | Informações adicionais                   |
        | Detalhe para quadro de histórico por ano |
      E valida a existencia dos botões:
        | Gerar texto SEI |

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
      Então o sistema direciona para a tela "Atos administrativos"
