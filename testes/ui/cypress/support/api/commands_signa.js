const { SIGNA_API_CONFIG } = require('./config_signa')
const { RF_POOL, montarPayloadDesignacao } = require('../utils/dados_designacao')

// ============================================================================
// AUTENTICAÇÃO SIGNA (backend próprio, JWT)
// ============================================================================
// POST /api/usuario/login com {username, password} devolve {token, name,
// email, cpf} (confirmado em src/actions/login.ts). O token é usado depois
// como header Authorization: Bearer <token> (confirmado em
// src/actions/cadastro-designacao.ts e demais actions de designação).
//
// Reaproveita as credenciais já usadas pelo login via UI:
//   Cypress.env('username') / Cypress.env('password')
//   (carregadas de SIGNA_USERNAME/SIGNA_PASSWORD no .env — ver cypress.config.js)
// ============================================================================

Cypress.Commands.add('signa_api_autenticar', () => {
  const username = Cypress.env('username')
  const password = Cypress.env('password')

  if (!username || !password) {
    throw new Error(
      '❌ SIGNA_USERNAME/SIGNA_PASSWORD não configurados! Verifique o arquivo .env (local) ou o secret da esteira (CI).'
    )
  }

  const baseUrl = Cypress.env('SIGNA_API_BASE_URL') || SIGNA_API_CONFIG.BASE_URL

  return cy
    .request({
      method: 'POST',
      url: `${baseUrl}/usuario/login`,
      body: { username, password },
      timeout: SIGNA_API_CONFIG.TIMEOUT,
      failOnStatusCode: false,
    })
    .then((res) => {
      if (res.status !== 200 || !res.body?.token) {
        throw new Error(
          `❌ Falha ao autenticar na API SIGNA (HTTP ${res.status}). Verifique as credenciais em SIGNA_USERNAME/SIGNA_PASSWORD.`
        )
      }

      Cypress.env('signaAuthToken', res.body.token)
      Cypress.log({
        name: 'Autenticação SIGNA',
        message: `Token JWT obtido com sucesso para "${res.body.name || username}"`,
      })
      return cy.wrap(res.body.token)
    })
})

// ============================================================================
// REQUISIÇÕES HTTP — API SIGNA
// ============================================================================

Cypress.Commands.add('signa_api_request', (method, path, options = {}) => {
  const token = Cypress.env('signaAuthToken')
  const baseUrl = Cypress.env('SIGNA_API_BASE_URL') || SIGNA_API_CONFIG.BASE_URL
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`

  // sem-autenticação: options.semToken === true omite o header Authorization
  // (usado pelos cenários negativos de "sem token")
  const semToken = options.semToken === true
  const { semToken: _omitido, headers, ...restOptions } = options

  Cypress.log({ name: method, message: `${path}${semToken ? ' (sem token)' : ''}` })

  return cy.request({
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(semToken ? {} : { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    failOnStatusCode: false,
    timeout: SIGNA_API_CONFIG.TIMEOUT,
    ...restOptions,
  })
})

Cypress.Commands.add('signa_api_get', (path, options = {}) => {
  return cy.signa_api_request('GET', path, options)
})

Cypress.Commands.add('signa_api_post', (path, body = {}, options = {}) => {
  return cy.signa_api_request('POST', path, { ...options, body })
})

Cypress.Commands.add('signa_api_patch', (path, body = {}, options = {}) => {
  return cy.signa_api_request('PATCH', path, { ...options, body })
})

Cypress.Commands.add('signa_api_delete', (path, options = {}) => {
  return cy.signa_api_request('DELETE', path, options)
})

// ============================================================================
// ORQUESTRAÇÃO — designação "de apoio" para testes de cessação/apostila/
// insubsistência (todas dependem de um ato_pai/designação já existente).
// ============================================================================
// POST /designacao/servidor é instável em QA (500/timeout transitórios para
// RFs válidos — mesmo comportamento já tratado com retry na suíte de UI).
// Tenta cada RF do pool até obter 200.

Cypress.Commands.add('signa_buscar_servidor_valido', () => {
  const tentar = (indice) => {
    if (indice >= RF_POOL.length) {
      throw new Error(
        `❌ Nenhum RF do pool retornou servidor válido (200): [${RF_POOL.join(', ')}]`
      )
    }

    return cy.signa_api_post('/designacao/servidor', { rf: RF_POOL[indice] }).then((res) => {
      if (res.status === 200) {
        Cypress.log({ name: 'POST', message: `servidor RF ${RF_POOL[indice]} → HTTP ${res.status}` })
        return cy.wrap(res.body)
      }
      Cypress.log({
        name: 'POST (retry)',
        message: `servidor RF ${RF_POOL[indice]} → HTTP ${res.status}, tentando próximo RF do pool`,
      })
      return tentar(indice + 1)
    })
  }

  return tentar(0)
})

// Cria uma designação real em QA para servir de ato_pai a um teste de
// cessação/apostila/insubsistência, e devolve o corpo criado (com "id").
// Quem chama é responsável por excluí-la ao final via
// cy.signa_excluir_designacao_de_apoio — ver hook de cleanup de segurança em
// api_designacao_apoio_steps.js.
Cypress.Commands.add('signa_criar_designacao_de_apoio', () => {
  return cy.signa_buscar_servidor_valido().then((servidor) => {
    const payload = montarPayloadDesignacao(servidor)
    return cy.signa_api_post('/designacao/designacoes/', payload).then((res) => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(
          `❌ Falha ao criar designação de apoio (HTTP ${res.status}): ${JSON.stringify(res.body)}`
        )
      }
      Cypress.env('designacaoApoioId', res.body.id)
      Cypress.log({ name: 'Designação de apoio', message: `criada com id ${res.body.id}` })
      return cy.wrap(res.body)
    })
  })
})

Cypress.Commands.add('signa_excluir_designacao_de_apoio', () => {
  const id = Cypress.env('designacaoApoioId')
  if (!id) return cy.wrap(null)

  return cy.signa_api_delete(`/designacao/designacoes/${id}/`).then((res) => {
    Cypress.env('designacaoApoioId', null)
    Cypress.log({ name: 'Designação de apoio', message: `${id} excluída (HTTP ${res.status})` })
    return cy.wrap(res)
  })
})
