// Step Definitions — Alterar Data do D.O
// Steps comuns reutilizados:
//   • "que o usuário está autenticado no sistema" → common_steps.js
//   • "que o sistema carregou o dashboard"        → designacao_steps.js

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { alterarDOLocators } from '../../ui/locators/altera_DO_locators'

// ─── Contexto — Navegação via menu lateral ────────────────────────────────────
// Após o login o usuário está no root ("/"). Nenhuma rota protegida aceita
// cy.visit direto — todas retornam 307. O acesso deve ser sempre via sidebar.

Given('navega até {string} pelo menu lateral', (nomeTela) => {
  cy.log(`Navegando via sidebar: "${nomeTela}"`)

  if (/Alterar data do D\.O/i.test(nomeTela)) {
    navegarParaAlterarDO()
    return
  }

  cy.contains(nomeTela, { timeout: 15000 }).should('be.visible')
})

// Fluxo: sidebar "Designações" (pai) → "Alterar data do D.O" (sub-item)
// Não usa cy.visit em nenhum momento — navega 100% pela UI.
function navegarParaAlterarDO () {
  // Verifica se o sub-item já está visível (menu já expandido)
  cy.get('body').then($body => {
    const subItemVisivel = $body.find('a, li, span, button').toArray()
      .some(el => Cypress.$(el).text().trim() === 'Alterar data do D.O')

    if (!subItemVisivel) {
      cy.log('Expandindo menu "Designações"...')
      cy.contains('Designações', { timeout: 15000 })
        .should('be.visible')
        .click({ force: true })
      cy.wait(1500)
    }
  })

  cy.contains('Alterar data do D.O', { timeout: 15000 })
    .should('be.visible')
    .click({ force: true })

  cy.wait(3000)

  cy.url({ timeout: 25000 }).should('include', 'alterar-data-do')
  cy.get('main', { timeout: 15000 }).contains(/Alterar data do D\.O/i).should('be.visible')
  cy.log('✓ Tela "Alterar data do D.O" carregada')
}

// ─── Cenário 1: Filtros ───────────────────────────────────────────────────────

Then('o sistema exibe os filtros de busca', () => {
  alterarDOLocators.filtros.secaoFiltros().should('be.visible')
  cy.log('✓ Seção de filtros visível')
})

Then('o usuário informa o Ano {string}', (ano) => {
  // Ano* é um dropdown (button trigger), não um input de texto
  alterarDOLocators.filtros.ano()
    .should('be.visible')
    .click({ force: true })

  cy.wait(500)

  // Ant Design Select dropdown
  cy.get('body').then($body => {
    if ($body.find('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').length > 0) {
      cy.get('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content', { timeout: 5000 })
        .contains(ano)
        .click()
    } else {
      // shadcn/ui Select ou outro picker
      cy.contains('[role="option"], [role="menuitem"], li', ano, { timeout: 5000 })
        .click()
    }
  })

  cy.log(`✓ Ano selecionado: ${ano}`)
})

// clica no botão {string} → step global definido em alterar_senha_steps.js

Then('o sistema exibe a lista de portarias filtradas', () => {
  cy.wait(3000)
  alterarDOLocators.tabela.container().should('be.visible')
  alterarDOLocators.tabela.linhas().should('have.length.greaterThan', 0)
  cy.log('✓ Lista de portarias filtradas exibida')
})

// ─── Cenário 2: Seleção e Alteração ──────────────────────────────────────────

When('o usuário seleciona a data atual no campo de data', () => {
  alterarDOLocators.dataPublicacao()
    .should('be.visible')
    .click()

  cy.wait(1500)

  alterarDOLocators.selecionarHoje()
    .should('be.visible')
    .click()

  cy.wait(1000)
  cy.log('✓ Data atual selecionada no datepicker')
})

Then('o sistema exibe a lista de portarias', () => {
  cy.wait(2000)
  alterarDOLocators.tabela.container().should('be.visible')
  alterarDOLocators.tabela.linhas().should('have.length.greaterThan', 0)
  cy.log('✓ Lista de portarias exibida')
})

When('o usuário navega pela lista de portarias', () => {
  cy.wait(1000)
  alterarDOLocators.tabela.container().should('be.visible')
  cy.log('✓ Lista de portarias visível')
})

When('localiza uma portaria que esteja sem D.O', () => {
  alterarDOLocators.tabela.linhaSemDO()
    .should('exist')
    .as('linhaSemDO')
  cy.log('✓ Portaria sem D.O localizada e salva como alias')
})

When('navega até a coluna {string} da linha encontrada', (coluna) => {
  cy.get('@linhaSemDO').then(linha => {
    alterarDOLocators.tabela.colunaPortaria(linha).scrollIntoView()
  })
  cy.wait(500)
  cy.log(`✓ Coluna "${coluna}" rolada para a vista`)
})

When('seleciona o checkbox da portaria sem D.O', () => {
  cy.get('@linhaSemDO').then(linha => {
    alterarDOLocators.tabela.checkboxPortaria(linha)
      .should('exist')
      .check({ force: true })
  })
  cy.wait(1000)
  cy.log('✓ Checkbox da portaria sem D.O selecionado')
})

Then('o usuário rola a página até o final', () => {
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(1500)
  cy.log('✓ Página rolada até o final')
})

// ─── Cenários de Filtro por Campo ────────────────────────────────────────────

When('preenche o campo de filtro {string} com {string}', (campo, valor) => {
  const mapa = {
    'Portaria inicial':              () => alterarDOLocators.filtros.portariaInicial(),
    'Portaria final':                () => alterarDOLocators.filtros.portariaFinal(),
    'Nº SEI da lauda definitiva':    () => alterarDOLocators.filtros.nrSei(),
    'Ano':                           () => alterarDOLocators.filtros.ano(),
  }
  const locatorFn = mapa[campo]
  if (!locatorFn) throw new Error(`Campo de filtro não mapeado: "${campo}"`)
  locatorFn()
    .should('be.visible')
    .clear({ force: true })
    .type(valor, { delay: 80, force: true })
  cy.log(`✓ Campo "${campo}" preenchido com "${valor}"`)
})

Then('os campos de portaria estão limpos', () => {
  alterarDOLocators.filtros.portariaInicial().should('have.value', '')
  alterarDOLocators.filtros.portariaFinal().should('have.value', '')
  cy.log('✓ Campos "Portaria inicial" e "Portaria final" estão vazios')
})

Then('o sistema exibe a tabela sem resultados', () => {
  cy.wait(3000)
  alterarDOLocators.tabela.container().should('be.visible')
  alterarDOLocators.tabela.estadoVazio().should('be.visible')
  cy.log('✓ Tabela exibida sem resultados para o filtro informado')
})

// ─────────────────────────────────────────────────────────────────────────────

Then('o sistema processa a alteração sem erros', () => {
  cy.wait(5000)

  cy.get('body').then($body => {
    const temErro = $body.find(
      '.ant-message-error, .ant-notification-notice-error, [class*="error"]'
    ).length > 0

    if (temErro) {
      cy.get('.ant-message-error, .ant-notification-notice-error, [class*="error"]')
        .first().then($el => {
          throw new Error(`Erro após alteração: ${$el.text().trim()}`)
        })
    } else {
      cy.log('✓ Alteração processada sem erros')
    }
  })
})
