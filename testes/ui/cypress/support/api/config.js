// ============================================================================
// CONFIGURAÇÕES DA API EOL - SME Integração
// ============================================================================
// Carregado pelo esbuild (contexto browser) — não usar process.env aqui, os
// valores vêm de Cypress.env() em runtime (dotenv via cypress.config.js).
// Adicione no .env: API_EOL_KEY=<sua-chave-aqui>

const API_EOL_CONFIG = {
  BASE_URL: 'https://qa-smeintegracaoapi.sme.prefeitura.sp.gov.br',
  API_KEY_HEADER: 'x-api-eol-key',
  TIMEOUT: 30000,
}

module.exports = { API_EOL_CONFIG }
