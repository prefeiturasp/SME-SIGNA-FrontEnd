// ============================================================================
// CONFIGURAÇÕES DA API EOL - SME Integração
// ============================================================================
// Este arquivo é carregado pelo esbuild (contexto browser).
// NÃO usar process.env aqui — os valores vêm de Cypress.env() em runtime.
// As env vars são carregadas pelo cypress.config.js (Node.js) via dotenv.
//
// Adicione no .env:
//   API_EOL_KEY=7eee2750-89f4-4928-bb4e-52bad9a85efd
//   API_RF_LOGIN=7704941
// ============================================================================

const API_EOL_CONFIG = {
  BASE_URL: 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br',
  API_KEY_HEADER: 'x-api-eol-key',
  TIMEOUT: 30000,
}

module.exports = { API_EOL_CONFIG }
