# SIGNA - Projeto de Automação de Testes

Projeto de automação de testes E2E para o sistema SIGNA utilizando Cypress + Cucumber (BDD).

## Pre-requisitos

- Node.js (versão 18 ou superior)
- npm

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. IMPORTANTE - Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais reais
```

> SEGURANÇA: O arquivo `.env` contém credenciais reais e NUNCA deve ser versionado. Ele está no `.gitignore` e será ignorado automaticamente pelo Git.

## Documentação Completa

Para padrões de desenvolvimento, convenções de código e boas práticas de segurança, consulte:

[PADRAO_PROJETO.md](./PADRAO_PROJETO.md) - Guia completo do projeto

## Executando os Testes

### Modo Interativo (Cypress UI)
```bash
npm run cy:open
```

### Modo Headless (CLI)
```bash
npm run cy:run
```

### Executar em diferentes browsers
```bash
npm run cy:run:chrome
npm run cy:run:firefox
```

> Para gerar/abrir o HTML do Allure localmente, é necessário Java no ambiente (`JAVA_HOME` configurado).

## Estrutura do Projeto

```
testes/ui/
├── cypress/
│   ├── e2e/
│   │   ├── api/
│   │   │   ├── api_abrangencia.feature
│   │   │   ├── api_acessos.feature
│   │   │   ├── api_autenticacao_sgp.feature
│   │   │   ├── api_cargo.feature
│   │   │   ├── api_cenarios_negativos.feature
│   │   │   ├── api_diretoria_regional.feature
│   │   │   ├── api_dre_codigo_dre.feature
│   │   │   ├── api_dre_escola.feature
│   │   │   ├── api_dre_escolas.feature
│   │   │   ├── api_dre_supervisores.feature
│   │   │   ├── api_dre_unidades.feature
│   │   │   └── api_dre_unidades_codigo_integracao.feature
│   │   └── ui/
│   │       ├── login.feature
│   │       ├── esqueci_senha.feature
│   │       ├── alterar_senha.feature
│   │       ├── alteracao_email.feature
│   │       ├── designacao.feature
│   │       ├── consulta_atos_adminstra.feature
│   │       ├── cessacao.feature
│   │       ├── apostilar.feature
│   │       └── insubsistente.feature
│   ├── support/
│   │   ├── e2e.js
│   │   ├── commands.js
│   │   ├── step_definitions/
│   │   │   ├── common_steps.js
│   │   │   ├── api/
│   │   │   │   ├── api_abrangencia_steps.js
│   │   │   │   ├── api_acessos_steps.js
│   │   │   │   ├── api_autenticacao_sgp_steps.js
│   │   │   │   ├── api_cargo_steps.js
│   │   │   │   ├── api_cenarios_negativos_steps.js
│   │   │   │   ├── api_diretoria_regional_steps.js
│   │   │   │   ├── api_dre_codigo_steps.js
│   │   │   │   ├── api_dre_escola_steps.js
│   │   │   │   ├── api_dre_escolas_steps.js
│   │   │   │   ├── api_dre_supervisores_steps.js
│   │   │   │   ├── api_dre_unidades_steps.js
│   │   │   │   └── api_eol_steps.js
│   │   │   └── ui/
│   │   │       ├── login_steps.js
│   │   │       ├── esqueci_senha_steps.js
│   │   │       ├── alterar_senha_steps.js
│   │   │       ├── alteracao_email_steps.js
│   │   │       ├── designacao_steps.js
│   │   │       ├── editar_designacao_steps.js
│   │   │       ├── cessacao_steps.js
│   │   │       ├── apostilar_steps.js
│   │   │       ├── insubsistente_steps.js
│   │   │       └── visualizar_steps.js
│   │   └── ui/
│   │       └── locators/
│   │           ├── login_locators.js
│   │           ├── esqueci_senha_locators.js
│   │           ├── alterar_senha_locators.js
│   │           ├── alterar_email_locators.js
│   │           ├── designacao_locators.js
│   │           ├── designacoes_locators.js
│   │           ├── editar_designacao_locators.js
│   │           ├── cessacao_locators.js
│   │           ├── apostilar_locators.js
│   │           ├── insubsistente_locators.js
│   │           ├── visualiza_designacao_locators.js
│   │           └── meusDados_locators.js
│   └── fixtures/
├── cypress.config.js
├── package.json
└── README.md
```

## Funcionalidades Cobertas

### UI

**Autenticacao**
- Login
- Esqueci Senha
- Alterar Senha
- Alteracao de Email

**Designacoes**
- Nova Designacao (fluxo Cargo Disponivel e Cargo Vago)
- Editar Designacao
- Cessacao de Designacao
- Apostilar Designacao (tipo Designacao e tipo Cessacao)
- Insubsistencia de Designacao
- Visualizar Designacao

### API

- Autenticacao SGP
- Abrangencia
- Acessos
- Cargo
- Diretoria Regional
- DRE - Codigo DRE
- DRE - Escola
- DRE - Escolas
- DRE - Supervisores
- DRE - Unidades
- DRE - Unidades por Codigo de Integracao
- Cenarios Negativos

## Relatorios

Os relatórios de teste são gerados automaticamente após a execução em:
- `cypress/reports/` - Relatórios em HTML (Mochawesome)
- `allure-results/` - Resultados para Allure Report

Para gerar relatório Allure:
```bash
npm run test:allure
```

Para visualizar o relatório Allure:
```bash
npm run allure:report
npm run allure:open
```

## Jenkins (Esteira CI)

Para pipeline Jenkins com plugin Allure:

1. Instale dependências: `npm ci`
2. Execute testes: `npm run cy:run`
3. Publique o resultado Allure apontando para: `allure-results`

Exemplo de stage:

```groovy
stage('UI Tests') {
    steps {
        bat 'npm ci'
        bat 'npm run cy:run'
    }
    post {
        always {
            allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
        }
    }
}
```

## Configuracao

As configurações principais estão em:
- `cypress.config.js` - Configurações do Cypress
- `.env` - Variáveis de ambiente e credenciais
- `package.json` - Dependências e scripts

## Seguranca e Credenciais

REGRAS CRITICAS

1. NUNCA commite o arquivo `.env`
   - Contém credenciais reais
   - Está no `.gitignore` e será ignorado automaticamente
   - Apenas o `.env.example` deve estar versionado

2. Credenciais de teste
   - Devem estar APENAS no arquivo `.env` local
   - Solicite credenciais ao líder técnico
   - Cada desenvolvedor deve ter suas próprias credenciais

3. Antes de fazer commit:
   ```bash
   # Sempre verifique:
   git status

   # Se .env aparecer na lista, PARE e execute:
   git reset HEAD .env
   ```

4. Arquivos protegidos (não versionar):
   - `.env` e variantes (`.env.local`, `.env.*.local`)
   - `cypress/fixtures/usuarios.json` com credenciais reais
   - Screenshots e vídeos com dados sensíveis
   - Relatórios com informações confidenciais

### Configuracao de Credenciais

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
   # .env NAO deve aparecer
   ```

Para mais detalhes, consulte [PADRAO_PROJETO.md](./PADRAO_PROJETO.md) seção "Gestão de Credenciais"

## Contribuindo

1. Crie uma feature branch
2. Implemente suas alterações
3. Verifique que nenhuma credencial foi exposta
4. Execute os testes localmente
5. Submeta um Pull Request

## Licenca

ISC
