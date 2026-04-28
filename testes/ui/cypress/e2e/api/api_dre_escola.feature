#language: pt
@api @dre_escola
Funcionalidade: API EOL - DRE e Escola
  Como sistema integrado SME
  Quero validar os endpoints de DRE e Escola
  Para garantir que os dados de estrutura institucional estão acessíveis e corretos

  # ============================================================================
  # BASE URL: https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br
  # AUTH: x-api-eol-key (header)
  #
  # Endpoints cobertos:
  #   GET /api/DREs
  #   GET /api/DREs/{codigoEolDRE}
  #   GET /api/escolas/tipos_unidade_educacao
  #   GET /api/escolas/modalidades_ensino
  #   GET /api/escolas/tiposEscolas
  # ============================================================================

  Contexto:
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API

  # GET /api/DREs
  @smoke @listagem_dre
  Cenário: Listar todas as DREs
    Quando eu faço uma requisição GET para "/api/DREs"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a lista não deve estar vazia

  # GET /api/DREs
  @validacao @estrutura @dre
  Cenário: Validar campos obrigatórios de cada DRE
    Quando eu faço uma requisição GET para "/api/DREs"
    Então o status code da resposta deve ser 200
    E cada DRE deve ter os campos obrigatórios:
      | campo     |
      | codigoDRE |
      | nomeDRE   |
      | siglaDRE  |

  # GET /api/escolas/tipos_unidade_educacao
  @smoke @tipos_ue
  Cenário: Listar tipos de unidade educacional
    Quando eu faço uma requisição GET para "/api/escolas/tipos_unidade_educacao"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a lista não deve estar vazia

  # GET /api/escolas/modalidades_ensino
  @smoke @modalidades
  Cenário: Listar modalidades de ensino
    Quando eu faço uma requisição GET para "/api/escolas/modalidades_ensino"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a lista não deve estar vazia

  # GET /api/escolas/tiposEscolas
  @smoke @tipos_escola
  Cenário: Listar tipos de escola
    Quando eu faço uma requisição GET para "/api/escolas/tiposEscolas"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a lista não deve estar vazia

  # GET /api/DREs — NEGATIVO sem auth
  @negativo @sem_autenticacao
  Cenário: Acessar DREs sem autenticação
    Dado que não estou autenticado
    Quando eu tento acessar "/api/DREs" sem token
    Então o status da resposta deve ser 401 ou 403

  # PERFORMANCE
  @performance
  Cenário: Validar tempo de resposta da listagem de DREs
    Quando eu faço uma requisição GET para "/api/DREs"
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 5000 milissegundos
