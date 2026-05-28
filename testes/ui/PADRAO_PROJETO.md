# Padrão de Desenvolvimento - Projeto SIGNA Automação

## 🎯 Visão Geral

Este documento estabelece os padrões e convenções para o desenvolvimento de testes automatizados no projeto SIGNA, utilizando Cypress + Cucumber (BDD).

---

## 📁 Estrutura do Projeto

```
testes/ui/
├── cypress/
│   ├── e2e/
│   │   ├── api/           # Testes de API (integração)
│   │   └── ui/            # Testes de interface (E2E)
│   ├── fixtures/          # Dados de teste estáticos
│   ├── support/
│   │   ├── commands.js    # Comandos globais do Cypress
│   │   ├── e2e.js        # Configurações globais
│   │   ├── step_definitions/
│   │   │   ├── api/      # Steps de testes de API
│   │   │   └── ui/       # Steps de testes de UI
│   │   └── ui/
│   │       ├── commands/  # Comandos específicos por feature
│   │       └── locators/  # Seletores organizados por página
│   └── videos/           # Vídeos de execução (gerados automaticamente)
├── .env.example          # Template de variáveis de ambiente
├── .env                  # Credenciais REAIS (NÃO VERSIONAR)
└── cypress.config.js     # Configuração do Cypress
```

---

## 🔐 Gestão de Credenciais e Segurança

### ⚠️ REGRAS CRÍTICAS - NUNCA VIOLE

1. **NUNCA commite credenciais reais**
   - Arquivos `.env` contêm credenciais reais e **NUNCA** devem ser versionados
   - Apenas o `.env.example` deve estar no Git

2. **Arquivo `.env` é OBRIGATÓRIO**
   - Copie `.env.example` para `.env` na primeira configuração
   - Preencha com credenciais reais fornecidas pelo time
   - Este arquivo está no `.gitignore` e será ignorado pelo Git

3. **Verificação antes de commit**
   ```bash
   # SEMPRE verifique antes de commitar:
   git status
   
   # Se .env aparecer, PARE e verifique:
   git reset HEAD .env
   ```

### 📋 Estrutura do `.env`

```bash
# URLs
BASE_URL=https://qa-signa.sme.prefeitura.sp.gov.br
LOGIN_URL=https://qa-signa.sme.prefeitura.sp.gov.br/login

# Credenciais SIGNA
USERNAME=seu_rf
PASSWORD=sua_senha
SIGNA_USERNAME=seu_rf
SIGNA_PASSWORD=sua_senha
SIGNA_NEW_PASSWORD_TEST=senha_teste

# API EOL
API_EOL_BASE_URL=https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br
API_EOL_KEY=sua_chave_api
API_RF_LOGIN=seu_rf
API_PASSWORD=sua_senha
API_EMAIL=seu.email@sme.prefeitura.sp.gov.br

# Configurações Cypress
CYPRESS_VIDEO=false
CYPRESS_SCREENSHOT=true
CYPRESS_VIEWPORT_WIDTH=1920
CYPRESS_VIEWPORT_HEIGHT=1080
```

### 🔒 Arquivos Protegidos pelo `.gitignore`

```gitignore
# Credenciais e dados sensíveis
.env
.env.local
.env.*.local
cypress.env.json
cypress/fixtures/usuarios.json

# Relatórios e artifacts
cypress/screenshots/
cypress/videos/
allure-results/
allure-report/
```

---

## 📝 Padrões de Escrita - Gherkin (Features)

### Estrutura de uma Feature

```gherkin
# language: pt

@tag-principal @categoria
Funcionalidade: Nome da Funcionalidade
  Como um [tipo de usuário]
  Eu quero [ação]
  Para que [benefício/resultado]

  Contexto:
    Dado que o usuário está autenticado no sistema

  @tag-cenario @criticidade
  Cenário: Descrição clara do cenário
    # Comentário sobre o cenário (se necessário)
    Dado que [contexto inicial]
    Quando [ação do usuário]
    E [ação adicional]
    Então [resultado esperado]
    E [validação adicional]
```

### Convenções de Nomenclatura

