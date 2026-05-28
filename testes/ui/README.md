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

3. **⚠️ IMPORTANTE - Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais reais
```

> **🔐 SEGURANÇA:** O arquivo `.env` contém credenciais reais e **NUNCA** deve ser versionado. Ele está no `.gitignore` e será ignorado automaticamente pelo Git.

## 📚 Documentação Completa

Para padrões de desenvolvimento, convenções de código e boas práticas de segurança, consulte:

👉 **[PADRAO_PROJETO.md](./PADRAO_PROJETO.md)** - Guia completo do projeto

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
- `.env` - Variáveis de ambiente e credenciais
- `package.json` - Dependências e scripts

## 🔐 Segurança e Credenciais

### ⚠️ REGRAS CRÍTICAS

1. **NUNCA commite o arquivo `.env`**
   - Contém credenciais reais
   - Está no `.gitignore` e será ignorado automaticamente
   - Apenas o `.env.example` deve estar versionado

2. **Credenciais de teste**
   - Devem estar APENAS no arquivo `.env` local
   - Solicite credenciais ao líder técnico
   - Cada desenvolvedor deve ter suas próprias credenciais

3. **Antes de fazer commit:**
   ```bash
   # Sempre verifique:
   git status
   
   # Se .env aparecer na lista, PARE e execute:
   git reset HEAD .env
   ```

4. **Arquivos protegidos (não versionar):**
   - `.env` e variantes (`.env.local`, `.env.*.local`)
   - `cypress/fixtures/usuarios.json` com credenciais reais
   - Screenshots e vídeos com dados sensíveis
   - Relatórios com informações confidenciais

### 📋 Configuração de Credenciais

1. Copie o template:
   ```bash
   cp .env.example .env
   ```

2. Edite `.env` com suas credenciais:
   ```bash
   USERNAME=seu_rf_aqui
   PASSWORD=sua_senha_aqui
   ```

3. Verifique que `.env` está ignorado:
   ```bash
   git status
   # .env NÃO deve aparecer
   ```

Para mais detalhes, consulte **[PADRAO_PROJETO.md](./PADRAO_PROJETO.md)** seção "Gestão de Credenciais"

## 🤝 Contribuindo

1. Crie uma feature branch
2. Implemente suas alterações
3. **Verifique que nenhuma credencial foi exposta**
4. Execute os testes localmente
5. Submeta um Pull Request

## 📄 Licença

ISC
