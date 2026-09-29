// Slow-motion para execução local: delay antes de ações de interação pra
// tornar a execução observável a olho nu. Desativado no CI. Ajustável via
// --env slowMoMs=N (0 desativa).
const SLOW_MO_ATIVO = !Cypress.env('CI');
const SLOW_MO_MS = Number(Cypress.env('slowMoMs')) || 500;

const COMANDOS_COM_DELAY = ['click', 'dblclick', 'rightclick', 'type', 'clear', 'select', 'check', 'uncheck'];

if (SLOW_MO_ATIVO && SLOW_MO_MS > 0) {
  COMANDOS_COM_DELAY.forEach((comando) => {
    // Não usar cy.wait() aqui: um cy.xxx() independente durante a resolução
    // conflita com a fila de comandos do Cypress. setTimeout + Promise nativos
    // atrasam sem entrar nessa fila.
    Cypress.Commands.overwrite(comando, (originalFn, subject, ...args) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(originalFn(subject, ...args)), SLOW_MO_MS);
      });
    });
  });
}
