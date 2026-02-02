module.exports = {
  projectId: '***REMOVED***',
  authToken: process.env.CURRENTS_KEY || '',
  recordKey: process.env.CURRENTS_RECORD_KEY || '',
  cloudServiceUrl: 'https://cy.currents.dev',
  
  // CI Build ID
  ciBuildId: process.env.CI_BUILD_ID || `local-${Date.now()}`,
  
  // Configurações adicionais
  parallel: false,
  record: false
};