1. **Tags organizadas por hierarquia:**
   ```gherkin
   @login @autenticacao @smoke
   @cessacao @designacao @critico
   @api @integracao
   ```

2. **Nomes de cenários:**
   - Começam com letra maiúscula
   - Descrevem claramente a ação e resultado
   - Exemplos:
     - ✅ "Login com credenciais válidas"
     - ✅ "Cessação de designação existente - Fluxo completo"
     - ❌ "teste login"
     - ❌ "cenario1"

3. **Steps descritivos:**
   - Use português claro
   - Evite detalhes técnicos (IDs, XPath)
   - Foco no comportamento, não na implementação

### Organização de Steps

```gherkin
# ETAPA 1: Navegação
Dado que o usuário está na página do dashboard
E Valida a existencia da Tabela

# ETAPA 2: Ação principal
Quando Seleciona uma das Designação de forma aleatoria
E clica e seleciona a opção "cessar"

# ETAPA 3: Validação
Então o sistema exibe a Tela "Cessação"
E valida a existencia dos Titulos
```

---

## 🧩 Padrões de Código - Steps e Locators

### Estrutura de um Step Definition

```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { nomeFeatureSelectors } from '../../ui/locators/nome_feature_locators'

// ETAPA 1: Descrição clara da etapa

When('realizo uma ação {string}', (parametro) => {
  cy.log(`Executando ação: "${parametro}"`)
  
  nomeFeatureSelectors.elementoAlvo(parametro)
    .should('be.visible')
    .click({ force: true })
  
  cy.wait(500)
})

Then('valido o resultado esperado', () => {
  cy.log('Validando resultado')
  
  cy.get('body').then($body => {
    const elementoExiste = $body.find('.seletor-elemento').length > 0
    
    if (elementoExiste) {
      cy.get('.seletor-elemento').should('be.visible')
      cy.log('Elemento encontrado')
    } else {
      cy.log('Elemento não encontrado (opcional)')
    }
  })
})
```

### Estrutura de um Locator

```javascript
export const nomeFeatureSelectors = {

  // Elementos gerais
  botao: (texto) => cy.contains('button, a', texto, { timeout: 10000 }).first(),
  
  campo: (label) => cy.contains('label', label).parent().find('input').first(),
  
  titulo: (texto) => cy.contains('h1, h2, h3', texto, { timeout: 10000 }),
  
  // Elementos específicos da página
  inputPorLabel: (label) => {
    cy.log(`Buscando input para label: "${label}"`)
    
    return cy.get('body').then($body => {
      const $label = $body.find(`label:contains("${label}")`).first()
      
      if ($label.length > 0 && $label.attr('for')) {
        const inputId = $label.attr('for')
        const $input = $body.find(`#${inputId}`)
        if ($input.length > 0) {
          cy.log(`Encontrado via for/id (${inputId})`)
          return cy.wrap($input)
        }
      }
      
      throw new Error(`Input não encontrado para label: "${label}"`)
    })
  },
  
  // Validações específicas
  validarMensagem: (texto) => {
    return cy.contains('.mensagem, .alert', texto, { timeout: 10000 })
      .should('be.visible')
  }
}
```

### Boas Práticas

1. **Logs claros:**
   ```javascript
   cy.log(`Executando ação: "${parametro}"`)
   cy.log('Elemento encontrado')
   cy.log('Validação concluída')
   ```

2. **Validações resilientes:**
   ```javascript
   cy.get('body').then($body => {
     const existe = $body.find('.elemento').length > 0
     if (existe) {
       // valida
     } else {
       cy.log('Elemento não encontrado (opcional)')
     }
   })
   ```

3. **Seletores flexíveis:**
   ```javascript
   // ✅ Aceita múltiplos elementos
   cy.contains('button, a', texto)
   
   // ✅ Timeout adequado
   cy.get('.elemento', { timeout: 10000 })
   
   // ✅ First para evitar ambiguidade
   cy.contains('button', 'Salvar').first()
   ```

4. **Waits estratégicos:**
   ```javascript
   cy.wait(500)   // Após ações rápidas
   cy.wait(1000)  // Após cliques em dropdowns
   cy.wait(1500)  // Após navegação entre abas
   cy.wait(2000)  // Após ações que disparam requests
   ```

---

## 🚀 Comandos e Execução

### Comandos Principais

```bash
# Instalação
npm install

