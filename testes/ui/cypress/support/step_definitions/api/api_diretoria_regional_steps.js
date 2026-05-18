/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

// ============================================================================
// STEPS ESPECÍFICOS — DiretoriaRegionalEducacao
// GET /api/DREs (listagem)
// GET /api/DREs/{codigoEolDRE} (individual)
// POST /api/DREs (filtro)
// ============================================================================

// Usa o código armazenado para buscar a DRE individual
When('eu busco a DRE por esse código', function () {
  cy.get('@codigoDRE').then((codigoDRE) => {
    cy.api_get(`/api/DREs/${codigoDRE}`).then((res) => {
      cy.wrap(res).as('response')
      Cypress.log({ name: 'GET', message: `/api/DREs/${codigoDRE} → HTTP ${res.status}` })
    })
  })
})

// ============================================================================
// ASSERTIVAS ESPECÍFICAS — DiretoriaRegionalEducacao
// ============================================================================

Then('a lista deve conter pelo menos {int} DREs', (minimo) => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
    expect(res.body.length, `Deve haver no mínimo ${minimo} DREs`).to.be.at.least(minimo)
    Cypress.log({ name: 'Validação', message: `Lista contém ${res.body.length} DREs (mínimo: ${minimo})` })
  })
})

Then('cada DRE deve ter os campos obrigatórios:', (dataTable) => {
  cy.get('@response').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
    res.body.forEach((dre, idx) => {
      campos.forEach((campo) => {
        expect(dre, `DRE[${idx}] deve ter o campo '${campo}'`).to.have.property(campo)
      })
    })
    Cypress.log({ name: 'Validação', message: `${res.body.length} DREs validadas com campos: ${campos.join(', ')}` })
  })
})

Then('os tipos dos campos da DRE devem estar corretos', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
    res.body.forEach((dre, idx) => {
      expect(typeof dre.codigoDRE, `DRE[${idx}].codigoDRE deve ser string`).to.equal('string')
      expect(typeof dre.nomeDRE, `DRE[${idx}].nomeDRE deve ser string`).to.equal('string')
      expect(typeof dre.siglaDRE, `DRE[${idx}].siglaDRE deve ser string`).to.equal('string')
      expect(dre.codigoDRE.trim().length, `DRE[${idx}].codigoDRE não deve ser vazio`).to.be.greaterThan(0)
      expect(dre.nomeDRE.trim().length, `DRE[${idx}].nomeDRE não deve ser vazio`).to.be.greaterThan(0)
    })
    Cypress.log({ name: 'Validação', message: `Tipos corretos em ${res.body.length} DREs` })
  })
})

Then('a DRE individual deve ter os campos obrigatórios:', (dataTable) => {
  cy.get('@response').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    const body = Array.isArray(res.body) ? res.body[0] : res.body
    expect(body, 'Resposta deve conter objeto DRE').to.be.an('object').and.not.be.empty
    campos.forEach((campo) => {
      expect(body, `DRE deve ter o campo '${campo}'`).to.have.property(campo)
      expect(body[campo], `'${campo}' não deve ser nulo`).to.not.be.null
      expect(body[campo], `'${campo}' não deve ser undefined`).to.not.be.undefined
    })
    Cypress.log({ name: 'Validação', message: `DRE "${body.nomeDRE}" (${body.codigoDRE}) — campos validados: ${campos.join(', ')}` })
  })
})

Then('a DRE deve ter código {string} e nome contendo {string}', (codigo, nomeParte) => {
  cy.get('@response').then((res) => {
    const dre = Array.isArray(res.body) ? res.body[0] : res.body
    expect(dre, 'Resposta deve conter objeto DRE').to.be.an('object')
    expect(dre.codigoDRE, `DRE.codigoDRE deve ser "${codigo}"`).to.equal(codigo)
    expect(
      dre.nomeDRE.toUpperCase(),
      `DRE.nomeDRE deve conter "${nomeParte}"`
    ).to.include(nomeParte.toUpperCase())
    Cypress.log({ name: 'Validação', message: `DRE encontrada: código="${dre.codigoDRE}" nome="${dre.nomeDRE}"` })
  })
})

// ============================================================================
// STEPS ESPECÍFICOS — POST /api/DREs (FILTRO)
// ============================================================================

When('eu envio uma requisição POST para {string} com os códigos:', (path, dataTable) => {
  const codigos = dataTable.rawTable.slice(1).map((row) => row[0])
  cy.wrap(codigos).as('codigosEnviados')
  cy.api_post(path, codigos).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'POST', message: `${path} com ${codigos.length} código(s) → HTTP ${res.status}` })
  })
})

