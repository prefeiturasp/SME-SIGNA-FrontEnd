module.exports = {
  projectId: 'SME-SIGNA',
  authToken: process.env.CURRENTS_KEY || '',
  recordKey: process.env.CURRENTS_RECORD_KEY || '',
  cloudServiceUrl: 'http://10.50.1.202:1234',
  
  // CI Build ID
  ciBuildId: process.env.CI_BUILD_ID || `local-${Date.now()}`,
  
  // Configurações adicionais
  parallel: false,
  record: false
};
