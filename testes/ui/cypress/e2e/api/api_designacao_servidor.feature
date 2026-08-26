# language: pt
@api @designacao @servidor
Funcionalidade: API SIGNA - Busca de servidor para designação
  Como um sistema de automação de testes
  Quero validar o endpoint de busca de servidor por RF
  Para garantir que os dados usados na criação de designações estão corretos

  # ============================================================================
  # BASE URL: https://qa-signa.sme.prefeitura.sp.gov.br/api
  # AUTH: JWT via POST /usuario/login (Authorization: Bearer <token>)
  #
  # Endpoint coberto:
  #   POST /api/designacao/servidor
  #
  # Nota: este endpoint depende de integração externa (SME) e pode responder
  # 500 de forma transitória para RFs válidos — mesmo comportamento já
  # observado e tratado com retry na suíte de UI (ver designacao_steps.js,
  # "seleciona uma unidade proponente aleatória"). Os cenários abaixo tentam
  # mais de um RF do pool conhecido antes de considerar falha.
  # ============================================================================

  Contexto:
    Dado que estou autenticado na API do SIGNA

  # POST /designacao/servidor — smoke
  @smoke @busca_servidor
  Cenário: Buscar servidor por RF válido
    Quando eu busco um servidor válido do pool de RFs conhecidos
    Então o status code da resposta do SIGNA deve ser 200
    E a resposta do servidor deve ser um objeto com o RF pesquisado

  # POST /designacao/servidor — estrutura
  @validacao @estrutura @busca_servidor
  Cenário: Validar campos obrigatórios do servidor retornado
    Quando eu busco um servidor válido do pool de RFs conhecidos
    Então o status code da resposta do SIGNA deve ser 200
    E o servidor retornado deve ter os campos obrigatórios:
      | campo         |
      | nome_servidor |
      | rf            |
      | vinculo       |
      | cargo_base    |
      | lotacao       |

  # POST /designacao/servidor — condição do cenário de ausência de dados
  # opcionais (cargo sobreposto / local de exercício), origem do payload de
  # criação de designação (ver mapearPayloadDesignacao em
  # src/utils/designacao/mapearPayload.ts). Não falha o teste: documenta a
  # condição real encontrada em QA no momento da execução.
  @validacao @dados_opcionais
  Cenário: Registrar quando o servidor não possui cargo sobreposto ou local de exercício
    Quando eu busco um servidor válido do pool de RFs conhecidos
    Então o status code da resposta do SIGNA deve ser 200
    E registro se o servidor possui cargo sobreposto e local de exercício

  # POST /designacao/servidor — NEGATIVO RF inexistente
  @negativo @rf_invalido
  Cenário: Buscar servidor com RF inexistente
    Quando eu busco o servidor pelo RF "0000000"
    Então o status da resposta do SIGNA deve ser 400 ou 404

  # POST /designacao/servidor — NEGATIVO sem autenticação
  @negativo @sem_autenticacao
  Cenário: Buscar servidor sem token de autenticação
    Dado que não estou autenticado na API do SIGNA
    Quando eu busco o servidor pelo RF "7311559" sem token
    Então o status da resposta do SIGNA deve ser 401 ou 403
