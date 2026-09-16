// ============================================================================
// CONFIGURAÇÕES DA API SIGNA (backend próprio da aplicação)
// ============================================================================
// Autenticado via JWT (POST /api/usuario/login), não x-api-eol-key. Reaproveita
// as mesmas credenciais do login via UI (SIGNA_USERNAME/SIGNA_PASSWORD).
// Swagger: https://qa-signa.sme.prefeitura.sp.gov.br/api/docs/#/

const SIGNA_API_CONFIG = {
  BASE_URL: 'https://qa-signa.sme.prefeitura.sp.gov.br/api',
  TIMEOUT: 60000,
}

module.exports = { SIGNA_API_CONFIG }
