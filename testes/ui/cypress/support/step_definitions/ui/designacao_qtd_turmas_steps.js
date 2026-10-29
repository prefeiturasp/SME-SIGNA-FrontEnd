// Step Definitions — Qtd. Turmas da unidade proponente (tarefa 159564)
import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { designacaoLocators, designacaoUrls } from '../../ui/locators/designacao_locators';

// Reaproveitados de outros arquivos:
//   • "que o usuário está autenticado no sistema" → common_steps.js

// Acesso direto pela URL: o proxy do front só exige o cookie auth_token, e
// entrar por "Nova designação" na listagem dispara o bug do polling que
// devolve para a lista (ver designacao_steps.js).
When('acessa a etapa {string} de uma nova designação', (etapa) => {
  cy.visit(designacaoUrls.novaDesignacaoPasso1);
  cy.url({ timeout: 40000 }).should('include', 'designacoes-passo-1');
  cy.contains('.ant-card-head', etapa, { timeout: 40000 }).should('be.visible');
});

// O combo de UE fica desabilitado (e vira um spinner) até a lista da DRE
// carregar; as opções vêm por portal, fora do <form>.
When('seleciona a DRE {string} e a UE {string} como unidade proponente', (dre, ue) => {
  cy.get(designacaoLocators.selectDRE, { timeout: 40000 })
    .should('be.visible')
    .click();
  cy.contains(designacaoLocators.opcoesDropdown, dre, { timeout: 15000 })
    .scrollIntoView()
    .click({ force: true });

  cy.get(designacaoLocators.selectUE, { timeout: 40000 })
    .should('be.visible')
    .and('not.be.disabled')
    .click();
  cy.get(designacaoLocators.buscaCombobox, { timeout: 10000 })
    .should('be.visible')
    .type(ue, { delay: 50 });
  cy.contains(designacaoLocators.opcoesDropdown, ue, { timeout: 15000 })
    .click({ force: true });

  cy.get(designacaoLocators.selectUE).should('contain.text', ue);
});

When('pesquisa a unidade proponente', () => {
  cy.get(designacaoLocators.selectUE)
    .closest('form')
    .find(designacaoLocators.botaoPesquisar)
    .should('be.visible')
    .and('not.be.disabled')
    .click();

  // GET /designacao/unidade/ consulta o EOL turma a turma: 5–20s em QA. O
  // painel só renderiza em caso de sucesso; em falha (ex.: EOL fora do ar →
  // 400 "Erro ao buscar funcionários da gestão escolar") o front mostra a
  // mensagem em [data-testid="login-error"] — falha já com ela, sem esperar
  // o timeout inteiro.
  cy.get('body', { timeout: 90000 })
    .should(($body) => {
      const terminou =
        $body.find('[data-testid="login-error"]').length > 0 ||
        $body.text().includes('Funcionários da unidade');
      expect(terminou, 'pesquisa da unidade proponente concluída').to.be.true;
    })
    .then(($body) => {
      const erro = $body.find('[data-testid="login-error"]').text().trim();
      expect(erro, 'erro exibido ao pesquisar a unidade proponente').to.be.empty;
    });
});

// InfoItem: <div><div><p>label</p>[ícone]</div><p>valor</p></div>
Then('o campo {string} deve exibir {string}', (label, valorEsperado) => {
  cy.contains('p', new RegExp(`^${Cypress._.escapeRegExp(label)}$`), { timeout: 30000 })
    .parent()
    .parent()
    .children('p')
    .should('have.text', valorEsperado);
});

// Duas evidências: o campo na tela e o modal "Detalhamento de turmas"
// (total, distribuição por turno/ciclo e SPI — mesma fonte do campo).
Then('registro a evidência da tela de designação', () => {
  cy.contains('p', /^Qtd\. Turmas$/).scrollIntoView({ offset: { top: -200, left: 0 } });
  cy.screenshot('evidencia_qtd_turmas', { capture: 'viewport' });

  cy.get(designacaoLocators.botaoVisualizarTurmas).click();
  cy.contains('[role="dialog"]', 'Detalhamento de turmas', { timeout: 10000 }).should('be.visible');
  cy.screenshot('evidencia_detalhamento_turmas', { capture: 'viewport' });
  cy.get('[role="dialog"] button[aria-label="Fechar modal"]').click();
});
