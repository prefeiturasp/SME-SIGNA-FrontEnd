# language: pt
@api @designacao @insubsistencias
Funcionalidade: API SIGNA - Insubsistências
  Como um sistema de automação de testes
  Quero validar os endpoints de insubsistência do backend SIGNA
  Para garantir que a criação, consulta e exclusão funcionam corretamente

  # ============================================================================
  # BASE URL: https://qa-signa.sme.prefeitura.sp.gov.br/api
  # AUTH: JWT via POST /usuario/login (Authorization: Bearer <token>)
  #
  # Endpoints cobertos:
  #   GET    /api/designacao/insubsistencias/
  #   POST   /api/designacao/insubsistencias/
  #   GET    /api/designacao/insubsistencias/{id}/
  #   DELETE /api/designacao/insubsistencias/{id}/
  #   GET    /api/designacao/insubsistencias/buscar-por-portaria/
  #
  # Toda insubsistência criada (POST) depende de uma designação já existente
  # (campo "ato_pai" — confirmado em src/types/insubsistencia.ts,
  # InsubsistenciaBody). Diferente da apostila, confirmado manualmente contra
  # QA que é possível tornar insubsistente uma designação mesmo já cessada.
  # ============================================================================

  Contexto:
    Dado que estou autenticado na API do SIGNA

  # GET /insubsistencias/ — smoke
  @smoke @listagem_insubsistencias
  Cenário: Listar insubsistências
    Quando eu listo as insubsistências
    Então o status code da resposta do SIGNA deve ser 200
    E a listagem de insubsistências deve estar paginada com resultados em formato de array

  # GET /insubsistencias/ — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Listar insubsistências sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu listo as insubsistências sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403

  # GET /insubsistencias/buscar-por-portaria/ — portaria conhecida
  @validacao @buscar_por_portaria
  Cenário: Buscar insubsistência existente por portaria e ano
    Quando eu busco uma insubsistência existente por portaria e ano conhecidos
    Então o status code da resposta do SIGNA deve ser 200
    E a resposta deve conter os dados da insubsistência pesquisada

  # GET /insubsistencias/buscar-por-portaria/ — NEGATIVO portaria inexistente
  @negativo @buscar_por_portaria
  Cenário: Buscar insubsistência por portaria inexistente
    Quando eu busco uma insubsistência por portaria inexistente
    Então o status da resposta do SIGNA deve ser 404 ou 400

  # ── Ciclo de vida — cria designação de apoio, cria insubsistência
  # vinculada, consulta, exclui os dois ao final ───────────────────────────
  @critico @ciclo_de_vida @usa_designacao_de_apoio
  Cenário: Criar, consultar e excluir uma insubsistência
    Dado que existe uma designação de apoio válida para este teste
    Quando eu crio uma insubsistência vinculada à designação de apoio
    Então o status da resposta do SIGNA deve ser 200 ou 201
    E a insubsistência criada deve retornar um id
    E a insubsistência deve ser recuperável pelo id retornado

    Quando eu excluo a insubsistência criada
    Então o status da resposta do SIGNA deve ser 200 ou 204
    E a insubsistência excluída não deve mais ser encontrada

    Dado excluo a designação de apoio criada para este teste

  # POST /insubsistencias/ — NEGATIVO sem ato_pai
  @negativo @payload_invalido
  Cenário: Criar insubsistência sem informar o ato de origem
    Quando eu tento criar uma insubsistência sem informar o ato pai
    Então o status da resposta do SIGNA deve ser 400 ou 422

  # POST /insubsistencias/ — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Criar insubsistência sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu tento criar uma insubsistência sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403
