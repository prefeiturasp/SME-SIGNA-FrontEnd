/**
 * Plugin do Cypress para configurações adicionais
 */

module.exports = (on, config) => {
  // Aqui você pode adicionar tasks personalizadas
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
    
    table(message) {
      console.table(message);
      return null;
    }
  });

  return config;
};
