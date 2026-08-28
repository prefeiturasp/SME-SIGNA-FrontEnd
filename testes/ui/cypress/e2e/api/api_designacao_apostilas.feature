# language: pt
@api @designacao @apostilas
Funcionalidade: API SIGNA - Apostilas
  Como um sistema de automação de testes
  Quero validar os endpoints de apostila do backend SIGNA
  Para garantir que a criação, consulta e exclusão funcionam corretamente

  # ============================================================================
  # BASE URL: https://qa-signa.sme.prefeitura.sp.gov.br/api
  # AUTH: JWT via POST /usuario/login (Authorization: Bearer <token>)
  #
  # Endpoints cobertos:
  #   GET    /api/designacao/apostilas/
  #   POST   /api/designacao/apostilas/
  #   GET    /api/designacao/apostilas/{id}/
  #   DELETE /api/designacao/apostilas/{id}/
  #
  # Toda apostila criada (POST) depende de uma designação já existente
  # (campo "ato_pai" — confirmado em src/types/apostila.ts, ApostilaBody).
  # Regra de negócio confirmada manualmente contra QA: não é possível
  # apostilar uma designação já cessada ("Não é possível apostilar uma
  # designação cessada.") — por isso o cenário de ciclo de vida cria uma
  # designação de apoio EXCLUSIVA (nunca cessada), tag
  # @usa_designacao_de_apoio, excluída ao final junto com a apostila.
  # ============================================================================

  Contexto:
    Dado que estou autenticado na API do SIGNA

  # GET /apostilas/ — smoke
  @smoke @listagem_apostilas
  Cenário: Listar apostilas
    Quando eu listo as apostilas
    Então o status code da resposta do SIGNA deve ser 200
    E a listagem de apostilas deve estar paginada com resultados em formato de array

  # GET /apostilas/ — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Listar apostilas sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu listo as apostilas sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403

  # ── Ciclo de vida — cria designação de apoio, cria apostila vinculada,
  # consulta, exclui os dois ao final ─────────────────────────────────────
  @critico @ciclo_de_vida @usa_designacao_de_apoio
  Cenário: Criar, consultar e excluir uma apostila
    Dado que existe uma designação de apoio válida para este teste
    Quando eu crio uma apostila vinculada à designação de apoio
    Então o status da resposta do SIGNA deve ser 200 ou 201
    E a apostila criada deve retornar um id
    E a apostila deve ser recuperável pelo id retornado

    Quando eu excluo a apostila criada
    Então o status da resposta do SIGNA deve ser 200 ou 204
    E a apostila excluída não deve mais ser encontrada

    Dado excluo a designação de apoio criada para este teste

  # POST /apostilas/ — NEGATIVO sem ato_pai
  @negativo @payload_invalido
  Cenário: Criar apostila sem informar o ato de origem
    Quando eu tento criar uma apostila sem informar o ato pai
    Então o status da resposta do SIGNA deve ser 400 ou 422

  # POST /apostilas/ — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Criar apostila sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu tento criar uma apostila sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403
