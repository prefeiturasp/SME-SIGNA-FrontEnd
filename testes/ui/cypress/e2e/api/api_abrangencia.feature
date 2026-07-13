#language: pt
@api @abrangencia
Funcionalidade: API EOL - Abrangencia
  Como sistema integrado SME
  Quero validar os endpoints de abrangência institucional
  Para garantir que os dados de estrutura hierárquica estão acessíveis

  # ============================================================================
  # BASE URL: https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br
  # AUTH: x-api-eol-key (header)
  #
  # Endpoints cobertos:
  #   GET /api/abrangencia/codigos-dres
  #   GET /api/abrangencia/nome-abreviacao-dres
  #   GET /api/abrangencia/estrutura-historica
  # ============================================================================

  Contexto:
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API

  # GET /api/abrangencia/codigos-dres
  @smoke @codigos_dres
  Cenário: Obter códigos de todas as DREs
    Quando eu faço uma requisição GET para "/api/abrangencia/codigos-dres"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a lista não deve estar vazia

  # GET /api/abrangencia/nome-abreviacao-dres
  @smoke @nome_abreviacao_dres
  Cenário: Obter nome e abreviação das DREs
    Quando eu faço uma requisição GET para "/api/abrangencia/nome-abreviacao-dres"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a lista não deve estar vazia

  # GET /api/abrangencia/nome-abreviacao-dres
  @validacao @estrutura
  Cenário: Validar estrutura de nome e abreviação das DREs
    Quando eu faço uma requisição GET para "/api/abrangencia/nome-abreviacao-dres"
    Então o status code da resposta deve ser 200
    E cada item da abrangência deve ter os campos:
      | campo      |
      | codigo     |
      | abreviacao |
      | nome       |

  # GET /api/abrangencia/estrutura-historica
  @estrutura_historica
  Cenário: Obter estrutura histórica da abrangência
    Quando eu faço uma requisição GET para "/api/abrangencia/estrutura-historica"
    Então o status da resposta deve ser 200 ou 400

  # GET /api/abrangencia/codigos-dres — NEGATIVO sem auth
  @negativo @sem_autenticacao
  Cenário: Acessar abrangência sem autenticação
    Dado que não estou autenticado
    Quando eu tento acessar "/api/abrangencia/codigos-dres" sem token
    Então o status da resposta deve ser 401 ou 403

  # PERFORMANCE
  @performance
  Cenário: Validar tempo de resposta da abrangência
    Quando eu faço uma requisição GET para "/api/abrangencia/codigos-dres"
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 5000 milissegundos
