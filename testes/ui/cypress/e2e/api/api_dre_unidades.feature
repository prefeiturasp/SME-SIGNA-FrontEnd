#language: pt
@api @dre_unidades
Funcionalidade: Testes da API de Unidades por DRE
  Como um testador
  Quero validar o endpoint GET /api/DREs/{dreCodigo}/unidades
  Para garantir que o endpoint responde corretamente para códigos de DRE válidos

  @smoke @unidades_status_aleatorio
  Cenário: Validar status 200 ao buscar unidades de DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as unidades da DRE aleatória
    Então a resposta deve retornar status 200

  @validacao @unidades_resposta_array_aleatorio
  Cenário: Validar que a resposta é um array para DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as unidades da DRE aleatória
    Então a resposta deve retornar status 200
    E a resposta das unidades deve ser um array

  @validacao @unidades_dre_butanta
  Cenário: Buscar unidades de uma DRE específica conhecida
    Quando eu busco as unidades da DRE com código "108100"
    Então a resposta deve retornar status 200
    E a resposta das unidades deve ser um array

  @validacao @unidades_multiplas_dres
  Cenário: Validar status 200 em duas DREs aleatórias consecutivas
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as unidades da DRE aleatória
    Então a resposta deve retornar status 200
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as unidades da DRE aleatória
    Então a resposta deve retornar status 200

  @negativo @unidades_codigo_invalido
  Cenário: Buscar unidades com código de DRE inválido
    Quando eu busco as unidades da DRE com código "000000"
    Então a resposta deve retornar status 200

  @negativo @unidades_sem_autenticacao
  Cenário: Buscar unidades sem token de autenticação
    Quando eu busco as unidades da DRE com código "108100" sem token
    Então a resposta deve retornar status 401 ou 403
