# language: pt
@api @designacao @atos_administrativos
Funcionalidade: API SIGNA - Atos administrativos (visão consolidada)
  Como um sistema de automação de testes
  Quero validar o endpoint de listagem consolidada de atos administrativos
  Para garantir que designações, cessações, apostilas e insubsistências aparecem corretamente

  # ============================================================================
  # BASE URL: https://qa-signa.sme.prefeitura.sp.gov.br/api
  # AUTH: JWT via POST /usuario/login (Authorization: Bearer <token>)
  #
  # Endpoint coberto (somente leitura — sem POST/DELETE no Swagger):
  #   GET /api/designacao/atos-administrativos/
  # ============================================================================

  Contexto:
    Dado que estou autenticado na API do SIGNA

  # GET /atos-administrativos/ — smoke
  @smoke @listagem_atos
  Cenário: Listar atos administrativos
    Quando eu listo os atos administrativos
    Então o status code da resposta do SIGNA deve ser 200
    E a listagem de atos administrativos deve estar paginada com resultados em formato de array

  # GET /atos-administrativos/ — estrutura
  @validacao @estrutura
  Cenário: Validar campos obrigatórios de cada ato administrativo
    Quando eu listo os atos administrativos
    Então o status code da resposta do SIGNA deve ser 200
    E cada ato administrativo deve ter os campos obrigatórios:
      | campo           |
      | id              |
      | tipo_de_ato      |
      | numero_portaria  |
      | ano_vigente      |
      | status_publicacao |

  # GET /atos-administrativos/ — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Listar atos administrativos sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu listo os atos administrativos sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403