# Configuração inicial (copiar .env.example para .env)
cp .env.example .env

# Modo interativo (Cypress UI)
npm run open

# Modo headless (CLI)
npm test

# Testes específicos
npm run test:login
npm run test:cessacao
npm run test:designacao
npm run test:api
```

### Scripts package.json

```json
{
  "scripts": {
    "open": "cypress open",
    "test": "cypress run",
    "test:login": "cypress run --spec 'cypress/e2e/ui/login.feature'",
    "test:cessacao": "cypress run --spec 'cypress/e2e/ui/cessacao.feature'",
    "test:api": "cypress run --spec 'cypress/e2e/api/*.feature'"
  }
}
```

---

## 📊 Relatórios e Evidências

### Screenshots

- Capturados automaticamente em falhas
- Salvos em `cypress/screenshots/`
- Ignorados pelo Git

### Vídeos

- Gerados em modo headless se `CYPRESS_VIDEO=true`
- Salvos em `cypress/videos/`
- Ignorados pelo Git

### Relatórios Allure

```bash
# Gerar relatório
npm run allure:report

# Abrir relatório
npm run allure:open
```

> ⚠️ Requer Java instalado (`JAVA_HOME` configurado)

---

## 🔄 Workflow de Desenvolvimento

### 1. Criar nova feature

```bash
# 1. Criar arquivo .feature
touch cypress/e2e/ui/nova_feature.feature

# 2. Criar locators
touch cypress/support/ui/locators/nova_feature_locators.js

# 3. Criar steps
touch cypress/support/step_definitions/ui/nova_feature_steps.js

# 4. Criar comandos específicos (se necessário)
touch cypress/support/ui/commands/commands_nova_feature.js
```

### 2. Escrever testes

1. **Feature:** Gherkin com cenários de negócio
2. **Locators:** Seletores organizados e reutilizáveis
3. **Steps:** Implementação dos passos Gherkin
4. **Commands:** Comandos customizados (se necessário)

### 3. Testar localmente

```bash
# Modo interativo (recomendado para desenvolvimento)
npm run open

# Modo headless (validação antes de commit)
npm test
```

### 4. Commit e Push

```bash
# Verificar status
git status

# GARANTIR que .env NÃO aparece
# Se aparecer: git reset HEAD .env

# Adicionar arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona testes de cessação de designação"

# Push
git push origin sua-branch
```

---

## 🛡️ Checklist de Segurança

Antes de fazer commit/push, **SEMPRE** verifique:

- [ ] `.env` não está sendo commitado
- [ ] `cypress/fixtures/usuarios.json` não contém credenciais reais
- [ ] Nenhuma senha ou token está hardcoded no código
- [ ] `.env.example` está atualizado (sem credenciais reais)
- [ ] Screenshots/vídeos com dados sensíveis foram excluídos

---

## 📚 Recursos e Referências

### Documentação Oficial

- [Cypress](https://docs.cypress.io/)
- [Cucumber](https://cucumber.io/docs/cucumber/)
- [Cypress Cucumber Preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor)

### Padrões BDD

- [Gherkin Best Practices](https://cucumber.io/docs/gherkin/reference/)
- [Writing Better Gherkin](https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/)

### Suporte

- Dúvidas técnicas: Contate o time de QA
- Credenciais: Solicite ao líder técnico
- Issues: Abra uma issue no repositório

---

## 📝 Notas Importantes

1. **Credenciais são responsabilidade individual** - Cada desenvolvedor deve ter suas próprias credenciais no `.env`

2. **Nunca compartilhe credenciais via chat/email** - Use canais seguros definidos pela organização

3. **Relatórios podem conter dados sensíveis** - Verifique antes de compartilhar screenshots

4. **Ambiente QA é compartilhado** - Evite executar testes massivos simultâneos

5. **Mantenha dependências atualizadas** - Execute `npm audit` periodicamente

---

**Última atualização:** Maio 2026  
**Mantido por:** Equipe QA - Projeto SIGNA
