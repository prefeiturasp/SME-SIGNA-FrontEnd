#language: pt
@api @dre @diretoria_regional
Funcionalidade: API EOL - DiretoriaRegionalEducacao
  Como sistema integrado SME
  Quero validar os endpoints de busca de DRE por código
  Para garantir que os dados de cada Diretoria Regional de Educação são retornados corretamente

  # ============================================================================
  # BASE URL: https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br
  # AUTH: x-api-eol-key (header)
  #
  # Endpoints cobertos:
  #   GET /api/DREs (listagem)
  #   GET /api/DREs/{codigoEolDRE} (individual)
  #
  # Códigos reais em HOM:
  #   108100 - BUTANTA
  #   108200 - CAMPO LIMPO
  #   108300 - CAPELA DO SOCORRO
  #   108400 - FREGUESIA/BRASILANDIA
  #   108500 - GUAIANASES
  #   108600 - IPIRANGA
  #   108700 - ITAQUERA
  #   108800 - JACANA/TREMEMBE
  #   108900 - PENHA
  #   109000 - PIRITUBA/JARAGUA
  #   109100 - SANTO AMARO
  #   109200 - SAO MATEUS
  #   109300 - SAO MIGUEL
  # ============================================================================

  Contexto:
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API

  # ══════════════════════════════════════════════════════════════════════════
  # TESTES POSITIVOS — LISTAGEM E ESTRUTURA
  # ══════════════════════════════════════════════════════════════════════════

  @smoke @listagem_dres
  Cenário: Listar todas as DREs disponíveis
    Quando eu faço uma requisição GET para "/api/DREs"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a lista não deve estar vazia
    E a lista deve conter pelo menos 13 DREs

  @validacao @estrutura_dre_listagem
  Cenário: Validar estrutura de cada DRE na listagem
    Quando eu faço uma requisição GET para "/api/DREs"
    Então o status code da resposta deve ser 200
    E cada DRE deve ter os campos obrigatórios:
      | campo     |
      | codigoDRE |
      | nomeDRE   |
      | siglaDRE  |

  @validacao @tipos_dados_dre
  Cenário: Validar tipos dos campos da DRE na listagem
    Quando eu faço uma requisição GET para "/api/DREs"
    Então o status code da resposta deve ser 200
    E os tipos dos campos da DRE devem estar corretos

  # ══════════════════════════════════════════════════════════════════════════
  # TESTES COM CÓDIGOS CONHECIDOS
  # ══════════════════════════════════════════════════════════════════════════

  @smoke @codigo_conhecido_butanta
  Cenário: Buscar DRE BUTANTA pelo código 108100
    Quando eu faço uma requisição GET para "/api/DREs/108100"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a DRE deve ter código "108100" e nome contendo "BUTANTA"

  @smoke @codigo_conhecido_campo_limpo
  Cenário: Buscar DRE CAMPO LIMPO pelo código 108200
    Quando eu faço uma requisição GET para "/api/DREs/108200"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a DRE deve ter código "108200" e nome contendo "CAMPO LIMPO"

  @smoke @codigo_conhecido_ipiranga
  Cenário: Buscar DRE IPIRANGA pelo código 108600
    Quando eu faço uma requisição GET para "/api/DREs/108600"
    Então o status code da resposta deve ser 200
      E a resposta deve ser um array
    E a DRE deve ter código "108600" e nome contendo "IPIRANGA"

  @validacao @campos_dre_individual
  Cenário: Validar campos obrigatórios da DRE por código específico
    Quando eu faço uma requisição GET para "/api/DREs/108500"
    Então o status code da resposta deve ser 200
    E a DRE individual deve ter os campos obrigatórios:
      | campo     |
      | codigoDRE |
      | nomeDRE   |
      | siglaDRE  |

  @validacao @tipos_dados_dre_individual
  Cenário: Validar tipos dos campos da DRE individual
    Quando eu faço uma requisição GET para "/api/DREs/109100"
    Então o status code da resposta deve ser 200
    E os tipos dos campos da DRE individual devem estar corretos

  @validacao @dre_dinamica
  Cenário: Buscar DRE obtida dinamicamente da listagem
    Quando eu obtenho um código de DRE válido da listagem
    E eu busco a DRE por esse código
    Então o status code da resposta deve ser 200
      E a resposta deve ser um array

  # ══════════════════════════════════════════════════════════════════════════
  # TESTES NEGATIVOS — CÓDIGOS INVÁLIDOS
  # ══════════════════════════════════════════════════════════════════════════

  @negativo @codigo_inexistente
  Cenário: Buscar DRE com código numérico inexistente
    Quando eu faço uma requisição GET para "/api/DREs/000000"
      Então o status code da resposta deve ser 200

  @negativo @codigo_vazio
  Cenário: Buscar DRE com código vazio
    Quando eu faço uma requisição GET para "/api/DREs/ "
      Então o status code da resposta deve ser 200

  @negativo @codigo_invalido_formato
  Cenário: Buscar DRE com código em formato inválido
    Quando eu faço uma requisição GET para "/api/DREs/ABC123DEF"
      Então o status code da resposta deve ser 200

  # ══════════════════════════════════════════════════════════════════════════
  # TESTES NEGATIVOS — AUTENTICAÇÃO
  # ══════════════════════════════════════════════════════════════════════════

  @negativo @sem_autenticacao_listagem
  Cenário: Acessar listagem de DREs sem autenticação
    Dado que não estou autenticado
    Quando eu tento acessar "/api/DREs" sem token
    Então o status da resposta deve ser 401 ou 403

  @negativo @sem_autenticacao_individual
  Cenário: Acessar DRE por código sem autenticação
    Dado que não estou autenticado
    Quando eu tento acessar "/api/DREs/108100" sem token
    Então o status da resposta deve ser 401 ou 403

  # ══════════════════════════════════════════════════════════════════════════
  # TESTES DE PERFORMANCE
  # ══════════════════════════════════════════════════════════════════════════

  @performance @listagem_performance
  Cenário: Validar tempo de resposta da listagem de DREs
    Quando eu faço uma requisição GET para "/api/DREs"
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 5000 milissegundos

  @performance @individual_performance
  Cenário: Validar tempo de resposta da busca individual de DRE
    Quando eu faço uma requisição GET para "/api/DREs/108100"
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 3000 milissegundos

  # ══════════════════════════════════════════════════════════════════════════
  # TESTES POSITIVOS — POST (FILTRO DE DREs)
  # ══════════════════════════════════════════════════════════════════════════
  # Endpoint: POST /api/DREs
  # Body: array de strings com codigosDRE
  # Resposta: array de DREs filtradas
  # ══════════════════════════════════════════════════════════════════════════

  @smoke @post_dre_um_codigo
  Cenário: Filtrar uma DRE pelo código via POST
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 109200  |
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a resposta deve conter 1 item

  @smoke @post_dre_multiplos_codigos
  Cenário: Filtrar múltiplas DREs pelos códigos via POST
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 108100  |
      | 108200  |
      | 108600  |
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a resposta deve conter 3 itens

  @validacao @post_estrutura_resposta
  Cenário: Validar estrutura dos campos na resposta POST
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 108500  |
    Então o status code da resposta deve ser 200
    E cada DRE na resposta POST deve ter os campos obrigatórios:
      | campo     |
      | codigoDRE |
      | nomeDRE   |
      | siglaDRE  |

  @validacao @post_tipos_dados
  Cenário: Validar tipos dos campos na resposta POST
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 108300  |
      | 108700  |
    Então o status code da resposta deve ser 200
    E os tipos dos campos na resposta POST devem estar corretos

  @validacao @post_codigo_conhecido_sao_mateus
  Cenário: Filtrar e validar DRE SÃO MATEUS (109200) via POST
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 109200  |
    Então o status code da resposta deve ser 200
    E a resposta deve conter a DRE com código "109200" e nome "DIRETORIA REGIONAL DE EDUCACAO SAO MATEUS"

  @validacao @post_correspondencia_codigos
    Cenário: Validar que os códigos retornados correspondem aos enviados
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 108400  |
      | 108900  |
      | 109100  |
    Então o status code da resposta deve ser 200
    E os códigos retornados devem corresponder exatamente aos enviados

  # Cenário de validação de ordem removido: a API não garante a ordem de retorno

  # ══════════════════════════════════════════════════════════════════════════
  # TESTES NEGATIVOS — POST (FILTRO DE DREs)
  # ══════════════════════════════════════════════════════════════════════════

  @negativo @post_codigo_inexistente
  Cenário: Filtrar DRE com código inexistente via POST
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 000000  |
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array vazio

  @negativo @post_array_vazio
  Cenário: Enviar POST com array vazio de códigos
    Quando eu envio uma requisição POST para "/api/DREs" com um array vazio
    Então o status da resposta deve ser 200 ou 400

  @negativo @post_codigo_invalido_formato
  Cenário: Filtrar DRE com código em formato inválido via POST
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo      |
      | ABC123DEF   |
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array vazio

  @negativo @post_sem_autenticacao
  Cenário: Enviar POST sem autenticação
    Dado que não estou autenticado
    Quando eu envio uma requisição POST para "/api/DREs" sem token com os códigos:
      | codigo  |
      | 108100  |
    Então o status da resposta deve ser 401 ou 403

  @negativo @post_mix_valido_invalido
  Cenário: POST com mix de códigos válidos e inválidos
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 108100  |
      | 000000  |
      | 108200  |
    Então o status code da resposta deve ser 200
    E a resposta deve conter apenas os DREs com códigos válidos

  # ══════════════════════════════════════════════════════════════════════════
  # TESTES DE PERFORMANCE — POST
  # ══════════════════════════════════════════════════════════════════════════

  @performance @post_performance_um_codigo
  Cenário: Validar tempo de resposta POST para um código
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 108100  |
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 3000 milissegundos

  @performance @post_performance_multiplos_codigos
  Cenário: Validar tempo de resposta POST para múltiplos códigos
    Quando eu envio uma requisição POST para "/api/DREs" com os códigos:
      | codigo  |
      | 108100  |
      | 108200  |
      | 108300  |
      | 108400  |
      | 108500  |
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 5000 milissegundos
