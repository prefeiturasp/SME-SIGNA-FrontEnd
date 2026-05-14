import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

// Função auxiliar para selecionar DRE aleatória
function obterDREAleatoria(dres) {
  const indiceAleatorio = Math.floor(Math.random() * dres.length)
  return dres[indiceAleatorio]
}

// ---------------------------------------------
// When steps - /unidades
// ---------------------------------------------

When('eu busco as unidades da DRE aleatória', () => {
  cy.get('@codigoDREAleatorio').then((codigoDRE) => {
    const path = `/api/DREs/${codigoDRE}/unidades`

    cy.api_get(path).then((res) => {
      cy.wrap(res).as('response')
      cy.wrap(codigoDRE).as('codigoDREEnviado')
      Cypress.log({
        name: 'GET Unidades',
        message: `${path} (aleatório) ? HTTP ${res.status}`,
      })
    })
  })
})

When('eu busco as unidades da DRE com código {string}', (codigoDRE) => {
  const path = `/api/DREs/${codigoDRE}/unidades`

  cy.api_get(path).then((res) => {
    cy.wrap(res).as('response')
    cy.wrap(codigoDRE).as('codigoDREEnviado')
    Cypress.log({
      name: 'GET Unidades',
      message: `${path} ? HTTP ${res.status}`,
    })
  })
})

When('eu busco as unidades da DRE com código {string} sem token', (codigoDRE) => {
  const baseURL = 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br'
  const path = `/api/DREs/${codigoDRE}/unidades`

  cy.request({
    method: 'GET',
    url: `${baseURL}${path}`,
    failOnStatusCode: false,
    headers: { 'accept': 'application/json' },
  }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({
      name: 'GET Unidades (sem token)',
      message: `${path} ? HTTP ${res.status}`,
    })
  })
})

// ---------------------------------------------
// When steps - /unidades/codigo-integracao
// ---------------------------------------------

When('eu busco as unidades com código de integração da DRE aleatória', () => {
  cy.get('@codigoDREAleatorio').then((codigoDRE) => {
    const path = `/api/DREs/${codigoDRE}/unidades/codigo-integracao`

    cy.api_get(path).then((res) => {
      cy.wrap(res).as('response')
      cy.wrap(codigoDRE).as('codigoDREEnviado')
      Cypress.log({
        name: 'GET Unidades Integração',
        message: `${path} (aleatório ${codigoDRE}) ? HTTP ${res.status} | ${Array.isArray(res.body) ? res.body.length : 0} itens`,
      })
    })
  })
})

When('eu busco as unidades com código de integração da DRE com código {string}', (codigoDRE) => {
  const path = `/api/DREs/${codigoDRE}/unidades/codigo-integracao`

  cy.api_get(path).then((res) => {
    cy.wrap(res).as('response')
    cy.wrap(codigoDRE).as('codigoDREEnviado')
    Cypress.log({
      name: 'GET Unidades Integração',
      message: `${path} ? HTTP ${res.status} | ${Array.isArray(res.body) ? res.body.length : 0} itens`,
    })
  })
})

When('eu busco as unidades com código de integração da DRE com código {string} sem token', (codigoDRE) => {
  const baseURL = 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br'
  const path = `/api/DREs/${codigoDRE}/unidades/codigo-integracao`

  cy.request({
    method: 'GET',
    url: `${baseURL}${path}`,
    failOnStatusCode: false,
    headers: { 'accept': 'application/json' },
  }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({
      name: 'GET Unidades Integração (sem token)',
      message: `${path} ? HTTP ${res.status}`,
    })
  })
})

// ---------------------------------------------
// Then steps - /unidades
// ---------------------------------------------

Then('a resposta das unidades deve ser um array', () => {
  cy.get('@response').then((res) => {
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    Cypress.log({
      name: 'Validação',
      message: `Array com ${res.body.length} unidade(s)`,
    })
  })
})

// ---------------------------------------------
// Then steps - /unidades/codigo-integracao
// ---------------------------------------------

Then('a resposta deve ser um array não vazio de unidades', () => {
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    expect(res.body.length, 'Array deve ter pelo menos uma unidade').to.be.greaterThan(0)
    Cypress.log({
      name: 'Validação',
      message: `Array com ${res.body.length} unidade(s)`,
    })
  })
})

