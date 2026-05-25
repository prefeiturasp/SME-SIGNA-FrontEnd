#language: pt
@api @dre_unidades_integracao
Funcionalidade: Testes da API de Unidades com Código de Integração por DRE
  Como um testador
  Quero validar o endpoint GET /api/DREs/{dreCodigo}/unidades/codigo-integracao
  Para garantir que as unidades com código de integração são retornadas corretamente

  @smoke @integracao_listagem_aleatorio
  Cenário: Listar unidades com código de integração de DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as unidades com código de integração da DRE aleatória
    Então a resposta deve retornar status 200
    E a resposta deve ser um array não vazio de unidades
    E cada unidade deve ter os campos obrigatórios de integração:
      | campo |
      | codigoUe |
      | nomeUe |
      | codigoIntegracao |

  @validacao @integracao_tipos_campos_aleatorio
  Cenário: Validar tipos dos campos das unidades com DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as unidades com código de integração da DRE aleatória
    Então a resposta deve retornar status 200
    E os tipos dos campos das unidades devem estar corretos

  @validacao @integracao_codigo_integracao_nulo
  Cenário: Validar que codigoIntegracao pode ser nulo em DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as unidades com código de integração da DRE aleatória
    Então a resposta deve retornar status 200
    E os campos codigoUe e nomeUe de todas as unidades devem ser preenchidos

  @validacao @integracao_quantidade_minima
  Cenário: Validar quantidade mínima de unidades na DRE Capela do Socorro
    Quando eu busco as unidades com código de integração da DRE com código "108300"
    Então a resposta deve retornar status 200
    E a resposta deve conter pelo menos 50 unidades

  @validacao @integracao_unidade_especifica
  Cenário: Validar unidade específica conhecida na DRE 108300
    Quando eu busco as unidades com código de integração da DRE com código "108300"
    Então a resposta deve retornar status 200
    E a resposta deve conter uma unidade com código "000493" e nome contendo "AURELIO BUARQUE"

  @validacao @integracao_codigo_invalido
  Cenário: Buscar unidades com código de DRE inválido
    Quando eu busco as unidades com código de integração da DRE com código "000000"
    Então a resposta deve retornar status 200

  @negativo @integracao_sem_autenticacao
  Cenário: Buscar unidades com código de integração sem token
    Quando eu busco as unidades com código de integração da DRE com código "108300" sem token
    Então a resposta deve retornar status 401 ou 403
