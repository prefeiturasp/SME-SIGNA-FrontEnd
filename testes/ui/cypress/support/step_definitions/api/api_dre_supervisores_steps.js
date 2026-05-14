import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

// Função auxiliar local
function obterDREAleatoria(dres) {
  return dres[Math.floor(Math.random() * dres.length)]
}

// When steps para buscas de supervisores

When('eu busco supervisores dessa DRE aleatória', () => {
  cy.get('@codigoDREAleatorio').then((codigoDRE) => {
    const path = `/api/DREs/${codigoDRE}/supervisores`
    
    cy.api_get(path).then((res) => {
      cy.wrap(res).as('response')
      Cypress.log({
        name: 'GET Supervisores',
        message: `${path} com código aleatório ${codigoDRE} → HTTP ${res.status}`,
      })
    })
  })
})

When('eu busco supervisores da DRE com código {string}', (codigoDRE) => {
  const path = `/api/DREs/${codigoDRE}/supervisores`
  
  cy.api_get(path).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({
      name: 'GET Supervisores',
      message: `${path} → HTTP ${res.status}`,
    })
  })
})

When('eu busco supervisores da DRE com código {string} sem token', (codigoDRE) => {
  const path = `/api/DREs/${codigoDRE}/supervisores`
  const baseURL = 'https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br'
  
  cy.request({
    method: 'GET',
    url: `${baseURL}${path}`,
    failOnStatusCode: false,
    headers: {
      'accept': 'application/json',
      // Sem o header x-api-eol-key
    },
  }).then((res) => {
    cy.wrap(res).as('response')
    Cypress.log({
      name: 'GET Supervisores (sem token)',
      message: `${path} → HTTP ${res.status}`,
    })
  })
})

When('eu busco supervisores dessa DRE', () => {
  cy.get('@codigoDRE').then((codigoDRE) => {
    const path = `/api/DREs/${codigoDRE}/supervisores`
    
    cy.api_get(path).then((res) => {
      cy.wrap(res).as('response')
      Cypress.log({
        name: 'GET Supervisores',
        message: `${path} com código ${codigoDRE} → HTTP ${res.status}`,
      })
    })
  })
})

When('eu executo {int} iterações buscando supervisores de DREs aleatórias', (numIteracoes) => {
  cy.fixture('dres.json').then((fixture) => {
    const respostas = []
    
    // Seleciona N DREs aleatórias
    for (let i = 0; i < numIteracoes; i++) {
      const dreAleatoria = obterDREAleatoria(fixture.dres)
      const path = `/api/DREs/${dreAleatoria.codigo}/supervisores`
      
      cy.api_get(path).then((res) => {
        respostas.push({
          codigo: dreAleatoria.codigo,
          nome: dreAleatoria.nome,
          status: res.status,
          quantidadeSupervisores: Array.isArray(res.body) ? res.body.length : 0,
        })
      })
    }
    
    cy.wrap(respostas).as('respostasMultiplas')
    Cypress.log({
      name: 'Iterações Aleatórias',
      message: `${numIteracoes} DREs aleatórias consultadas`,
    })
  })
})

// Then steps para validações de supervisores

Then('a resposta deve ser um array não vazio de supervisores', () => {
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    expect(res.body.length, 'Array deve ter pelo menos um supervisor').to.be.greaterThan(0)
    Cypress.log({
      name: 'Validação',
      message: `Array com ${res.body.length} supervisor(es)`,
    })
  })
})

Then('cada supervisor deve ter os campos obrigatórios:', (dataTable) => {
  const campos = dataTable.rawTable.slice(1).map((row) => row[0])
  
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    
    res.body.forEach((supervisor, idx) => {
      campos.forEach((campo) => {
        expect(
          supervisor,
          `Supervisor ${idx}: Campo "${campo}" é obrigatório`
        ).to.have.property(campo)
        expect(
          supervisor[campo],
          `Supervisor ${idx}: Campo "${campo}" não deve ser nulo`
        ).to.not.be.null
      })
    })
    
    Cypress.log({
      name: 'Validação Campos',
      message: `${campos.join(', ')} presentes em ${res.body.length} supervisor(es)`,
    })
  })
})