Then('cada unidade deve ter os campos obrigatórios de integração:', (dataTable) => {
  const campos = dataTable.rawTable.slice(1).map((row) => row[0])

  cy.get('@response').then((res) => {
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    expect(res.body.length, 'Array não deve estar vazio').to.be.greaterThan(0)

    res.body.forEach((unidade, idx) => {
      campos.forEach((campo) => {
        expect(
          unidade,
          `Unidade ${idx}: Campo "${campo}" é obrigatório`
        ).to.have.property(campo)
      })
    })

    Cypress.log({
      name: 'Validação Campos',
      message: `${campos.join(', ')} presentes em ${res.body.length} unidade(s)`,
    })
  })
})

Then('os tipos dos campos das unidades devem estar corretos', () => {
  cy.get('@response').then((res) => {
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    expect(res.body.length, 'Array não deve estar vazio').to.be.greaterThan(0)

    res.body.forEach((unidade, idx) => {
      expect(
        typeof unidade.codigoUe,
        `Unidade ${idx}: codigoUe deve ser string`
      ).to.equal('string')
      expect(
        unidade.codigoUe.trim().length > 0,
        `Unidade ${idx}: codigoUe não deve estar vazio`
      ).to.be.true

      expect(
        typeof unidade.nomeUe,
        `Unidade ${idx}: nomeUe deve ser string`
      ).to.equal('string')
      expect(
        unidade.nomeUe.trim().length > 0,
        `Unidade ${idx}: nomeUe não deve estar vazio`
      ).to.be.true

      // codigoIntegracao pode ser null ou string
      const tipoIntegracao = typeof unidade.codigoIntegracao
      expect(
        ['string', 'object'].includes(tipoIntegracao),
        `Unidade ${idx}: codigoIntegracao deve ser string ou null`
      ).to.be.true
      if (unidade.codigoIntegracao !== null) {
        expect(
          tipoIntegracao,
          `Unidade ${idx}: codigoIntegracao quando preenchido deve ser string`
        ).to.equal('string')
      }
    })

    Cypress.log({
      name: 'Validação Tipos',
      message: `Tipos validados em ${res.body.length} unidade(s)`,
    })
  })
})

Then('os campos codigoUe e nomeUe de todas as unidades devem ser preenchidos', () => {
  cy.get('@response').then((res) => {
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true

    res.body.forEach((unidade, idx) => {
      expect(
        unidade.codigoUe && unidade.codigoUe.trim().length > 0,
        `Unidade ${idx}: codigoUe deve ser preenchido`
      ).to.be.true
      expect(
        unidade.nomeUe && unidade.nomeUe.trim().length > 0,
        `Unidade ${idx}: nomeUe deve ser preenchido`
      ).to.be.true
    })

    const semIntegracao = res.body.filter((u) => u.codigoIntegracao === null).length
    Cypress.log({
      name: 'Validação Preenchimento',
      message: `codigoUe e nomeUe preenchidos | ${semIntegracao} unidade(s) sem codigoIntegracao (null permitido)`,
    })
  })
})

Then('a resposta deve conter pelo menos {int} unidades', (minimo) => {
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    expect(
      res.body.length,
      `Deve haver pelo menos ${minimo} unidades`
    ).to.be.gte(minimo)

    Cypress.log({
      name: 'Validação Quantidade',
      message: `${res.body.length} unidades (mínimo: ${minimo})`,
    })
  })
})

Then('a resposta deve conter uma unidade com código {string} e nome contendo {string}', (codigoUeEsperado, nomeContendo) => {
  cy.get('@response').then((res) => {
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true

    const unidade = res.body.find((u) => u.codigoUe === codigoUeEsperado)
    expect(unidade, `Unidade com codigoUe "${codigoUeEsperado}" não encontrada`).to.exist
    expect(
      unidade.nomeUe.toUpperCase(),
      `Nome deve conter "${nomeContendo}"`
    ).to.include(nomeContendo.toUpperCase())

    Cypress.log({
      name: 'Validação Unidade',
      message: `codigoUe ${codigoUeEsperado}: ${unidade.nomeUe}`,
    })
  })
})

Then('os códigos de UE devem ser únicos na listagem', () => {
  cy.get('@response').then((res) => {
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true

    const codigos = res.body.map((u) => u.codigoUe)
    const unicos = new Set(codigos)

    expect(
      unicos.size,
      `Códigos de UE duplicados encontrados (${codigos.length} total, ${unicos.size} únicos)`
    ).to.equal(codigos.length)

    Cypress.log({
      name: 'Validação Unicidade',
      message: `${codigos.length} códigos de UE únicos validados`,
    })
  })
})

