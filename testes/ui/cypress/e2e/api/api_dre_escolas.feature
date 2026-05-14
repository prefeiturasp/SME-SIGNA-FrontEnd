#language: pt
@api @dre_escolas
Funcionalidade: Testes da API de Escolas por DRE e Tipo
  Como um testador
  Quero validar o endpoint GET /api/DREs/{codigoEolDRE}/escolas/{tipoEscola}
  Para garantir que as escolas de um tipo específico em uma DRE são retornadas corretamente

  @smoke @listagem_escolas_aleatorio
  Cenário: Listar escolas EMEF de uma DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as escolas de tipo "1" dessa DRE aleatória
    Então a resposta deve retornar status 200
    E a resposta deve ser um array não vazio de escolas
    E cada escola deve ter os campos obrigatórios:
      | campo |
      | codigoEscola |
      | nomeEscola |
      | tipoEscola |
      | siglaTipoEscola |
      | codigoDRE |
      | nomeDRE |

  @validacao @tipos_campos_escolas_aleatorio
  Cenário: Validar tipos dos campos das escolas com DRE aleatória
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as escolas de tipo "1" dessa DRE aleatória
    Então a resposta deve retornar status 200
    E os tipos dos campos das escolas devem estar corretos

  @validacao @escolas_dre_fixa
  Cenário: Listar escolas EMEF da DRE Butanta
    Quando eu busco as escolas de tipo "1" da DRE com código "108100"
    Então a resposta deve retornar status 200
    E a resposta deve ser um array não vazio de escolas
    E todas as escolas devem ter o código de DRE "108100"
    E cada escola deve ter tipo "EMEF"

  @validacao @correspondencia_dre_escolas
  Cenário: Validar correspondência entre DRE solicitada e DRE retornada nas escolas
    Quando eu obtenho um código de DRE aleatório da lista
    E eu busco as escolas de tipo "1" dessa DRE aleatória
    Então a resposta deve retornar status 200
    E o código de DRE na resposta deve corresponder ao código de DRE enviado

  @validacao @quantidade_minima_escolas
  Cenário: Validar quantidade mínima de escolas EMEF
    Quando eu busco as escolas de tipo "1" da DRE com código "108100"
    Então a resposta deve retornar status 200
    E a resposta deve conter pelo menos 10 escolas

  @negativo @tipo_escola_invalido
  Cenário: Buscar escolas com tipo inválido
    Quando eu busco as escolas de tipo "999" da DRE com código "108100"
    Então a resposta deve retornar status 400 ou 404

  @negativo @codigo_dre_inexistente
  Cenário: Buscar escolas de DRE inexistente
    Quando eu busco as escolas de tipo "1" da DRE com código "000000"
    Então a resposta deve retornar status 204

  @negativo @escolas_sem_autenticacao
  Cenário: Buscar escolas sem token de autenticação
    Quando eu busco as escolas de tipo "1" da DRE com código "108100" sem token
    Então a resposta deve retornar status 401 ou 403