Then('os tipos dos campos dos supervisores devem estar corretos', () => {
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    
    res.body.forEach((supervisor, idx) => {
      expect(
        typeof supervisor.codigoRF,
        `Supervisor ${idx}: codigoRF deve ser string`
      ).to.equal('string')
      expect(
        supervisor.codigoRF.trim().length > 0,
        `Supervisor ${idx}: codigoRF não deve estar vazio`
      ).to.be.true

      expect(
        typeof supervisor.nomeServidor,
        `Supervisor ${idx}: nomeServidor deve ser string`
      ).to.equal('string')
      expect(
        supervisor.nomeServidor.trim().length > 0,
        `Supervisor ${idx}: nomeServidor não deve estar vazio`
      ).to.be.true
    })
    
    Cypress.log({
      name: 'Validação Tipos',
      message: `Tipos validados para ${res.body.length} supervisor(es)`,
    })
  })
})

Then('a resposta deve conter um supervisor com RF {string} e nome {string}', (codigoRF, nomeEsperado) => {
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    
    const supervisor = res.body.find((s) => s.codigoRF === codigoRF)
    expect(supervisor, `Supervisor com RF "${codigoRF}" não encontrado`).to.exist
    expect(supervisor.nomeServidor.toUpperCase()).to.include(nomeEsperado.toUpperCase())
    
    Cypress.log({
      name: 'Validação Supervisor',
      message: `RF ${codigoRF}: ${supervisor.nomeServidor}`,
    })
  })
})

Then('a resposta deve conter pelo menos {int} supervisores', (minimo) => {
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    expect(
      res.body.length,
      `Deve haver pelo menos ${minimo} supervisores`
    ).to.be.gte(minimo)
    
    Cypress.log({
      name: 'Validação Quantidade',
      message: `${res.body.length} supervisores (mínimo: ${minimo})`,
    })
  })
})

Then('todos os códigos RF devem ser únicos', () => {
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    
    const codigosRF = res.body.map((s) => s.codigoRF)
    const codigosUnicos = new Set(codigosRF)
    
    expect(
      codigosUnicos.size,
      'Códigos RF devem ser únicos'
    ).to.equal(codigosRF.length)
    
    Cypress.log({
      name: 'Validação Unicidade',
      message: `${codigosRF.length} códigos RF únicos validados`,
    })
  })
})

Then('nenhum nome de servidor deve estar vazio ou em branco', () => {
  cy.get('@response').then((res) => {
    expect(res.status).to.equal(200)
    expect(Array.isArray(res.body), 'Resposta deve ser um array').to.be.true
    
    res.body.forEach((supervisor, idx) => {
      expect(
        supervisor.nomeServidor.trim().length > 0,
        `Supervisor ${idx}: Nome não deve estar vazio`
      ).to.be.true
      expect(
        supervisor.nomeServidor,
        `Supervisor ${idx}: Nome não deve ser apenas espaços`
      ).to.not.match(/^\s+$/)
    })
    
    Cypress.log({
      name: 'Validação Nomes',
      message: `${res.body.length} nomes validados (todos não vazios)`,
    })
  })
})

Then('todas as {int} requisições devem retornar status 200', (numRequisicoes) => {
  cy.get('@respostasMultiplas').then((respostas) => {
    expect(respostas.length).to.equal(numRequisicoes)
    
    respostas.forEach((resposta, idx) => {
      expect(
        resposta.status,
        `Requisição ${idx + 1} (DRE ${resposta.codigo}): Status deve ser 200`
      ).to.equal(200)
    })
    
    Cypress.log({
      name: 'Validação Status',
      message: `Todas as ${numRequisicoes} requisições retornaram 200`,
    })
  })
})

Then('todas as {int} requisições devem retornar arrays não vazios', (numRequisicoes) => {
  cy.get('@respostasMultiplas').then((respostas) => {
    expect(respostas.length).to.equal(numRequisicoes)
    
    respostas.forEach((resposta, idx) => {
      expect(
        resposta.quantidadeSupervisores,
        `Requisição ${idx + 1} (DRE ${resposta.codigo}): Deve ter supervisores`
      ).to.be.greaterThan(0)
    })
    
    Cypress.log({
      name: 'Validação Arrays',
      message: `Todas as ${numRequisicoes} requisições retornaram arrays com supervisores`,
    })
  })
})

