#language: pt
@api @negativo
Funcionalidade: API EOL - Cenários Negativos
  Como sistema integrado SME
  Quero validar o comportamento da API em entradas inválidas e cenários de falha
  Para garantir que a API rejeita acessos indevidos e trata erros de forma segura

  # ============================================================================
  # BASE URL: https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br
  # AUTH: x-api-eol-key (header)
  #
  # Grupos de cenários negativos:
  #   1. Autenticação inválida / ausente
  #   2. Parâmetros inválidos
  #   3. Endpoint inexistente
  #   4. Método HTTP incorreto
  #   5. Segurança — injeção e traversal
  # ============================================================================

  # ==========================================================================
  # 1. AUTENTICAÇÃO INVÁLIDA / AUSENTE
  # ==========================================================================

  # Sem nenhum header de autenticação
  @negativo @autenticacao
  Cenário: Acessar DREs sem nenhuma chave de autenticação
    Dado que não estou autenticado
    Quando eu tento acessar "/api/DREs" sem token
    Então o status da resposta deve ser 401 ou 403

  # Header presente, mas valor inválido
  @negativo @autenticacao
  Cenário: Acessar DREs com chave de API inválida
    Dado que uso uma chave de API inválida "chave-invalida-000"
    Quando eu faço uma requisição GET para "/api/DREs"
    Então o status da resposta deve ser 401 ou 403

  # Endpoint de acessos sem auth
  @negativo @autenticacao
  Cenário: Acessar permissoes-grupos sem autenticação
    Dado que não estou autenticado
    Quando eu tento acessar "/api/acessos/permissoes-grupos" sem token
    Então o status da resposta deve ser 401 ou 403

  # GUID com formato válido, mas chave inexistente no sistema
  @negativo @autenticacao
  Cenário: Acessar abrangência com GUID de chave inexistente
    Dado que uso uma chave de API inválida "00000000-0000-0000-0000-000000000000"
    Quando eu faço uma requisição GET para "/api/abrangencia/codigos-dres"
    Então o status da resposta deve ser 401 ou 403

  # ==========================================================================
  # 2. PARÂMETROS INVÁLIDOS
  # ==========================================================================

  # RF deve ser numérico — letras não encontram registro, API retorna 200 false
  @negativo @parametros @rf_invalido
  Cenário: Verificar funcionário com RF contendo apenas letras
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição GET para "/api/acessos/funcionario-ativo/ABCDEFG"
    Então o status da resposta deve ser 200 ou 400
    E a resposta deve indicar funcionário inativo ou não encontrado

  # RF com valor numérico além do range esperado — API trata como string e retorna false
  @negativo @parametros @rf_invalido
  Cenário: Verificar funcionário com RF excessivamente longo
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição GET para "/api/acessos/funcionario-ativo/99999999999999999999"
    Então o status da resposta deve ser 200 ou 400
    E a resposta deve indicar funcionário inativo ou não encontrado

  # RF zerado — não deve existir no cadastro
  @negativo @parametros @rf_invalido
  Cenário: Verificar funcionário com RF zerado
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição GET para "/api/acessos/funcionario-ativo/0000000"
    Então o status da resposta deve ser 404 ou 200

  # Código de DRE no formato errado — API aceita e retorna 200 com corpo vazio/nulo
  @negativo @parametros @dre_invalida
  Cenário: Buscar DRE com código inexistente
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição GET para "/api/DREs/CODIGOINEXISTENTE"
    Então o status da resposta deve ser 200 ou 400
    E a resposta deve ser nula ou vazia

  # ==========================================================================
  # 3. ENDPOINT INEXISTENTE
  # ==========================================================================

  # Rota completamente inexistente → sempre 404
  @negativo @endpoint_invalido
  Cenário: Acessar rota inexistente na API
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição GET para "/api/recurso-nao-existe"
    Então o status code da resposta deve ser 404

  # Sub-recurso inexistente dentro de um módulo existente
  @negativo @endpoint_invalido
  Cenário: Acessar sub-recurso inválido de abrangência
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição GET para "/api/abrangencia/sub-recurso-invalido"
    Então o status da resposta deve ser 404 ou 400

  # ==========================================================================
  # 4. MÉTODO HTTP INCORRETO
  # ==========================================================================

  # POST em endpoint que só aceita GET — API retorna 400 ou 405
  @negativo @metodo_invalido
  Cenário: Enviar POST para endpoint somente GET de DREs
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição "POST" para "/api/DREs"
    Então o status da resposta deve ser 400 ou 405

  # DELETE em endpoint que só aceita GET
  @negativo @metodo_invalido
  Cenário: Enviar DELETE para endpoint de permissões
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição "DELETE" para "/api/acessos/permissoes-grupos"
    Então o status da resposta deve ser 405 ou 404

  # PUT em endpoint que só aceita GET
  @negativo @metodo_invalido
  Cenário: Enviar PUT para endpoint de abrangência
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição "PUT" para "/api/abrangencia/codigos-dres"
    Então o status da resposta deve ser 405 ou 404

  # ==========================================================================
  # 5. SEGURANÇA — INJEÇÃO E TRAVERSAL
  # ==========================================================================

  # SQL injection URL-encoded no parâmetro RF
  # 1%27%20OR%20%271%27%3D%271 = 1' OR '1'='1
  # API trata com segurança e retorna 200 false (não expõe dados)
  @negativo @seguranca
  Cenário: Tentativa de SQL injection no parâmetro RF
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição GET para "/api/acessos/funcionario-ativo/1%27%20OR%20%271%27%3D%271"
    Então o status da resposta deve ser 200 ou 400
    E a resposta não deve expor informações de erro interno

  # Path traversal URL-encoded
  # ..%2F..%2Fpasswd = ../../passwd
  @negativo @seguranca
  Cenário: Tentativa de path traversal no parâmetro RF
    Dado que possuo credenciais válidas de autenticação
    E que estou autenticado na API
    Quando eu faço uma requisição GET para "/api/acessos/funcionario-ativo/..%2F..%2Fpasswd"
    Então o status da resposta deve ser 400 ou 404
    E a resposta não deve expor informações de erro interno
