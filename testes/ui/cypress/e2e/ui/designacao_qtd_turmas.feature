# language: pt

@designacao @turmas_abertas
Funcionalidade: Designação - Quantidade de turmas abertas da unidade proponente
  Como Assistente Técnico de Educação
  Quero ver na designação apenas as turmas abertas da UE
  Para que o "Qtd. Turmas" e os módulos de gestão reflitam a situação real da unidade

  # Massa: UE 093394 - EMEF Teodomiro Toledo Piza, Des. (DRE Capela do Socorro,
  # 108300). No EOL, em 2026: 40 turmas abertas, 4 concluídas e 15 excluídas.
  # Os cenários de API (total, turno/ciclo/SPI, módulos) estão em
  # cypress/e2e/api/api_designacao_unidade_turmas.feature.

  Contexto:
    Dado que o usuário está autenticado no sistema

  @critico @smoke
  Cenário: Exibir a quantidade de turmas abertas na designação
    Quando acessa a etapa "Servidor indicado" de uma nova designação
    E seleciona a DRE "CAPELA DO SOCORRO" e a UE "TEODOMIRO TOLEDO PIZA" como unidade proponente
    E pesquisa a unidade proponente
    Então o campo "Qtd. Turmas" deve exibir "40"
    E registro a evidência da tela de designação
