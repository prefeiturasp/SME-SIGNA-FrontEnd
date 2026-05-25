#language: pt
@api @dre_codigo
Funcionalidade: Testes da API de Detalhes de DRE por Código
  Como um testador
  Quero validar o endpoint GET /api/DREs/{codigoEolDRE}
  Para garantir que os detalhes de uma DRE específica são retornados corretamente

  @smoke @detalhes_dre_aleatorio
  Cenário: Obter detalhes de uma DRE com código aleatório
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco a DRE com esse código aleatório
    Então a resposta deve retornar status 200
    E a resposta deve conter uma DRE com campos obrigatórios:
      | campo |
      | codigoDRE |
      | nomeDRE |
      | siglaDRE |

  @validacao @tipos_campos_dre_aleatorio
  Cenário: Validar tipos dos campos da DRE com código aleatório
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco a DRE com esse código aleatório
    Então a resposta deve retornar status 200
      E os tipos dos campos da DRE individual devem estar corretos

  @validacao @correspondencia_codigo_nome_aleatorio
  Cenário: Validar correspondência entre código e nome com DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco a DRE com esse código aleatório
    Então a resposta deve retornar status 200
    E o código da DRE deve corresponder ao código enviado
    E o nome da DRE deve ser preenchido

  @validacao @detalhes_dre_fixa
  Cenário: Obter detalhes de uma DRE específica conhecida
    Quando eu busco a DRE com código "108400"
    Então a resposta deve retornar status 200
    E a DRE deve ter código "108400"
    E a DRE deve ter nome contendo "FREGUESIA"
    E a resposta deve conter uma DRE com campos obrigatórios:
      | campo |
      | codigoDRE |
      | nomeDRE |
      | siglaDRE |

  @negativo @codigo_inexistente_dre
  Cenário: Buscar DRE com código inválido
    Quando eu busco a DRE com código "000000"
      Então a resposta deve retornar status 200
      E a resposta deve ser um array

  @negativo @dre_sem_autenticacao
  Cenário: Buscar DRE sem token de autenticação
    Quando eu busco a DRE com código "108400" sem token
    Então a resposta deve retornar status 401 ou 403
