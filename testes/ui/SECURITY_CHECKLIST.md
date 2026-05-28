# 🛡️ Checklist de Segurança - Projeto SIGNA

## ⚠️ Antes de Fazer Commit/Push

### Verificação Obrigatória

Execute **SEMPRE** antes de commitar:

```bash
# 1. Verifique o status do Git
git status

# 2. Procure por arquivos sensíveis
git diff --cached

# 3. Se encontrar .env ou credenciais, remova:
git reset HEAD .env
git reset HEAD cypress/fixtures/usuarios.json
```

---

## ✅ Checklist Completo

### 📁 Arquivos e Credenciais

- [ ] **`.env` NÃO está sendo commitado**
  - Verifique: `git status` não deve mostrar `.env`
  - Se aparecer: `git reset HEAD .env`

- [ ] **`cypress/fixtures/usuarios.json` não contém credenciais reais**
  - Deve conter apenas estrutura ou dados de exemplo
  - Credenciais reais devem estar no `.env`

- [ ] **Nenhum arquivo com credenciais hardcoded**
  ```bash
  # Busque por possíveis exposições:
  grep -r "PASSWORD=" cypress/
  grep -r "senha.*=" cypress/
  grep -r "7311559" cypress/
  ```

- [ ] **`.env.example` está atualizado**
  - Contém todas as variáveis necessárias
  - **SEM** valores reais (apenas placeholders)

### 🔍 Código e Logs

- [ ] **Nenhuma senha/token hardcoded no código**
  ```javascript
  // ❌ ERRADO
  const password = '123456'
  
  // ✅ CORRETO
  const password = Cypress.env('PASSWORD')
  ```

- [ ] **Nenhum `console.log` com dados sensíveis**
  ```javascript
  // ❌ ERRADO
  console.log('Senha:', password)
  
  // ✅ CORRETO
  cy.log('Login executado com sucesso')
  ```

- [ ] **Cypress.env() sendo usado para credenciais**
  ```javascript
  // ✅ CORRETO
  Cypress.env('USERNAME')
  Cypress.env('PASSWORD')
  ```

### 📸 Evidências e Relatórios

- [ ] **Screenshots não contêm dados sensíveis visíveis**
  - Verifique em `cypress/screenshots/`
  - Se houver, delete antes de compartilhar

- [ ] **Vídeos não mostram credenciais sendo digitadas**
  - Verifique em `cypress/videos/`
  - Considere desabilitar: `CYPRESS_VIDEO=false`

- [ ] **Relatórios não expõem informações confidenciais**
  - Allure reports podem conter dados sensíveis
  - Revise antes de compartilhar

### 🔧 Configuração

- [ ] **`.gitignore` está completo**
  ```gitignore
  # Credenciais
  .env
  .env.local
  .env.*.local
  cypress.env.json
  cypress/fixtures/usuarios.json
  
  # Evidências
  cypress/screenshots/
  cypress/videos/
  allure-results/
  allure-report/
  ```

- [ ] **Variáveis de ambiente configuradas corretamente**
  - `.env` existe e está preenchido
  - Não há erro ao executar testes

### 📝 Documentação

- [ ] **README.md não contém credenciais**
  - Sem usuários/senhas reais
  - Apenas referências ao `.env`

- [ ] **Comentários no código não expõem senhas/tokens**
  ```javascript
  // ❌ ERRADO
  // Usar senha: Sgp1559
  
  // ✅ CORRETO
  // Senha configurada via .env
  ```

---

## 🚨 Se Você Commitou Credenciais Acidentalmente

### ⚠️ AÇÃO IMEDIATA

1. **Remova o arquivo do commit:**
   ```bash
   git rm --cached .env
   git commit -m "Remove credenciais expostas"
   git push
   ```

2. **Troque as credenciais comprometidas:**
   - Solicite novas credenciais ao líder técnico
   - Atualize seu `.env` local
   - **NUNCA** reutilize credenciais expostas

3. **Limpe o histórico do Git (se necessário):**
   ```bash
   # ⚠️ Atenção: isso reescreve o histórico
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

4. **Notifique o time:**
   - Informe imediatamente o líder técnico
   - Documente o incidente
   - Aprenda com o erro para evitar repetição

---

## 🔄 Verificação Automatizada

### Script de Pre-commit

Crie `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Verifica se .env está sendo commitado
if git diff --cached --name-only | grep -q "^.env$"; then
  echo "❌ ERRO: Tentativa de commit do arquivo .env bloqueada!"
  echo "O arquivo .env contém credenciais e não deve ser versionado."
  echo ""
  echo "Execute: git reset HEAD .env"
  exit 1
fi

# Busca por possíveis credenciais hardcoded
if git diff --cached | grep -iE "(password|senha|token|api_key|secret).*=.*['\"][^'\"]{6,}"; then
  echo "⚠️  AVISO: Possível credencial detectada no código!"
  echo "Revise suas alterações antes de commitar."
  echo ""
  read -p "Deseja continuar mesmo assim? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ Verificação de segurança concluída"
exit 0
```

Torne executável:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 📋 Revisão Periódica

### Mensal

- [ ] Auditar commits recentes por exposição acidental
- [ ] Verificar se `.gitignore` está completo
- [ ] Revisar permissões de acesso ao repositório

### Trimestral

- [ ] Rotacionar credenciais de teste
- [ ] Atualizar documentação de segurança
- [ ] Treinar time sobre boas práticas

### Anual

- [ ] Auditoria completa de segurança
- [ ] Revisar e atualizar políticas
- [ ] Avaliar ferramentas de segurança

---

## 📚 Recursos

### Ferramentas de Detecção

- **git-secrets:** Previne commits com credenciais
  ```bash
  git secrets --install
  git secrets --register-aws
  ```

- **truffleHog:** Detecta credenciais no histórico
  ```bash
  trufflehog git file://. --json
  ```

### Links Úteis

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

---

## 📞 Contatos de Emergência

**Exposição de credenciais:**
- Líder Técnico: [contato]
- Segurança da Informação: [contato]

**Dúvidas sobre segurança:**
- Time de QA: [contato]

---

**Lembre-se:** A segurança é responsabilidade de todos! 🛡️

**Última atualização:** Maio 2026
