import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

// Função auxiliar para selecionar DRE aleatória
function obterDREAleatoria(dres) {
  const indiceAleatorio = Math.floor(Math.random() * dres.length)
  return dres[indiceAleatorio]
}

// When steps para buscas de escolas por DRE e tipo

When('eu busco as escolas de tipo {string} dessa DRE aleatória', (tipoEscola) => {
  cy.get('@codigoDREAleatorio').then((codigoDRE) => {
    const path = `/api/DREs/${codigoDRE}/escolas/${tipoEscola}`
    cy.api_get(path).then((res) => {
      cy.wrap(res).as('response')
      cy.wrap(codigoDRE).as('codigoDREEnviado')
      cy.wrap(tipoEscola).as('tipoEscolaEnviado')
      Cypress.log({ name: 'GET Escolas', message: `${path} (aleatório) → HTTP ${res.status}` })
    })
  })
})

When('eu busco as escolas de tipo {string} da DRE com código {string}', (tipoEscola, codigoDRE) => {
  const path = `/api/DREs/${codigoDRE}/escolas/${tipoEscola}`
  cy.api_get(path).then((res) => {
    cy.wrap(res).as('response')
    cy.wrap(codigoDRE).as('codigoDREEnviado')
    cy.wrap(tipoEscola).as('tipoEscolaEnviado')
    Cypress.log({ name: 'GET Escolas', message: `${path} → HTTP ${res.status}` })
  })
})

When('eu busco as escolas de tipo {string} da DRE com código {string} sem token', (tipoEscola, codigoDRE) => {
  const path = `/api/DREs/${codigoDRE}/escolas/${tipoEscola}`
  const baseURL = 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br'
  cy.request({
    method: 'GET',
    url: `${baseURL}${path}`,
    failOnStatusCode: false,
    headers: { accept: 'application/json' },
  }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'GET Escolas (sem token)', message: `${path} → HTTP ${res.status}` })
  })
})

// Then steps para validações de escolas

Then('a resposta deve ser um array não vazio de escolas', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
    Cypress.log({ name: 'Validação', message: `${res.body.length} escolas retornadas` })
  })
})

Then('cada escola deve ter os campos obrigatórios:', (dataTable) => {
  const campos = dataTable.rawTable.slice(1).map((row) => row[0])
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
    res.body.forEach((escola, idx) => {
      campos.forEach((campo) => {
        expect(escola, `Escola[${idx}] deve ter o campo '${campo}'`).to.have.property(campo)
      })
    })
    Cypress.log({ name: 'Validação', message: `${res.body.length} escolas validadas com campos: ${campos.join(', ')}` })
  })
})

Then('os tipos dos campos das escolas devem estar corretos', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
    res.body.forEach((escola, i) => {
      expect(typeof escola.codigoEscola, `escola[${i}].codigoEscola deve ser string`).to.equal('string')
      expect(typeof escola.nomeEscola, `escola[${i}].nomeEscola deve ser string`).to.equal('string')
      expect(typeof escola.codigoDRE, `escola[${i}].codigoDRE deve ser string`).to.equal('string')
    })
    Cypress.log({ name: 'Validação', message: `Tipos corretos em ${res.body.length} escolas` })
  })
})

Then('todas as escolas devem ter o código de DRE {string}', (codigoDREEsperado) => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
    res.body.forEach((escola, i) => {
      expect(
        escola.codigoDRE,
        `Escola[${i}].codigoDRE deve ser "${codigoDREEsperado}"`
      ).to.equal(codigoDREEsperado)
    })
    Cypress.log({ name: 'Validação', message: `Todas as ${res.body.length} escolas têm codigoDRE "${codigoDREEsperado}"` })
  })
})

Then('cada escola deve ter tipo {string}', (tipoEsperado) => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
    res.body.forEach((escola, i) => {
      const tipoNome = (escola.tipoEscola || '').toUpperCase()
      const tipoSigla = (escola.siglaTipoEscola || '').toUpperCase()
      const matchesTipo = tipoNome.includes(tipoEsperado.toUpperCase()) || tipoSigla.includes(tipoEsperado.toUpperCase())
      expect(matchesTipo, `Escola[${i}] deve ter tipo "${tipoEsperado}" (tipoEscola="${escola.tipoEscola}", siglaTipoEscola="${escola.siglaTipoEscola}")`).to.be.true
    })
    Cypress.log({ name: 'Validação', message: `Todas as escolas têm tipo "${tipoEsperado}"` })
  })
})

Then('o código de DRE na resposta deve corresponder ao código de DRE enviado', () => {
  cy.get('@codigoDREEnviado').then((codigoDREEnviado) => {
    cy.get('@response').then((res) => {
      expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
      res.body.forEach((escola, i) => {
        expect(
          escola.codigoDRE,
          `Escola[${i}].codigoDRE deve ser "${codigoDREEnviado}"`
        ).to.equal(codigoDREEnviado)
      })
      Cypress.log({ name: 'Validação', message: `codigoDRE "${codigoDREEnviado}" confirmado em ${res.body.length} escolas` })
    })
  })
})

Then('a resposta deve conter pelo menos {int} escolas', (minimo) => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
    expect(res.body.length, `Deve haver pelo menos ${minimo} escolas`).to.be.at.least(minimo)
    Cypress.log({ name: 'Validação', message: `${res.body.length} escolas (mínimo: ${minimo})` })
  })
})
