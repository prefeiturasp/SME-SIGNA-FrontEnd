# language: pt
@api @designacao @unidade
Funcionalidade: API SIGNA - Unidade
  Como um sistema de automação de testes
  Quero validar os endpoints de dados de unidade do backend SIGNA
  Para garantir que os dados usados no passo 1 da designação estão corretos

  # ============================================================================
  # BASE URL: https://qa-signa.sme.prefeitura.sp.gov.br/api
  # AUTH: JWT via POST /usuario/login (Authorization: Bearer <token>)
  #
  # Endpoints cobertos:
  #   GET /api/designacao/unidade/?codigo_ue=<codigo>
  #   GET /api/designacao/unidade/cargos/
  # ============================================================================

  Contexto:
    Dado que estou autenticado na API do SIGNA

  # GET /unidade/?codigo_ue= — smoke
  @smoke @dados_unidade
  Cenário: Buscar dados de uma unidade por código UE conhecido
    Quando eu busco os dados da unidade pelo código UE conhecido
    Então o status code da resposta do SIGNA deve ser 200
    E a resposta da unidade deve conter a lista de cargos

  # GET /unidade/?codigo_ue= — NEGATIVO código inexistente
  @negativo @dados_unidade
  Cenário: Buscar dados de unidade com código UE inexistente
    Quando eu busco os dados da unidade pelo código UE "000000"
    Então o status da resposta do SIGNA deve ser 404 ou 400

  # GET /unidade/?codigo_ue= — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Buscar dados de unidade sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu busco os dados da unidade pelo código UE conhecido sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403

  # GET /unidade/cargos/ — smoke
  @smoke @cargos_unidade
  Cenário: Listar cargos possíveis de unidade
    Quando eu listo os cargos de unidade
    Então o status code da resposta do SIGNA deve ser 200
    E a resposta do SIGNA deve ser um array
