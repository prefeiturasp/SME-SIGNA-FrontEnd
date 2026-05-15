/// <reference types="cypress" />

import { Then } from '@badeball/cypress-cucumber-preprocessor'

// ASSERTIVAS ESPECÍFICAS — Cargos

Then('cada cargo deve ter os campos obrigatórios:', (dataTable) => {
  cy.get('@response').then((res) => {
    const campos = dataTable.rawTable.slice(1).map((row) => row[0])
    expect(res.body).to.be.an('array')
    expect(res.body.length).to.be.greaterThan(0)
    res.body.forEach((cargo) => {
      campos.forEach((campo) => {
        expect(cargo, `Cargo deve ter o campo '${campo}'`).to.have.property(campo)
      })
    })
    Cypress.log({ name: 'Validação', message: `${res.body.length} cargos validados com campos: ${campos.join(', ')}` })
  })
})

Then('os tipos dos campos do cargo devem estar corretos', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
    res.body.forEach((cargo, i) => {
      expect(typeof cargo.codigoCargo, `Item[${i}].codigoCargo deve ser number`).to.equal('number')
      expect(typeof cargo.nomeCargo, `Item[${i}].nomeCargo deve ser string`).to.equal('string')
      expect(cargo.nomeCargo.trim().length, `Item[${i}].nomeCargo não deve ser vazio`).to.be.greaterThan(0)
    })
    Cypress.log({ name: 'Validação', message: `Tipos corretos em ${res.body.length} cargos (codigoCargo: number, nomeCargo: string)` })
  })
})

Then('o cargo com código {int} deve estar na lista com nome {string}', (codigo, nome) => {
  cy.get('@response').then((res) => {
    expect(res.body).to.be.an('array')
    const cargo = res.body.find((c) => c.codigoCargo === codigo)
    expect(cargo, `Cargo com código ${codigo} deve estar na lista`).to.not.be.undefined
    expect(cargo.nomeCargo, `Nome do cargo ${codigo} deve ser "${nome}"`).to.equal(nome)
    Cypress.log({ name: 'Validação', message: `Cargo encontrado: ${codigo} - ${cargo.nomeCargo}` })
  })
})
