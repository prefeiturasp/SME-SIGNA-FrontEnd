# Configuração de Credenciais

## ⚠️ IMPORTANTE - Segurança

As credenciais **NÃO** devem ser commitadas no repositório. Este projeto utiliza arquivos de exemplo que devem ser copiados e configurados localmente.

## Passo a Passo para Configurar

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e substitua os valores de exemplo pelas suas credenciais reais:

```env
USERNAME=SEU_RF_AQUI
PASSWORD=SUA_SENHA_AQUI
```

### 2. Configurar Fixtures de Usuários

Copie o arquivo de exemplo:

```bash
cp cypress/fixtures/usuarios.example.json cypress/fixtures/usuarios.json
```

Edite o arquivo `cypress/fixtures/usuarios.json` e configure os dados reais:

```json
{
  "users": [
    {
      "rf": "SEU_RF_AQUI",
      "cpf": "SEU_CPF_AQUI",
      "senha": "SUA_SENHA_AQUI",
      "nome": "Nome do Usuário",
      "email": "seu.email@sme.prefeitura.sp.gov.br",
      "perfil": "Administrador"
    }
  ]
}
```

## Arquivos Ignorados pelo Git

Os seguintes arquivos contêm credenciais e estão no `.gitignore`:

- `.env`
- `cypress/fixtures/usuarios.json`
- `cypress/e2e/ui/alteracao_email.feature`
- `cypress/support/step_definitions/alteracao_email_steps.js`

## ✅ Boas Práticas

- ✅ Nunca commite arquivos com credenciais reais
- ✅ Use os arquivos `.example` como referência
- ✅ Mantenha suas credenciais locais apenas
- ✅ Verifique o `.gitignore` antes de fazer commit
- ✅ Use variáveis de ambiente para dados sensíveis

## 🔒 Segurança

Se você acidentalmente commitou credenciais:

1. Altere as senhas imediatamente
2. Remova o arquivo do histórico do Git
3. Force push (com cuidado) ou crie uma nova branch
