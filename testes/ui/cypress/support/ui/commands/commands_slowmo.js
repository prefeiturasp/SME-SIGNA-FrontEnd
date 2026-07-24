// Slow-motion para execução local (headed): insere um pequeno delay antes das
// principais ações de interação (click, type, clear, select, check, uncheck)
// para tornar a execução observável a olho nu no navegador.
//
// Desativado automaticamente no CI (onde velocidade importa mais que
// observação visual). Ajustável via variável de ambiente Cypress "slowMoMs"
// (ex.: --env slowMoMs=800) ou variável de sistema CYPRESS_slowMoMs=800.
// Para desativar completamente: --env slowMoMs=0.

const SLOW_MO_ATIVO = !Cypress.env('CI');
const SLOW_MO_MS = Number(Cypress.env('slowMoMs')) || 500;

const COMANDOS_COM_DELAY = ['click', 'dblclick', 'rightclick', 'type', 'clear', 'select', 'check', 'uncheck'];

if (SLOW_MO_ATIVO && SLOW_MO_MS > 0) {
  COMANDOS_COM_DELAY.forEach((comando) => {
    // IMPORTANTE: não usar `cy.wait()` aqui dentro. Comandos de ação (clear,
    // type, check...) têm retry-ability implementada via Promise interna do
    // Cypress; invocar um `cy.xxx()` independente durante a resolução desse
    // comando conflita com a fila de comandos e quebra com o erro "returned a
    // promise from a command while also invoking cy commands in that promise".
    // setTimeout + Promise nativos atrasam a chamada sem entrar na fila do cy.
    Cypress.Commands.overwrite(comando, (originalFn, subject, ...args) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(originalFn(subject, ...args)), SLOW_MO_MS);
      });
    });
  });
}
