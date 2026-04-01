# Guia de Sintaxe Gherkin

Este documento fornece diretrizes para escrever cenários de teste usando a sintaxe Gherkin.

## Estrutura Básica

```gherkin
# language: pt

Funcionalidade: [Nome da Funcionalidade]
  Como [tipo de usuário]
  Eu quero [ação]
  Para [benefício/objetivo]

  Contexto:
    Dado [pré-condição comum]

  Cenário: [Descrição do cenário]
    Dado [pré-condição]
    Quando [ação]
    Então [resultado esperado]
```

## Palavras-Chave

### Funcionalidade (Feature)
Descreve a funcionalidade sendo testada.

### Contexto (Background)
Passos executados antes de cada cenário.

### Cenário (Scenario)
Um caso de teste específico.

### Esquema do Cenário (Scenario Outline)
Template para cenários com múltiplos conjuntos de dados.

### Dado (Given)
Estado inicial ou pré-condição.

### Quando (When)
Ação do usuário.

### Então (Then)
Resultado esperado.

### E (And)
Adiciona mais passos do mesmo tipo.

## Tags

Use tags para organizar e filtrar testes:

```gherkin
@smoke @login
Cenário: Login com sucesso
```

Tags comuns:
- `@smoke` - Testes de fumaça (principais)
- `@regression` - Testes de regressão
- `@wip` - Work in Progress
- `@skip` - Pular teste
- `@slow` - Testes lentos

## Boas Práticas

1. **Seja Específico**: Cenários devem ser claros e específicos
2. **Use Dados Realistas**: Valores de teste devem ser próximos ao real
3. **Evite Detalhes de UI**: Foque no comportamento, não em elementos específicos
4. **Um Cenário = Um Teste**: Cada cenário deve testar uma coisa
5. **Mantenha Simplicidade**: Passos curtos e claros

## Exemplos

### Cenário Simples
```gherkin
Cenário: Login com sucesso
  Dado que o usuário acessa a página de login
  Quando o usuário preenche o campo "RF ou CPF" com "7311559"
  E o usuário preenche o campo "Senha" com "Sgp1559"
  E o usuário clica no botão "Entrar"
  Então o usuário deve ser redirecionado para a página inicial
```

### Esquema do Cenário
```gherkin
Esquema do Cenário: Validar diferentes tipos de login inválido
  Dado que o usuário acessa a página de login
  Quando o usuário preenche o campo "RF ou CPF" com "<rf>"
  E o usuário preenche o campo "Senha" com "<senha>"
  E o usuário clica no botão "Entrar"
  Então deve exibir mensagem de erro "<mensagem>"

  Exemplos:
    | rf      | senha        | mensagem                    |
    | 123456  | SenhaErrada  | Usuário ou senha inválidos  |
    | 7311559 | SenhaErrada  | Usuário ou senha inválidos  |
```

## Referências

- [Cucumber Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Gherkin Best Practices](https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/)
