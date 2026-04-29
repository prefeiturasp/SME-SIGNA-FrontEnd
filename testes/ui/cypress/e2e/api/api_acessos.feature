#language: pt
@api @acessos
Funcionalidade: API EOL - Acessos
  Como sistema integrado SME
  Quero validar os endpoints de controle de acesso
  Para garantir que verificações de funcionário ativo e permissões estão corretas

  # ============================================================================
  # BASE URL: https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br
  # AUTH: x-api-eol-key (header)
  #
  # Endpoints cobertos:
  #   GET /api/acessos/funcionario-ativo/{registroFuncional}
  #   GET /api/acessos/permissoes-grupos
  # ============================================================================

  Contexto:
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API

  # GET /api/acessos/funcionario-ativo/{registroFuncional}
  @smoke @funcionario_ativo
  Cenário: Verificar se funcionário está ativo pelo RF
    Quando eu verifico se o funcionário está ativo pelo RF
    Então o status code da resposta deve ser 200

  # GET /api/acessos/permissoes-grupos
  @smoke @permissoes_grupos
  Cenário: Listar permissões disponíveis por grupos
    Quando eu faço uma requisição GET para "/api/acessos/permissoes-grupos"
    Então o status code da resposta deve ser 200
    E a resposta deve ser um array

  # GET /api/acessos/funcionario-ativo/{registroFuncional}
  @validacao @funcionario_ativo
  Cenário: Validar estrutura de dados do funcionário ativo
    Quando eu verifico se o funcionário está ativo pelo RF
    Então o status code da resposta deve ser 200
    E a resposta deve indicar se o funcionário está ativo

  # GET /api/acessos/funcionario-ativo/{registroFuncional} — NEGATIVO
  @negativo @rf_invalido
  Cenário: Verificar funcionário com RF inexistente
    Quando eu faço uma requisição GET para "/api/acessos/funcionario-ativo/0000000"
    Então o status da resposta deve ser 404 ou 200

  # GET /api/acessos/funcionario-ativo — NEGATIVO sem auth
  @negativo @sem_autenticacao
  Cenário: Acessar endpoint de acessos sem autenticação
    Dado que não estou autenticado
    Quando eu tento acessar "/api/acessos/permissoes-grupos" sem token
    Então o status da resposta deve ser 401 ou 403

  # PERFORMANCE
  @performance
  Cenário: Validar tempo de resposta da verificação de acesso
    Quando eu verifico se o funcionário está ativo pelo RF
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 5000 milissegundos
