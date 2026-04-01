# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-01-09

### Adicionado
- Estrutura inicial do projeto de automação
- Configuração do Cypress com Cucumber
- Feature de Login
  - Login com sucesso usando RF
  - Validação de credenciais inválidas
  - Validação de campos obrigatórios
  - Visualizar/ocultar senha
  - Logout do sistema
- Feature de Recuperação de Senha
  - Solicitar recuperação com RF válido
  - Validação de RF inválido
  - Limite de tentativas
  - Validação de formato
- Feature de Alteração de Senha
  - Alterar senha com sucesso
  - Validação de senha atual incorreta
  - Validação de confirmação diferente
  - Indicador de força da senha
  - Validação de requisitos de segurança
- Feature de Alteração de E-mail
  - Alterar e-mail com sucesso
  - Validação de confirmação diferente
  - Validação de formato de e-mail
  - Validação de domínio corporativo
  - E-mail de confirmação
- Locators para todas as features
- Step definitions compartilhados e específicos
- Comandos customizados reutilizáveis
- Configuração de ambiente (QA)
- Documentação completa (README, CONTRIBUTING, GHERKIN_SYNTAX_CHECKLIST)
- Configuração de relatórios (Allure, Mochawesome)

### Configurado
- URL base: https://qa-signa.sme.prefeitura.sp.gov.br
- Credenciais padrão: RF 7311559 / Senha Sgp1559
- Viewport: 1920x1080
- Timeout: 10s (comandos), 60s (page load)
- Retry: 1 tentativa em modo headless

### Dependências
- cypress: ^13.6.0
- @badeball/cypress-cucumber-preprocessor: ^20.0.0
- @bahmutov/cypress-esbuild-preprocessor: ^2.2.0
- allure-cypress: ^2.54.0
- cypress-mochawesome-reporter: ^3.8.0

[1.0.0]: https://github.com/seu-usuario/signa-automation/releases/tag/v1.0.0
