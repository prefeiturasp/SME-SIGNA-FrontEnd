# language: pt
@api @designacao @cessacoes
Funcionalidade: API SIGNA - Cessações
  Como um sistema de automação de testes
  Quero validar os endpoints de cessação do backend SIGNA
  Para garantir que a criação, consulta e exclusão funcionam corretamente

  # ============================================================================
  # BASE URL: https://qa-signa.sme.prefeitura.sp.gov.br/api
  # AUTH: JWT via POST /usuario/login (Authorization: Bearer <token>)
  #
  # Endpoints cobertos:
  #   GET    /api/designacao/cessacoes/
  #   POST   /api/designacao/cessacoes/
  #   GET    /api/designacao/cessacoes/{id}/
  #   DELETE /api/designacao/cessacoes/{id}/
  #   GET    /api/designacao/cessacoes/buscar-por-portaria/
  #
  # Toda cessação criada (POST) depende de uma designação já existente
  # (campo "ato_pai" — confirmado em
  # src/utils/cessacao/mapearPayloadCessacao.ts). Os cenários que criam
  # cessação criam TAMBÉM uma designação de apoio exclusiva para o teste
  # (tag @usa_designacao_de_apoio) e excluem os dois ao final — nunca
  # reaproveitam uma designação real de QA.
  # ============================================================================

  Contexto:
    Dado que estou autenticado na API do SIGNA

  # GET /cessacoes/ — smoke
  @smoke @listagem_cessacoes
  Cenário: Listar cessações
    Quando eu listo as cessações
    Então o status code da resposta do SIGNA deve ser 200
    E a listagem de cessações deve estar paginada com resultados em formato de array

  # GET /cessacoes/ — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Listar cessações sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu listo as cessações sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403

  # GET /cessacoes/buscar-por-portaria/ — portaria conhecida
  @validacao @buscar_por_portaria
  Cenário: Buscar cessação existente por portaria e ano
    Quando eu busco uma cessação existente por portaria e ano conhecidos
    Então o status code da resposta do SIGNA deve ser 200
    E a resposta deve conter os dados da cessação pesquisada

  # GET /cessacoes/buscar-por-portaria/ — NEGATIVO portaria inexistente
  @negativo @buscar_por_portaria
  Cenário: Buscar cessação por portaria inexistente
    Quando eu busco uma cessação por portaria inexistente
    Então o status da resposta do SIGNA deve ser 404 ou 400

  # ── Ciclo de vida — cria designação de apoio, cria cessação vinculada,
  # consulta, exclui os dois ao final ─────────────────────────────────────
  @critico @ciclo_de_vida @usa_designacao_de_apoio
  Cenário: Criar, consultar e excluir uma cessação
    Dado que existe uma designação de apoio válida para este teste
    Quando eu crio uma cessação vinculada à designação de apoio
    Então o status da resposta do SIGNA deve ser 200 ou 201
    E a cessação criada deve retornar um id
    E a cessação deve ser recuperável pelo id retornado

    Quando eu excluo a cessação criada
    Então o status da resposta do SIGNA deve ser 200 ou 204
    E a cessação excluída não deve mais ser encontrada

    Dado excluo a designação de apoio criada para este teste

  # POST /cessacoes/ — NEGATIVO sem ato_pai
  @negativo @payload_invalido
  Cenário: Criar cessação sem informar a designação de origem
    Quando eu tento criar uma cessação sem informar o ato pai
    Então o status da resposta do SIGNA deve ser 400 ou 422

  # POST /cessacoes/ — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Criar cessação sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu tento criar uma cessação sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403
