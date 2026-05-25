# SIGNA - Projeto de Automação de Testes

Projeto de automação de testes E2E para o sistema SIGNA utilizando Cypress + Cucumber (BDD).

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

## 🏃 Executando os Testes

### Modo Interativo (Cypress UI)
```bash
npm run open
```

### Modo Headless (CLI)
```bash
npm test
```

> Para gerar/abrir o HTML do Allure localmente (`allure:report`/`allure:open`), é necessário Java no ambiente (`JAVA_HOME` configurado).

### Executar testes específicos

**Login:**
```bash
npm run test:login
```

**Esqueci Senha:**
```bash
npm run test:esqueci-senha
```

**Alterar Senha:**
```bash
npm run test:alterar-senha
```

**Alteração de Email:**
```bash
npm run test:alteracao-email
```

### Executar em diferentes browsers
```bash
npm run test:chrome
npm run test:firefox
npm run test:edge
```

## 📂 Estrutura do Projeto

```
signa-automation/
├── cypress/
│   ├── e2e/
│   │   └── ui/
│   │       ├── login.feature
│   │       ├── esqueci_senha.feature
│   │       ├── alterar_senha.feature
│   │       └── alteracao_email.feature
│   ├── support/
│   │   ├── commands.js
│   │   ├── e2e.js
│   │   ├── commands_ui/
│   │   │   ├── commands_login.js
│   │   │   └── commands_globais.js
│   │   ├── locators/
│   │   │   ├── login_locators.js
│   │   │   ├── esqueci_senha_locators.js
│   │   │   ├── alterar_senha_locators.js
│   │   │   └── alterar_email_locators.js
│   │   └── step_definitions/
│   │       ├── common_steps.js
│   │       ├── login_steps.js
│   │       ├── esqueci_senha_steps.js
│   │       ├── alterar_senha_steps.js
│   │       └── alteracao_email_steps.js
│   └── fixtures/
├── cypress.config.js
├── package.json
└── README.md
```

## 🧪 Funcionalidades Cobertas

- ✅ Login
- ✅ Esqueci Senha
- ✅ Alterar Senha
- ✅ Alteração de Email

## 📊 Relatórios

Os relatórios de teste são gerados automaticamente após a execução em:
- `cypress/reports/` - Relatórios em HTML
- `allure-results/` - Resultados para Allure Report

Para gerar `allure-results` durante os testes:
```bash
npm run test:allure
```

Para visualizar o relatório Allure:
```bash
npm run allure:report
npm run allure:open
```

## 🔁 Jenkins (Esteira)

Para pipeline Jenkins com plugin Allure:

1. Instale dependências: `npm ci`
2. Execute testes com Allure: `npm run test:ci`
3. Publique o resultado Allure apontando para: `allure-results`

Exemplo de stage:

```groovy
stage('UI Tests') {
	steps {
		bat 'npm ci'
		bat 'npm run test:ci'
	}
	post {
		always {
			allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
		}
	}
}
```

## 🔧 Configuração

As configurações principais estão em:
- `cypress.config.js` - Configurações do Cypress
- `.env` - Variáveis de ambiente
- `package.json` - Dependências e scripts

## 📝 Credenciais de Teste

**Ambiente:** QA  
**URL:** https://qa-signa.sme.prefeitura.sp.gov.br  
**Usuário:** 7311559  
**Senha:** Sgp1559

## 🤝 Contribuindo

1. Crie uma feature branch
2. Implemente suas alterações
3. Execute os testes
4. Submeta um Pull Request

## 📄 Licença

ISC
