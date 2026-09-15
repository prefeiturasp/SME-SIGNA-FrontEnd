import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { gestaoCargosBasePack, gestaoCargosBaseUrls } from '../../ui/locators/gestao_cargos_base_locators'
import { textoPortariaPack, textoPortariaUrls } from '../../ui/locators/texto_portaria_locators'

// ─── Login único por suíte (sessão reaproveitada entre os cenários desta
// feature) ──────────────────────────────────────────────────────────────
// Exige @testIsolation(false) na Funcionalidade, senão o Cypress reseta o
// navegador entre cenários e este cache nunca é reaproveitado de verdade.
let loginJaRealizado = false

Given('que o usuário está logado no sistema', () => {
  if (loginJaRealizado) {
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"], [role="listbox"]').length > 0) {
        cy.get('body').type('{esc}')
        cy.wait(300)
      }
    })
    return
  }

  const username = Cypress.env('username')
  const password = Cypress.env('password')

  if (!username || !password) {
    throw new Error(
      'Credenciais não configuradas: defina USERNAME/SIGNA_USERNAME e PASSWORD/SIGNA_PASSWORD no arquivo .env (veja .env.example).'
    )
  }

  cy.realizarLogin(username, password).then(() => {
    loginJaRealizado = true
  })
})

// Mapa "tela" → item do submenu lateral "Gestão" + validação de chegada.
const TELAS_SUPORTADAS = {
  'gestão de cargos base': {
    itemMenu: 'Cargos base',
    validarChegada: () => {
      cy.url({ timeout: 20000 }).should('include', gestaoCargosBaseUrls.pagina)
      gestaoCargosBasePack.titulo().should('be.visible')
      cy.get('.loading, .spinner, .loader').should('not.exist')

      // Sessão reaproveitada entre cenários pode ter filtro residual —
      // reseta pra um estado limpo antes de começar.
      cy.get('body').then(($body) => {
        const $botaoLimpar = $body.find('[data-testid="btn-limpar-filtros"]')
        if ($botaoLimpar.length && !$botaoLimpar.prop('disabled')) {
          cy.wrap($botaoLimpar).click({ force: true })
          cy.wait(500)
        }
      })
    },
  },
  'textos de portarias': {
    itemMenu: 'Textos de portaria',
    validarChegada: () => {
      cy.url({ timeout: 20000 }).should('include', textoPortariaUrls.listagem)
      textoPortariaPack.listagem.titulo().should('be.visible')
      cy.get('.loading, .spinner, .loader').should('not.exist')

      cy.get('body').then(($body) => {
        const $botaoLimpar = $body.find('button').filter(':contains("Limpar filtros")')
        if ($botaoLimpar.length && !$botaoLimpar.prop('disabled')) {
          cy.wrap($botaoLimpar).click({ force: true })
          cy.wait(500)
        }
      })
    },
  },
}

