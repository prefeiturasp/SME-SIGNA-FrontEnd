// Debug spec - REMOVER APÓS USO
describe('Debug sidebar Meus Dados', () => {
  it('inspeciona links e estrutura do sidebar após login', () => {
    cy.visit('/')
    cy.wait(2000)

    cy.get('input[type="text"], input[type="number"]', { timeout: 10000 })
      .first()
      .type(Cypress.env('username'))

    cy.get('input[type="password"]', { timeout: 10000 })
      .first()
      .type(Cypress.env('password'))

    cy.get('button[type="submit"]').click()
    cy.wait(4000)

    // Captura URL atual após login
    cy.url().then(url => cy.log('URL após login: ' + url))

    // Captura todos os hrefs/links do sidebar e nav
    cy.get('body').then($body => {
      const anchors = [...$body[0].querySelectorAll('a[href]')]
      const hrefs = anchors.map(a => `${a.href} | text: "${a.innerText.trim()}"`)
      cy.writeFile('debug_anchors.txt', hrefs.join('\n'))
      cy.log('Total de anchors: ' + hrefs.length)
    })

    // Captura HTML do sidebar/nav
    cy.get('body').then($body => {
      const sider = $body[0].querySelector('aside, [class*="sider"], [class*="sidebar"], nav')
      if (sider) {
        cy.writeFile('debug_sidebar.html', sider.outerHTML)
        cy.log('Sidebar HTML salvo em debug_sidebar.html')
      } else {
        cy.writeFile('debug_sidebar.html', 'SIDEBAR NAO ENCONTRADO')
        cy.log('Sidebar nao encontrado')
      }
    })

    // Tenta clicar no primeiro item que contenha "meus dados"
    cy.contains(/meus dados/i).then($el => {
      cy.log('Elemento encontrado para "meus dados":')
      cy.log('Tag: ' + $el[0].tagName)
      cy.log('Class: ' + $el[0].className)
      cy.log('HTML: ' + $el[0].outerHTML.substring(0, 500))
    })

    // Captura todos os elementos contendo texto "meus"
    cy.get('body').then($body => {
      const elements = [...$body[0].querySelectorAll('*')]
        .filter(el => el.children.length === 0 && el.textContent.toLowerCase().includes('meus dados'))
        .map(el => `<${el.tagName} class="${el.className}"> ${el.textContent.trim()} </${el.tagName}> [parent: <${el.parentElement?.tagName} class="${el.parentElement?.className}">]`)
      cy.writeFile('debug_meus_dados_elements.txt', elements.join('\n'))
    })
  })
})
