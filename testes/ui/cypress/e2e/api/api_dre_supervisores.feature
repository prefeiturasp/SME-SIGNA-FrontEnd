#language: pt
@api @dre_supervisores
Funcionalidade: Testes da API de Supervisores por DRE
  Como um testador
  Quero validar o endpoint GET /api/DREs/{codigoEolDRE}/supervisores
  Para garantir que os supervisores de cada DRE são retornados corretamente

  @smoke @listagem_supervisores
  Cenário: Listar supervisores de uma DRE conhecida
    Quando eu busco supervisores da DRE com código "108100"
    Então a resposta deve retornar status 200
    E a resposta deve ser um array não vazio de supervisores
    E cada supervisor deve ter os campos obrigatórios:
      | campo |
      | codigoRF |
      | nomeServidor |

  @validacao @tipos_campos_supervisores
  Cenário: Validar tipos dos campos dos supervisores
    Quando eu busco supervisores da DRE com código "108100"
    Então a resposta deve retornar status 200
    E os tipos dos campos dos supervisores devem estar corretos

  @validacao @supervisor_especifico
  Cenário: Validar supervisor específico na listagem
    Quando eu busco supervisores da DRE com código "108100"
    Então a resposta deve conter um supervisor com RF "7205066" e nome "ALESSANDRA PEROSSI BRITO"

  @validacao @quantidade_minima_supervisores
  Cenário: Validar quantidade mínima de supervisores
    Quando eu busco supervisores da DRE com código "108100"
    Então a resposta deve conter pelo menos 20 supervisores

  @validacao @supervisor_dre_campo_limpo
  Cenário: Validar supervisor de outra DRE (Campo Limpo)
    Quando eu busco supervisores da DRE com código "108200"
    Então a resposta deve retornar status 200
    E a resposta deve ser um array não vazio de supervisores

  @validacao @dinamico_obter_dre_supervisores
  Cenário: Obter DRE dinamicamente e buscar seus supervisores
    Quando eu obtenho um código de DRE válido da listagem
    E eu busco supervisores dessa DRE
    Então a resposta deve retornar status 200
    E a resposta deve ser um array não vazio de supervisores
    E cada supervisor deve ter os campos obrigatórios:
      | campo |
      | codigoRF |
      | nomeServidor |

  @negativo @codigo_inexistente
  Cenário: Buscar supervisores com código inválido
    Quando eu busco supervisores da DRE com código "000000"
      Então a resposta deve retornar status 200

  @negativo @codigo_formato_invalido
  Cenário: Buscar supervisores com código em formato inválido
    Quando eu busco supervisores da DRE com código "ABC123DEF"
      Então a resposta deve retornar status 200

  @negativo @supervisores_sem_autenticacao
  Cenário: Buscar supervisores sem token de autenticação
    Quando eu busco supervisores da DRE com código "108100" sem token
    Então a resposta deve retornar status 401 ou 403

  @performance @supervisores_performance
  Cenário: Validar performance ao buscar supervisores
    Quando eu busco supervisores da DRE com código "108100"
    Então a resposta deve retornar status 200
    E o tempo de resposta deve ser menor que 5000 milissegundos

  @validacao @codigos_rf_unicos
  Cenário: Validar que códigos RF são únicos na listagem
    Quando eu busco supervisores da DRE com código "108100"
    Então todos os códigos RF devem ser únicos

  @validacao @nomes_nao_vazios
  Cenário: Validar que nomes de servidores não estão vazios
    Quando eu busco supervisores da DRE com código "108100"
    Então nenhum nome de servidor deve estar vazio ou em branco

  @smoke @listagem_supervisores_aleatoria
  Cenário: Listar supervisores de uma DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco supervisores dessa DRE aleatória
    Então a resposta deve retornar status 200
    E a resposta deve ser um array não vazio de supervisores
    E cada supervisor deve ter os campos obrigatórios:
      | campo |
      | codigoRF |
      | nomeServidor |

  @validacao @tipos_campos_supervisores_aleatorio
  Cenário: Validar tipos de campos com DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco supervisores dessa DRE aleatória
    Então a resposta deve retornar status 200
    E os tipos dos campos dos supervisores devem estar corretos

  @validacao @supervisores_multiplas_dres_aleatorio
  Cenário: Validar supervisores em múltiplas DREs aleatórias (3 iterações)
    Quando eu executo 3 iterações buscando supervisores de DREs aleatórias
    Então todas as 3 requisições devem retornar status 200
    E todas as 3 requisições devem retornar arrays não vazios

  @performance @supervisores_performance_aleatorio
  Cenário: Validar performance com DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco supervisores dessa DRE aleatória
    Então a resposta deve retornar status 200
    E o tempo de resposta deve ser menor que 5000 milissegundos

  @validacao @codigos_rf_unicos_aleatorio
  Cenário: Validar unicidade de códigos RF em DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco supervisores dessa DRE aleatória
    Então todos os códigos RF devem ser únicos

  @validacao @nomes_nao_vazios_aleatorio
  Cenário: Validar nomes não vazios em DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco supervisores dessa DRE aleatória
    Então nenhum nome de servidor deve estar vazio ou em branco
