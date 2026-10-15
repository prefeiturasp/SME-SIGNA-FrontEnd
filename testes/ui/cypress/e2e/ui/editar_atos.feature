# language: pt

@atos-administrativos @editar-atos @testIsolation(false)
Funcionalidade: Editar Designação e Cessação a partir de Atos Administrativos

  Como um usuário do sistema SIGNA
  Eu quero localizar uma designação ou cessação pela portaria e editar seus dados
  Para corrigir ou atualizar informações sem alterar o número da portaria

  Contexto:
    Dado que o usuário já está autenticado no sistema
    E está na página "Atos Administrativos"

  # ==========================================================
  # DESIGNAÇÃO
  # ==========================================================
  Regra: Edição de Designação

    # CENÁRIO 1 — Editar designação localizada pela portaria 3546645
    @editar-designacao @critico @smoke
    Cenário: Editar a designação da portaria 3546645 e confirmar a alteração do Nº SEI

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "3546645"

      Quando clica no menu de ações e seleciona "Editar" para a designação filtrada
      Então o sistema exibe a Tela "Editar Designação"

      Quando edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E clica no botão Avançar
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica na designação encontrada na listagem para consultar
      Então os dados exibidos confirmam a alteração do "Nº SEI"

      Quando clica em "Voltar"
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 2 — Editar alguns campos da designação e salvar
    @editar-designacao @editar-campos @critico
    Cenário: Editar Nº SEI, afastamento e pendência da portaria 3546645 e salvar

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então o sistema exibe registros compatíveis com o filtro "Portaria de designação"
      E a tabela apresenta resultado para "3546645"

      Quando clica no menu de ações e seleciona "Editar" para a designação filtrada
      Então o sistema exibe a Tela "Editar Designação"

      Quando edita o campo "Nº SEI" com um novo número e guarda o valor para conferência
      E marca a opção "Sim" no campo "Com afastamento?"
      E preenche o campo de texto "Motivo do afastamento" com um texto único e guarda o valor para conferência
      E marca a opção "Sim" no campo "Possui pendência?"
      E preenche o campo de texto "Descrição da pendência" com um texto único e guarda o valor para conferência
      E clica no botão Avançar
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando preencho o filtro "Portaria de designação" com "3546645"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica no menu de ações e seleciona "Editar" para a designação filtrada
      Então o sistema exibe a Tela "Editar Designação"
      E o campo "Portaria da designação" da edição exibe o valor "3546645"
      E o campo "Nº SEI" da edição exibe o valor guardado
      E a opção "Sim" está marcada no campo "Com afastamento?"
      E o campo "Motivo do afastamento" da edição exibe o valor guardado
      E a opção "Sim" está marcada no campo "Possui pendência?"
      E o campo "Descrição da pendência" da edição exibe o valor guardado

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
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

    # CENÁRIO 4 — Editar cessação localizada pela portaria 45666
    @editar-cessacao @critico @smoke
    Cenário: Editar a cessação da portaria 45666 e confirmar a alteração do Nº SEI

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
      E clico no botão "Trechos para o SEI"
      E valida a existencia do Texto "PORTARIA"
      E clica em "Salvar"
      Então o sistema direciona para a tela "Atos administrativos"

      Quando clica em tipo e seleciona "Cessação"
      E preencho o filtro "Portaria de designação" com "45666"
      E clico no botão "Pesquisar"
      Então a tabela apresenta o novo valor do "Nº SEI" editado

      Quando clica na cessação encontrada na listagem para consultar
      Então os dados exibidos confirmam a alteração do "Nº SEI"

      Quando clica em "Voltar"
      Então o sistema direciona para a tela "Atos administrativos"

    # CENÁRIO 5 — Editar alguns campos da cessação e salvar
    @editar-cessacao @editar-campos @critico
    Cenário: Editar Nº SEI, A pedido e Remoção da cessação da portaria 45666 e salvar

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
      E inverte a opção do campo "A pedido?" e guarda o valor para conferência
      E inverte a opção do campo "Remoção?" e guarda o valor para conferência
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
      E a opção guardada está marcada no campo "A pedido?"
      E a opção guardada está marcada no campo "Remoção?"

      Quando o sistema navega até o menu lateral esquerdo
      E seleciona a opção "Início" no menu lateral
      E seleciona a opção "Atos administrativos" no menu lateral
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
