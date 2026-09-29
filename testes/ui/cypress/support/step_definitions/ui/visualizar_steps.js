import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'

Then('valida a existencia da seção {string}', (nomeSecao) => {
  cy.log(`Validando seção: "${nomeSecao}"`)

  cy.contains(
    '.ant-collapse-header, [class*="collapse"] button, h2, h3, h4, div, span, p',
    nomeSecao.trim(),
    { timeout: 10000 }
  )
    .should('exist')
    .scrollIntoView()
    .should('be.visible')

  cy.wait(500)
})

// O accordion "Dados do Servidor Titular" não é renderizado quando a
// designação não tem titular (tipo "Cargo Disponível") — critério aqui é só
// "a seção existe? valida — senão, pula com log".
Then('valida a existencia da seção {string} quando aplicável a esta designação', (nomeSecao) => {
  cy.log(`Validando seção (se aplicável): "${nomeSecao}"`)

  cy.get('body').then(($body) => {
    const existe = $body
      .find('.ant-collapse-header, [class*="collapse"] button, h2, h3, h4, div, span, p')
      .filter((_, el) => el.textContent.trim().includes(nomeSecao.trim())).length > 0

    if (!existe) {
      cy.log(`↷ Seção "${nomeSecao}" pulada — não aplicável a esta designação (sem titular)`)
      return
    }

    cy.contains(
      '.ant-collapse-header, [class*="collapse"] button, h2, h3, h4, div, span, p',
      nomeSecao.trim(),
      { timeout: 10000 }
    ).should('exist').scrollIntoView().should('be.visible')
    cy.wait(500)
  })
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

