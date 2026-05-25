import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

// When steps para buscas de detalhes de DRE por código

When('eu busco a DRE com esse código aleatório', () => {
  cy.get('@codigoDREAleatorio').then((codigoDRE) => {
    const path = `/api/DREs/${codigoDRE}`
    cy.api_get(path).then((res) => {
      cy.wrap(res).as('response')
      cy.wrap(codigoDRE).as('codigoEnviado')
      Cypress.log({ name: 'GET DRE', message: `${path} (código aleatório) → HTTP ${res.status}` })
    })
  })
})

When('eu busco a DRE com código {string}', (codigoDRE) => {
  const path = `/api/DREs/${codigoDRE}`
  cy.api_get(path).then((res) => {
    cy.wrap(res).as('response')
    cy.wrap(codigoDRE).as('codigoEnviado')
    Cypress.log({ name: 'GET DRE', message: `${path} → HTTP ${res.status}` })
  })
})

When('eu busco a DRE com código {string} sem token', (codigoDRE) => {
  const path = `/api/DREs/${codigoDRE}`
  const baseURL = 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br'
  cy.request({
    method: 'GET',
    url: `${baseURL}${path}`,
    failOnStatusCode: false,
    headers: { accept: 'application/json' },
  }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET DRE (sem token)', message: `${path} → HTTP ${res.status}` })
  })
})

// Then steps para validações de detalhes de DRE

Then('a resposta deve conter uma DRE com campos obrigatórios:', (dataTable) => {
  const campos = dataTable.rawTable.slice(1).map((row) => row[0])
  cy.get('@response').then((res) => {
    let dre = Array.isArray(res.body) && res.body.length > 0 ? res.body[0] : res.body
    expect(dre, 'Resposta deve conter um objeto DRE').to.be.an('object')
    campos.forEach((campo) => {
      expect(dre, `Campo "${campo}" é obrigatório`).to.have.property(campo)
      expect(dre[campo], `Campo "${campo}" não deve ser nulo`).to.not.be.null
    })
    Cypress.log({ name: 'Validação Campos', message: `${campos.join(', ')} presentes na DRE` })
  })
})

Then('os tipos dos campos da DRE individual devem estar corretos', () => {
  cy.get('@response').then((res) => {
    const dre = Array.isArray(res.body) ? res.body[0] : res.body
    expect(dre, 'Resposta deve conter objeto DRE').to.be.an('object')
    expect(typeof dre.codigoDRE, 'codigoDRE deve ser string').to.equal('string')
    expect(typeof dre.nomeDRE, 'nomeDRE deve ser string').to.equal('string')
    expect(typeof dre.siglaDRE, 'siglaDRE deve ser string').to.equal('string')
    expect(dre.codigoDRE.trim().length, 'codigoDRE não deve ser vazio').to.be.greaterThan(0)
    expect(dre.nomeDRE.trim().length, 'nomeDRE não deve ser vazio').to.be.greaterThan(0)
    Cypress.log({ name: 'Validação', message: `Tipos corretos: DRE "${dre.nomeDRE}" (${dre.codigoDRE})` })
  })
})

Then('o código da DRE deve corresponder ao código enviado', () => {
  cy.get('@codigoEnviado').then((codigoEnviado) => {
    cy.get('@response').then((res) => {
      let dre = Array.isArray(res.body) && res.body.length > 0 ? res.body[0] : res.body
      expect(
        dre.codigoDRE,
        `Código retornado (${dre.codigoDRE}) deve ser igual ao enviado (${codigoEnviado})`
      ).to.equal(codigoEnviado)
      Cypress.log({ name: 'Validação Correspondência', message: `${codigoEnviado} = ${dre.codigoDRE}` })
    })
  })
})

Then('o nome da DRE deve ser preenchido', () => {
  cy.get('@response').then((res) => {
    let dre = Array.isArray(res.body) && res.body.length > 0 ? res.body[0] : res.body
    expect(dre.nomeDRE).to.exist
    expect(dre.nomeDRE.trim().length).to.be.greaterThan(0)
    Cypress.log({ name: 'Validação Nome', message: `Nome preenchido: ${dre.nomeDRE}` })
  })
})

Then('a DRE deve ter código {string}', (codigoEsperado) => {
  cy.get('@response').then((res) => {
    let dre = Array.isArray(res.body) && res.body.length > 0 ? res.body[0] : res.body
    expect(dre.codigoDRE, `Código deve ser ${codigoEsperado}`).to.equal(codigoEsperado)
    Cypress.log({ name: 'Validação Código', message: `Código: ${dre.codigoDRE}` })
  })
})

Then('a DRE deve ter nome contendo {string}', (nomeParte) => {
  cy.get('@response').then((res) => {
    let dre = Array.isArray(res.body) && res.body.length > 0 ? res.body[0] : res.body
    expect(
      dre.nomeDRE.toUpperCase(),
      `Nome deve conter "${nomeParte}"`
    ).to.include(nomeParte.toUpperCase())
    Cypress.log({ name: 'Validação Nome', message: `Nome: ${dre.nomeDRE}` })
  })
})
