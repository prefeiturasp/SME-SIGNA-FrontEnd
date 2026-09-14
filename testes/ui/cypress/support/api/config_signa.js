// ============================================================================
// CONFIGURAÇÕES DA API SIGNA (backend próprio da aplicação)
// ============================================================================
// Diferente da API EOL (config.js/commands.js): este é o backend que a
// própria aplicação SIGNA consome (Next.js server actions em src/actions/*.ts
// do front-end), autenticado via JWT (POST /api/usuario/login), não por
// x-api-eol-key. Reaproveita as MESMAS credenciais já usadas para login via
// UI (Cypress.env('username')/Cypress.env('password'), vindas de
// SIGNA_USERNAME/SIGNA_PASSWORD no .env) — nenhuma variável nova necessária.
//
// Swagger: https://qa-signa.sme.prefeitura.sp.gov.br/api/docs/#/
// ============================================================================

const SIGNA_API_CONFIG = {
  BASE_URL: 'https://qa-signa.sme.prefeitura.sp.gov.br/api',
  TIMEOUT: 60000,
}

module.exports = { SIGNA_API_CONFIG }
