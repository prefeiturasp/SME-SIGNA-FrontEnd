# language: pt
@api @designacao @portarias
Funcionalidade: API SIGNA - Portarias
  Como um sistema de automação de testes
  Quero validar o endpoint de listagem de portarias do backend SIGNA
  Para garantir que os dados usados na tela de portarias estão acessíveis

  # ============================================================================
  # BASE URL: https://qa-signa.sme.prefeitura.sp.gov.br/api
  # AUTH: JWT via POST /usuario/login (Authorization: Bearer <token>)
  #
  # Endpoint coberto:
  #   GET /api/designacao/portarias/  — retorna um ARRAY simples (confirmado
  #     manualmente contra QA), diferente de todas as outras listagens de
  #     designação (que vêm paginadas em {count, results}).
  #
  # NÃO AUTOMATIZADO DE PROPÓSITO:
  #   POST /api/designacao/portarias/atualizar-data-publicacao/
  #   Payload real: {"ids": number[], "data_publicacao": string} (ver
  #   src/types/designacao.ts, PortariasDOBody) — altera em lote a data de
  #   publicação de portarias JÁ EXISTENTES em QA, sem nenhum endpoint de
  #   exclusão/reversão equivalente. Diferente de designação/cessação/
  #   apostila/insubsistência (que têm DELETE para desfazer o que o teste
  #   cria), esta é uma alteração direta e sem volta em dado real
  #   compartilhado — mesmo motivo pelo qual o time nunca clica em "Salvar"
  #   nos fluxos de UI que consomem portarias escassas de QA. Se algum dia
  #   quiser cobrir esse endpoint, alinhar antes um dado de portaria
  #   descartável dedicado a teste.
  # ============================================================================

  Contexto:
    Dado que estou autenticado na API do SIGNA

  # GET /portarias/ — smoke
  @smoke @listagem_portarias
  Cenário: Listar portarias
    Quando eu listo as portarias
    Então o status code da resposta do SIGNA deve ser 200
    E a resposta do SIGNA deve ser um array

  # GET /portarias/ — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Listar portarias sem autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu listo as portarias sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403
