# Contribuindo para o Projeto

Obrigado por considerar contribuir para este projeto! Este documento fornece diretrizes para contribuição.

## Como Contribuir

### 1. Fork e Clone
```bash
git clone https://github.com/seu-usuario/signa-automation.git
cd signa-automation
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Crie uma Branch
```bash
git checkout -b feature/nova-funcionalidade
```

### 4. Faça suas Alterações
- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação se necessário

### 5. Execute os Testes
```bash
npm test
```

### 6. Commit suas Alterações
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
```

### 7. Push para o GitHub
```bash
git push origin feature/nova-funcionalidade
```

### 8. Abra um Pull Request

## Padrões de Código

### Nomenclatura
- **Arquivos**: snake_case (ex: `login_steps.js`)
- **Variáveis**: camelCase (ex: `campoRfCpf`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `BASE_URL`)
- **Funções**: camelCase (ex: `realizarLogin`)

### Estrutura de Arquivos
```
cypress/
├── e2e/                    # Features em Gherkin
├── support/
│   ├── commands_ui/        # Comandos customizados
│   ├── locators/           # Seletores de elementos
│   └── step_definitions/   # Implementação dos steps
```

### Commits
Use Conventional Commits:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `test:` - Testes
- `refactor:` - Refatoração
- `style:` - Formatação
- `chore:` - Manutenção

## Adicionando Novos Testes

### 1. Crie a Feature
```gherkin
# cypress/e2e/ui/nova_funcionalidade.feature
# language: pt

Funcionalidade: Nova Funcionalidade
  Cenário: Teste da nova funcionalidade
    Dado que o usuário está autenticado
    Quando o usuário acessa a funcionalidade
    Então deve visualizar a tela corretamente
```

### 2. Crie os Locators
```javascript
// cypress/support/locators/nova_funcionalidade_locators.js
export const novaFuncionalidadeLocators = {
  elemento: '[data-testid="elemento"]'
};
```

### 3. Crie os Steps
```javascript
// cypress/support/step_definitions/nova_funcionalidade_steps.js
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('que o usuário está autenticado', () => {
  cy.loginPadrao();
});
```

### 4. Adicione Commands se Necessário
```javascript
// cypress/support/commands_ui/commands_nova_funcionalidade.js
Cypress.Commands.add('novaAcao', () => {
  // Implementação
});
```

## Revisão de Código

Todos os Pull Requests serão revisados. Certifique-se de:
- [ ] Testes estão passando
- [ ] Código segue os padrões
- [ ] Documentação está atualizada
- [ ] Não há conflitos com a branch main

## Reportar Bugs

Use as Issues do GitHub para reportar bugs:
1. Descreva o problema
2. Passos para reproduzir
3. Comportamento esperado
4. Comportamento atual
5. Screenshots se aplicável

## Sugestões de Melhorias

Sugestões são bem-vindas! Abra uma Issue com:
- Descrição da melhoria
- Justificativa
- Exemplos de uso

## Dúvidas?

Se tiver dúvidas, abra uma Issue ou entre em contato com a equipe.

Obrigado por contribuir! 🎉
