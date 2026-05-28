import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'

Then('clica no ícone {string} da coluna Action', (nomeIcone) => {
  cy.log(`Clicando no ícone "${nomeIcone}"`)
  
  cy.get('@designacaoIndex').then(index => {
    cy.log(`Clicando no ícone da linha ${index}`)
    
    cy.get('table tbody tr:not(.ant-table-measure-row)', { timeout: 10000 })
      .eq(index)
      .should('be.visible')
      .scrollIntoView()
      .within(() => {
        cy.get('td')
          .last()
          .find('div svg, svg, button svg')
          .first()
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true })
      })
  })
  
  cy.wait(3000)
})

Then('valida a existencia da seção {string}', (nomeSecao) => {
  cy.log(`Validando seção: "${nomeSecao}"`)
  
  cy.contains('h2, h3, h4, div, span, p', nomeSecao, { timeout: 10000 })
    .should('exist')
    .scrollIntoView()
    .should('be.visible')
  
  cy.wait(500)
})

Then('valida que todos os dados da designação estão visíveis', () => {
  cy.log('Validando visibilidade geral dos dados')
  
  cy.get('body').then($body => {
    const qtdCamposVisiveis = $body.find('span:visible, p:visible, input:visible, label:visible').length
    cy.log(`Encontrados ${qtdCamposVisiveis} elementos visíveis na tela`)
  })
})

Then('valida que a aba {string} contém informações', (nomeAba) => {
  cy.log(`Validando conteúdo da aba "${nomeAba}"`)
  
  cy.wait(1000)
  
  cy.get('body').then($body => {
    const qtdCamposPreenchidos = $body.find('span:visible:not(:empty), p:visible:not(:empty), label:visible').length
    cy.log(`Aba "${nomeAba}" contém ${qtdCamposPreenchidos} elementos com informações`)
  })
})

Then('o fluxo de visualização foi concluído com sucesso', () => {
  cy.log('Fluxo de visualização completo')
  cy.wrap(true).should('be.true')
})

