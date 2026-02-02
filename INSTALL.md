# Guia de Instalação

Este guia irá ajudá-lo a configurar o ambiente de testes.

## Pré-requisitos

### 1. Node.js
Baixe e instale o Node.js (versão 16 ou superior):
- **Windows**: https://nodejs.org/
- **Linux**: `sudo apt install nodejs npm`
- **Mac**: `brew install node`

Verifique a instalação:
```bash
node --version
npm --version
```

### 2. Git (Opcional)
Para clonar o repositório:
- **Windows**: https://git-scm.com/download/win
- **Linux**: `sudo apt install git`
- **Mac**: `brew install git`

## Instalação do Projeto

### 1. Clone ou Baixe o Projeto
```bash
# Via Git
git clone <url-do-repositorio>
cd signa-automation

# Ou baixe o ZIP e extraia
```

### 2. Instale as Dependências
```bash
npm install
```

Isso instalará:
- Cypress
- Cucumber
- Allure Report
- Outras dependências necessárias

### 3. Configure o Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env se necessário (opcional)
```

## Verificação da Instalação

### 1. Teste Rápido
```bash
npm run open
```

Isso deve abrir a interface do Cypress.

### 2. Execute um Teste
```bash
npm run test:login
```

## Troubleshooting

### Erro: "cypress is not recognized"
```bash
# Reinstale as dependências
rm -rf node_modules
npm install
```

### Erro de Permissão (Linux/Mac)
```bash
# Torne o script executável
chmod +x run-tests.sh
```

### Cypress não abre
```bash
# Limpe o cache do Cypress
npx cypress cache clear
npx cypress install
```

### Erro de Memória
```bash
# Aumente o limite de memória do Node
export NODE_OPTIONS=--max_old_space_size=4096
npm test
```

## Estrutura de Pastas

Após a instalação, você terá:
```
signa-automation/
├── node_modules/        # Dependências (gerado)
├── cypress/            # Testes e suporte
├── cypress.config.js   # Configuração do Cypress
├── package.json        # Dependências e scripts
├── .env               # Variáveis de ambiente (criar)
└── README.md          # Documentação
```

## Próximos Passos

1. Leia o [README.md](README.md) para entender o projeto
2. Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para contribuir
3. Execute os testes: `npm test`

## Suporte

Se encontrar problemas:
1. Verifique a seção de Troubleshooting
2. Consulte a [documentação do Cypress](https://docs.cypress.io)
3. Abra uma Issue no projeto
