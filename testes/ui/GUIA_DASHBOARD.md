# Guia do Dashboard de Automação

Relatório HTML gerado localmente após rodar a suíte Cypress, mostrando o que passou, falhou e por quê — sem precisar reabrir o Cypress.

- **Gerador:** `scripts/gerar_dashboard_html.py`
- **Saída:** `cypress/reports/mochawesome/dashboard.html`

## Como gerar

1. Rode a suíte (ou uma spec só):
   ```bash
   npm run cy:run
   ```
2. Gere o dashboard:
   ```bash
   python scripts/gerar_dashboard_html.py
   ```
3. Abra o arquivo no navegador (dois cliques, sem servidor):
   ```
   cypress/reports/mochawesome/dashboard.html
   ```

## O que ele mostra

| Funcionalidade | O que faz |
|---|---|
| **Resumo geral** | Donuts de % de sucesso (Geral, UI, API) + total de cenários, quantos passaram/falharam e tempo total. |
| **Filtro por sistema** | Botões *Todas / UI / API* pra ver só um lado da suíte. |
| **Filtro por status** | Clique nos cards *Passaram*/*Falharam* do resumo pra listar só as features com aquele status. |
| **Filtro por feature** | Um menu com todas as features — escolher uma abre direto o card, sem rolar a página. |
| **Cards expansíveis** | Clique numa feature pra ver cada cenário, com badge de status, duração e, se falhou, a mensagem de erro real. |
| **Comparação** | Badge mostrando se melhorou ou piorou desde a última execução — vira gráfico de tendência com histórico suficiente. |
| **PR do GitHub** | Se a branch tiver um PR aberto, aparece um badge com status e revisão, com botão pra atualizar ao vivo. |

## Vale saber

- **O `dashboard.html` é commitado de propósito** — assim qualquer um vê o último resultado direto no PR, sem rodar a suíte.
- **Só roda local** — nunca é chamado pelo CI/Jenkins.
- **Serve pra outros projetos** — o título vem de `dashboard.config.json`, sem precisar mexer no script.