When('eu envio uma requisição POST para {string} com um array vazio', (path) => {
  cy.api_post(path, []).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'POST', message: `${path} com array vazio → HTTP ${res.status}` })
  })
})

When('eu envio uma requisição POST para {string} sem token com os códigos:', (path, dataTable) => {
  const codigos = dataTable.rawTable.slice(1).map((row) => row[0])
  const baseUrl = Cypress.env('API_EOL_BASE_URL') || 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br'
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`
  cy.request({
    method: 'POST',
    url,
    body: codigos,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    failOnStatusCode: false,
  }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({ name: 'POST sem auth', message: `${path} → HTTP ${res.status}` })
  })
})

// ============================================================================
// ASSERTIVAS ESPECÍFICAS — POST (FILTRO DE DREs)
// ============================================================================

Then('a resposta deve conter {int} item', (quantidade) => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
    expect(res.body.length, `Deve conter exatamente ${quantidade} item`).to.equal(quantidade)
  })
})

Then('a resposta deve conter {int} itens', (quantidade) => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
    expect(res.body.length, `Deve conter exatamente ${quantidade} itens`).to.equal(quantidade)
  })
})

Then('a resposta deve ser um array vazio', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
    expect(res.body.length).to.equal(0)
    Cypress.log({ name: 'Validação', message: 'Array vazio validado' })
  })
})

Then('cada DRE na resposta POST deve ter os campos obrigatórios:', (dataTable) => {
  cy.get('@response').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    expect(res.body).to.be.an('array')
    if (res.body.length > 0) {
      res.body.forEach((dre, idx) => {
        campos.forEach((campo) => {
          expect(dre, `DRE[${idx}] deve ter o campo '${campo}'`).to.have.property(campo)
        })
      })
    }
    Cypress.log({ name: 'Validação', message: `${res.body.length} DREs validadas com campos: ${campos.join(', ')}` })
  })
})

Then('os tipos dos campos na resposta POST devem estar corretos', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
    if (res.body.length > 0) {
      res.body.forEach((dre, idx) => {
        expect(typeof dre.codigoDRE, `DRE[${idx}].codigoDRE deve ser string`).to.equal('string')
        expect(typeof dre.nomeDRE, `DRE[${idx}].nomeDRE deve ser string`).to.equal('string')
        expect(typeof dre.siglaDRE, `DRE[${idx}].siglaDRE deve ser string`).to.equal('string')
      })
    }
    Cypress.log({ name: 'Validação', message: `Tipos corretos em ${res.body.length} DREs` })
  })
})

Then('a resposta deve conter a DRE com código {string} e nome {string}', (codigo, nome) => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
    const dre = res.body.find((d) => d.codigoDRE === codigo)
    expect(dre, `DRE com código "${codigo}" deve estar na resposta`).to.not.be.undefined
    expect(dre.nomeDRE).to.equal(nome)
    Cypress.log({ name: 'Validação', message: `DRE encontrada: ${codigo} - ${nome}` })
  })
})

Then('os códigos retornados devem corresponder exatamente aos enviados', () => {
  cy.get('@codigosEnviados').then((codigosEnviados) => {
    cy.get('@response').then((res) => {
      const codigosRetornados = res.body.map((dre) => dre.codigoDRE).sort()
      const codigosOrdenados = [...codigosEnviados].sort()
      expect(codigosRetornados).to.deep.equal(codigosOrdenados)
      Cypress.log({ name: 'Validação', message: `Códigos correspondem aos enviados` })
    })
  })
})

Then('os códigos retornados devem estar na mesma ordem dos enviados', () => {
  cy.get('@codigosEnviados').then((codigosEnviados) => {
    cy.get('@response').then((res) => {
      const codigosRetornados = res.body.map((dre) => dre.codigoDRE)
      expect(codigosRetornados).to.deep.equal(codigosEnviados)
      Cypress.log({ name: 'Validação', message: `Ordem preservada: [${codigosRetornados.join(', ')}]` })
    })
  })
})

Then('a resposta deve conter apenas os DREs com códigos válidos', () => {
  cy.get('@codigosEnviados').then((codigosEnviados) => {
    cy.get('@response').then((res) => {
      const codigosRetornados = res.body.map((dre) => dre.codigoDRE)
      codigosRetornados.forEach((codigo) => {
        expect(codigosEnviados, `Código "${codigo}" deve estar nos enviados`).to.include(codigo)
      })
      Cypress.log({ name: 'Validação', message: `${codigosRetornados.length} DREs válidas retornadas` })
    })
  })
})
