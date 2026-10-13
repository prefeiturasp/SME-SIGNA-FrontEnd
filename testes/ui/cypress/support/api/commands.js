const { API_EOL_CONFIG } = require('./config')

// ============================================================================
// AUTENTICAÇÃO EOL
// ============================================================================
// x-api-eol-key como mecanismo de autenticação (não JWT) — vem do secret
// "cypress_env_signa" no Jenkins (CI) ou do .env local.

Cypress.Commands.add('api_autenticar', () => {
  const isCI = Cypress.env('CI')
  const apiKey = Cypress.env('API_EOL_KEY')

  if (!apiKey) {
    const msg = isCI
      ? '❌ [CI] API_EOL_KEY não configurada na esteira! ' +
        'Verifique o secret "cypress_env_signa" no Jenkins (deve conter API_EOL_KEY=<chave>)'
      : '❌ [Local] API_EOL_KEY não configurada! ' +
        'Verifique o arquivo .env (API_EOL_KEY=<chave>)'
    throw new Error(msg)
  }

  Cypress.env('authToken', apiKey)
  Cypress.log({
    name: 'Autenticação EOL',
    message: `API Key configurada com sucesso [${isCI ? 'CI/Jenkins' : 'local'}]`,
  })
  return cy.wrap(apiKey)
})

// ============================================================================
// REQUISIÇÕES HTTP
// ============================================================================

Cypress.Commands.add('api_request', (method, path, options = {}) => {
  const apiKey = Cypress.env('authToken') || Cypress.env('API_EOL_KEY')
  const baseUrl = Cypress.env('API_EOL_BASE_URL') || API_EOL_CONFIG.BASE_URL
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`

  Cypress.log({ name: method, message: `${path}` })

  return cy.request({
    method,
    url,
    headers: {
      'x-api-eol-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    failOnStatusCode: false,
    timeout: API_EOL_CONFIG.TIMEOUT,
    ...options,
  })
})

Cypress.Commands.add('api_get', (path, options = {}) => {
  return cy.api_request('GET', path, options)
})

Cypress.Commands.add('api_post', (path, body = {}, options = {}) => {
  return cy.api_request('POST', path, { ...options, body })
})
