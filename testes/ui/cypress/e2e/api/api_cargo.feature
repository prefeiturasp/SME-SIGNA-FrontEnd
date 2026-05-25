#language: pt
@api @cargo
Funcionalidade: API EOL - Cargos
  Como sistema integrado SME
  Quero validar o endpoint de listagem de cargos
  Para garantir que os dados de cargos estão acessíveis e íntegros

  # ============================================================================
  # BASE URL: https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br
  # AUTH: x-api-eol-key (header)
  #
  # Endpoints cobertos:
  #   GET /api/cargos
  # ============================================================================

  Contexto:
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API

  # GET /api/cargos — smoke
  @smoke @listagem_cargos
  Cenário: Listar todos os cargos
    Quando eu faço uma requisição GET para "/api/cargos"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array
    E a lista não deve estar vazia

  # GET /api/cargos — validação de estrutura
  @validacao @estrutura @cargo
  Cenário: Validar campos obrigatórios de cada cargo
    Quando eu faço uma requisição GET para "/api/cargos"
    Então o status code da resposta deve ser 200
    E cada cargo deve ter os campos obrigatórios:
      | campo       |
      | codigoCargo |
      | nomeCargo   |

  # GET /api/cargos — validação de tipos de dados
  @validacao @tipos_campos
  Cenário: Validar tipos dos campos retornados para cada cargo
    Quando eu faço uma requisição GET para "/api/cargos"
    Então o status code da resposta deve ser 200
    E os tipos dos campos do cargo devem estar corretos

  # GET /api/cargos — validação de cargo específico conhecido
  @validacao @cargo_existente
  Cenário: Confirmar presença de cargo conhecido na listagem
    Quando eu faço uma requisição GET para "/api/cargos"
    Então o status code da resposta deve ser 200
    E o cargo com código 3085 deve estar na lista com nome "ASSISTENTE DE DIRETOR DE ESCOLA"

  # GET /api/cargos — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Acessar cargos sem autenticação
    Dado que não estou autenticado
    Quando eu tento acessar "/api/cargos" sem token
    Então o status da resposta deve ser 401 ou 403

  # PERFORMANCE
  @performance
  Cenário: Validar tempo de resposta da listagem de cargos
    Quando eu faço uma requisição GET para "/api/cargos"
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 5000 milissegundos
