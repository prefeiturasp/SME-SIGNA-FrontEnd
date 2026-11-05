# language: pt
@api @designacao @unidade @turmas_abertas
Funcionalidade: API SIGNA - Unidade - Contagem de turmas abertas
  Como Assistente Técnico de Educação
  Quero que a consulta da unidade considere apenas as turmas abertas no EOL
  Para que a quantidade de turmas e os módulos de gestão reflitam a situação real da UE

  # ============================================================================
  # Endpoint: GET /api/designacao/unidade/?codigo_ue=<codigo>
  #
  # Massa: UE 093394 - EMEF Teodomiro Toledo Piza, Des. (DRE Capela do Socorro,
  # 108300). No EOL, em 2026: 40 turmas abertas, 4 concluídas e 15 excluídas
  # (59 no total).
  # ============================================================================

  Contexto:
    Dado que estou autenticado na API do SIGNA

  @critico @smoke
  Cenário: Retornar no serviço apenas a quantidade de turmas abertas
    Quando eu busco os dados da unidade pelo código UE "093394"
    Então o status code da resposta do SIGNA deve ser 200
    E a quantidade de turmas retornada deve ser 40
    E a quantidade de turmas retornada não deve ser 59
    E registro a resposta da unidade como evidência

  @validacao
  Cenário: Considerar apenas turmas abertas na distribuição por turno, ciclo e SPI
    Quando eu busco os dados da unidade pelo código UE "093394"
    Então o status code da resposta do SIGNA deve ser 200
    E a soma da distribuição de turmas por turno deve ser 40
    E a soma da distribuição de turmas por ciclo deve ser 40
    E a contagem de SPI deve considerar apenas as turmas abertas
    E registro a resposta da unidade como evidência

  @validacao @modulos
  Cenário: Calcular os módulos de gestão com base nas turmas abertas
    Quando eu busco os dados da unidade pelo código UE "093394"
    Então o status code da resposta do SIGNA deve ser 200
    E o módulo do cargo "COORDENADOR PEDAGOGICO" deve ser 3
    E o módulo do cargo "ASSISTENTE DE DIRETOR DE ESCOLA" deve ser 2
    E registro a resposta da unidade como evidência