Given('está na tela {string}', (tela) => {
  const config = TELAS_SUPORTADAS[tela.trim().toLowerCase()]
  if (!config) {
    throw new Error(`Step "está na tela" não implementado para "${tela}". Telas suportadas: ${Object.keys(TELAS_SUPORTADAS).join(', ')}`)
  }

  // NÃO usa cy.visit() direto pras rotas profundas de "Gestão": a aplicação
  // responde com 307 e redireciona de volta pra "/" (reload completo). A
  // navegação real só funciona clicando pelo menu lateral.
  cy.get('aside').then(($aside) => {
    if ($aside.hasClass('is-collapsed')) {
      cy.get('aside').find('button').first().click({ force: true })
      cy.get('aside', { timeout: 8000 }).should('not.have.class', 'is-collapsed')
      cy.wait(600)
    }
  })

  cy.get('aside, nav', { timeout: 10000 }).should('be.visible')

  // O clique nem sempre expande o submenu na primeira tentativa — tenta de
  // novo em vez de confiar numa única tentativa com wait fixo.
  const MAX_TENTATIVAS_MENU = 3
  const abrirSubmenuGestao = (tentativa) => {
    cy.contains('span:visible, a:visible, div:visible', /^Gestão$/i, { timeout: 15000 })
      .closest('li, [role="menuitem"]')
      .click({ force: true })
    cy.wait(800)

    cy.get('body').then(($body) => {
      const abriu = $body
        .find('span:visible, a:visible, div:visible')
        .toArray()
        .some((el) => new RegExp(`^${config.itemMenu}$`, 'i').test(el.textContent.trim()))

      if (!abriu && tentativa < MAX_TENTATIVAS_MENU) {
        cy.log(`Submenu "Gestão" não abriu na tentativa ${tentativa}/${MAX_TENTATIVAS_MENU} — tentando de novo`)
        abrirSubmenuGestao(tentativa + 1)
      }
    })
  }
  abrirSubmenuGestao(1)

  cy.contains('span:visible, a:visible, div:visible', new RegExp(`^${config.itemMenu}$`, 'i'), { timeout: 15000 })
    .closest('li, [role="menuitem"], a')
    .click({ force: true })

  config.validarChegada()
})

Then('valida a existencia dos campos de filtro {string}', (camposParam) => {
  const campos = camposParam.split(',').map((c) => c.trim()).filter(Boolean)
  campos.forEach((campo) => {
    cy.contains('label', campo, { timeout: 10000 }).should('be.visible')
  })
})

Then('os botões {string} e {string} devem estar desabilitados', (btn1, btn2) => {
  cy.contains('button', btn1, { timeout: 10000 }).should('be.disabled')
  cy.contains('button', btn2, { timeout: 10000 }).should('be.disabled')
})

Then('os botões {string} e {string} devem estar habilitados', (btn1, btn2) => {
  cy.contains('button', btn1, { timeout: 10000 }).should('not.be.disabled')
  cy.contains('button', btn2, { timeout: 10000 }).should('not.be.disabled')
})

When('seleciona a opção {string} no filtro {string}', (opcao, filtro) => {
  cy.contains('label', filtro, { timeout: 15000 })
    .parent()
    .find('button[role="combobox"]')
    .should('be.visible')
    .click()

  cy.get('[role="option"]', { timeout: 10000 })
    .contains(new RegExp(`^${opcao}$`, 'i'))
    .should('be.visible')
    .click()
})

When('preenche o filtro {string} com {string}', (filtro, valor) => {
  cy.contains('label', filtro, { timeout: 15000 })
    .invoke('attr', 'for')
    .then((forId) => {
      cy.get(`#${forId}`).should('be.visible').clear().type(valor, { delay: 50 })
    })
})

// ":not(.ant-table-measure-row)" exclui uma linha fantasma que o Ant Design
// injeta em tbody (só pra calcular largura de coluna) — sem isso o .each()
// falha nela antes de chegar nas linhas de dado de verdade.
Then('a tabela exibe apenas cargos base com {string}', (textoEsperado) => {
  cy.get('tbody tr:not(.ant-table-measure-row)', { timeout: 15000 })
    .should('have.length.greaterThan', 0)
    .each(($linha) => {
      cy.wrap($linha)
        .invoke('text')
        .then((texto) => {
          expect(texto.toLowerCase()).to.include(textoEsperado.toLowerCase())
        })
    })
})

Then('a tabela exibe mais de {string} cargo base cadastrado', (minimo) => {
  cy.get('tbody tr:not(.ant-table-measure-row)', { timeout: 15000 }).should('have.length.greaterThan', Number(minimo))
})

Then('o campo {string} deve estar vazio', (campo) => {
  cy.contains('label', campo, { timeout: 10000 })
    .parent()
    .then(($container) => {
      const $combo = $container.find('button[role="combobox"]')
      if ($combo.length) {
        cy.wrap($combo).should('contain.text', 'Selecione')
      } else {
        cy.wrap($container).find('input').should('have.value', '')
      }
    })
})
