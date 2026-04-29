#language: pt
@api @autenticacao_sgp
Funcionalidade: API EOL - AutenticacaoSGP
  Como sistema integrado SME
  Quero validar os endpoints de autenticação e dados do usuário SGP
  Para garantir que login, perfis e permissões estão funcionando corretamente

  # ============================================================================
  # BASE URL: https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br
  # AUTH: x-api-eol-key (header)
  # RF DE TESTE: configurado em .env como API_RF_LOGIN
  #
  # Endpoints cobertos:
  #   GET /api/AutenticacaoSgp/{login}/dados
  #   GET /api/AutenticacaoSgp/CarregarPerfisPorLogin/{login}
  #   GET /api/AutenticacaoSgp/CarregarDadosAcesso/usuarios/{login}/perfis/{perfil}
  #   GET /api/AutenticacaoSgp/{login}/obter/resumo
  # ============================================================================

  Contexto:
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API

  # GET /api/AutenticacaoSgp/{login}/dados
  @smoke @dados_usuario
  Cenário: Obter dados do usuário SGP pelo RF
    Quando eu busco os dados SGP do login
    Então o status code da resposta deve ser 200
    E a resposta deve ser um objeto
    E a resposta deve conter dados do usuário SGP

  # GET /api/AutenticacaoSgp/{login}/dados
  @validacao @estrutura
  Cenário: Validar campos obrigatórios nos dados do usuário SGP
    Quando eu busco os dados SGP do login
    Então o status code da resposta deve ser 200
    E a resposta deve conter os campos obrigatórios do usuário SGP:
      | campo          |
      | codigoRf       |
      | nome           |
      | email          |

  # GET /api/AutenticacaoSgp/CarregarPerfisPorLogin/{login}
  @smoke @perfis
  Cenário: Carregar perfis disponíveis para o login
    Quando eu carrego os perfis do login SGP
    Então o status code da resposta deve ser 200
    E a resposta deve conter perfis do usuário SGP

  # GET /api/AutenticacaoSgp/{login}/obter/resumo
  @smoke @resumo
  Cenário: Obter resumo do usuário SGP
    Quando eu busco o resumo SGP do login
    Então o status code da resposta deve ser 200
    E a resposta deve ser um objeto

  # GET /api/AutenticacaoSgp/{login}/dados — NEGATIVO
  @negativo @sem_autenticacao
  Cenário: Tentar acessar dados SGP sem chave de API
    Dado que não estou autenticado
    Quando eu tento acessar os dados SGP do login sem autenticação
    Então o status da resposta deve ser 401 ou 403

  # GET /api/AutenticacaoSgp/{login}/dados — PERFORMANCE
  @performance
  Cenário: Validar tempo de resposta dos dados SGP
    Quando eu busco os dados SGP do login
    Então o status code da resposta deve ser 200
    E o tempo de resposta deve ser menor que 5000 milissegundos
