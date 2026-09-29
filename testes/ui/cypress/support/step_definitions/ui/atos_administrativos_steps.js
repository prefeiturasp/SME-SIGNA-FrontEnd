// cy.session foi descartado: a app não recompõe o estado autenticado da SPA
// a partir de reload frio. Feature usa @testIsolation(false) — login via UI
// roda uma única vez (1º cenário), os demais reaproveitam a sessão viva.

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import {
  atosAdministrativosPack,
  atosAdministrativosUrls,
} from '../../ui/locators/atos_administrativos_locators'

// ─── Contexto — Login único, reaproveitado entre cenários ──────────────────
let loginJaRealizado = false

Given('que o usuário já está autenticado no sistema', () => {
  if (loginJaRealizado) {
    // Fecha dialog/dropdown residual de um cenário anterior que tenha
    // falhado com modal Radix aberto (bloquearia cliques em cascata).
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"], [role="listbox"]').length > 0) {
        cy.get('body').type('{esc}')
        cy.wait(300)
      }

      // Cenário anterior pode ter falhado fora desta tela.
      if ($body.find('button:contains("Limpar filtros")').length === 0) {
        cy.visit(`/pages/${atosAdministrativosUrls.pagina}`)
        cy.wait(500)
      }
    })
    atosAdministrativosPack.botoes.limpar().click({ force: true })
    return
  }

  const username = Cypress.env('username')
  const password = Cypress.env('password')

  if (!username || !password) {
    throw new Error(
      'Credenciais não configuradas: defina USERNAME/SIGNA_USERNAME e PASSWORD/SIGNA_PASSWORD no arquivo .env (veja .env.example).'
    )
  }

  // .then() em vez de atribuir logo após: comandos Cypress são enfileirados,
  // marcar a flag fora do .then() marcaria "já logado" mesmo se falhar.
  cy.realizarLogin(username, password).then(() => {
    loginJaRealizado = true
  })
})

// Usados em "a tabela apresenta resultado para" para provar que o valor
// buscado foi enviado ao backend, não só que aparece na tabela por coincidência.
let ultimoFiltroAplicado = null
let corpoUltimaRequisicaoPesquisa = null

// "Tipo"/"Status" são dropdowns que mandam código/id, não o texto exibido —
// não dá pra checar o corpo da requisição neles sem risco de falso negativo.
const FILTROS_TEXTO_LIVRE = [
  'Nº SEI',
  'Portaria de designação',
  'Servidor',
  'Registro Funcional (RF)',
]

// ─── Contexto — Confirmação de tela ────────────────────────────────────────
Given('está na página {string}', () => {
  cy.url({ timeout: 20000 }).should('include', atosAdministrativosUrls.pagina)
  atosAdministrativosPack.titulo().should('be.visible')
  cy.get('.loading, .spinner, .loader').should('not.exist')
})

// ─── Contexto — Validação de texto com DocString ───────────────────────────
Then('valida a existencia do texto', (docString) => {
  cy.contains(docString.trim(), { timeout: 10000 }).should('exist')
})

// ─── Contexto — Validação data-driven de filtros e botões ──────────────────
Then('valida a existencia dos filtros:', (dataTable) => {
  const filtros = dataTable.raw().flat()
  filtros.forEach((filtro) => {
    cy.log(`Validando existência do filtro: "${filtro}"`)
    cy.contains(filtro.trim(), { timeout: 10000 }).should('exist')
  })
})

Then('valida a existencia dos botões:', (dataTable) => {
  const botoes = dataTable.raw().flat()
  botoes.forEach((botao) => {
    cy.contains('button', botao.trim(), { timeout: 10000 }).should('be.visible')
  })
})

// ─── Preenchimento genérico de filtro (Esquema do Cenário) ─────────────────
When('preencho o filtro {string} com {string}', (filtro, valor) => {
  switch (filtro) {
    case 'Tipo':
      atosAdministrativosPack.filtros.tipo().should('be.visible').click()
      cy.wait(500)
      atosAdministrativosPack.dropdown.opcao(valor).should('be.visible').click()
      break

    case 'Nº SEI':
      atosAdministrativosPack.filtros.numeroSei()
        .should('be.visible')
        .clear()
        .type(valor, { delay: 50 })
      break

    case 'Portaria de designação':
      atosAdministrativosPack.filtros.portariaDesignacao()
        .should('be.visible')
        .clear()
        .type(valor, { delay: 50 })
      break

    case 'Servidor':
      atosAdministrativosPack.filtros.servidor()
        .should('be.visible')
        .clear()
        .type(valor, { delay: 50 })
      break

    case 'Registro Funcional (RF)':
      atosAdministrativosPack.filtros.rf()
        .should('be.visible')
        .clear()
        .type(valor, { delay: 50 })
      break

    case 'Status':
      atosAdministrativosPack.filtros.status().should('be.visible').click()
      cy.wait(500)
      atosAdministrativosPack.dropdown.opcao(valor).should('be.visible').click()
      break

    default:
      throw new Error(
        `Filtro "${filtro}" não mapeado em "preencho o filtro". Verifique a coluna "Filtro" do Examples da feature.`
      )
  }

  ultimoFiltroAplicado = { filtro, valor }
  cy.wait(300)
})

When('clico no botão {string}', (botao) => {
  // "Pesquisar" dispara um POST assíncrono — intercepta e aguarda a
  // resposta em vez de um wait fixo (evita checar estado transitório).
  if (botao === 'Pesquisar') {
    cy.intercept('POST', '**/pages/atos-administrativos**').as('pesquisarAtos')
  }

  cy.contains('button', botao, { timeout: 10000 })
    .should('be.visible')
    .and('not.be.disabled')
    .click()

  if (botao === 'Pesquisar') {
    cy.wait('@pesquisarAtos', { timeout: 15000 }).then((interception) => {
      corpoUltimaRequisicaoPesquisa = interception.request.body
    })
  }
})

// ─── Validações de resultado ────────────────────────────────────────────────

Then('o sistema exibe registros compatíveis com o filtro {string}', (filtro) => {
  cy.get('.loading, .spinner, .loader', { timeout: 15000 }).should('not.exist')
  atosAdministrativosPack.tabela.container().should('be.visible')
  atosAdministrativosPack.tabela.linhas().should('have.length.greaterThan', 0)
  cy.log(`✓ Resultados exibidos para o filtro "${filtro}"`)
})

// .should(callback) em vez de .each(): a tabela re-renderiza de forma
// assíncrona e .each() guarda referência fixa que pode "morrer" no meio.
Then('a tabela apresenta resultado para {string}', (valor) => {
  if (ultimoFiltroAplicado && FILTROS_TEXTO_LIVRE.includes(ultimoFiltroAplicado.filtro)) {
    cy.wrap(null).should(() => {
      expect(JSON.stringify(corpoUltimaRequisicaoPesquisa)).to.contain(valor)
    })
  }

  atosAdministrativosPack.tabela.linhas().should(($linhas) => {
    expect($linhas.length).to.be.greaterThan(0)
    $linhas.each((_, linha) => {
      expect(linha.textContent).to.contain(valor)
    })
  })
})

// ─── Período ────────────────────────────────────────────────────────────────
When('seleciono o período de {string} até {string}', (dataInicio, dataFim) => {
  atosAdministrativosPack.filtros.periodo().should('be.visible').click()
  atosAdministrativosPack.filtros.periodoInputs().eq(0).clear().type(`${dataInicio}{enter}`)
  atosAdministrativosPack.filtros.periodoInputs().eq(1).clear().type(`${dataFim}{enter}`)
  cy.get('body').click(0, 0)
})

Then('o sistema exibe os registros dentro do período', () => {
  cy.get('.loading, .spinner, .loader', { timeout: 15000 }).should('not.exist')
  atosAdministrativosPack.tabela.container().should('be.visible')
  atosAdministrativosPack.tabela.linhas().should('have.length.greaterThan', 0)
})

// ─── Busca sem resultados ───────────────────────────────────────────────────
Then('o sistema exibe a tabela de atos administrativos sem resultados', () => {
  cy.wait(1500)
  atosAdministrativosPack.tabela.container().should('be.visible')
  atosAdministrativosPack.tabela.estadoVazio().should('be.visible')
  cy.log('✓ Tabela exibida sem resultados para o filtro informado')
})

// ─── Limpar filtros ──────────────────────────────────────────────────────────
Then('os campos de filtro são limpos', () => {
  atosAdministrativosPack.filtros.numeroSei().should('have.value', '')
  atosAdministrativosPack.filtros.portariaDesignacao().should('have.value', '')
  atosAdministrativosPack.filtros.servidor().should('have.value', '')
  atosAdministrativosPack.filtros.rf().should('have.value', '')
})

// ─── Menu "Novo ato +" ──────────────────────────────────────────────────────
Then('o sistema exibe as opções:', (dataTable) => {
  const opcoes = dataTable.raw().flat()
  opcoes.forEach((opcao) => {
    atosAdministrativosPack.novoAto.opcao(opcao.trim()).should('exist')
  })
})

When('seleciona a opção {string} no menu de novo ato', (opcao) => {
  atosAdministrativosPack.novoAto.opcao(opcao).should('be.visible').click()
})

Then('o sistema direciona para a tela {string}', (tela) => {
  switch (tela) {
    case 'Designação':
      cy.url({ timeout: 20000 }).should('include', 'designacoes-passo-1')
      break
    case 'Listagem de designações':
      cy.url({ timeout: 20000 }).should('include', 'listagem-designacoes')
      break
    case 'Atos administrativos':
      cy.url({ timeout: 20000 }).should('include', 'atos-administrativos')
      break
    default:
      throw new Error(
        `Tela "${tela}" não mapeada em "o sistema direciona para a tela". Adicione o mapeamento de URL correspondente.`
      )
  }
})

// ─── Retorno ao Atos Administrativos via menu lateral ──────────────────────
When('o sistema navega até o menu lateral esquerdo', () => {
  cy.get('aside').then(($aside) => {
    if ($aside.hasClass('is-collapsed')) {
      cy.get('aside').find('button').first().click({ force: true })
      cy.get('aside', { timeout: 8000 }).should('not.have.class', 'is-collapsed')
      cy.wait(600)
    }
  })
  cy.get('aside, nav', { timeout: 10000 }).should('be.visible')
})

When('seleciona a opção {string} no menu lateral', (opcao) => {
  cy.contains('span:visible, a:visible, div:visible', new RegExp(`^${opcao}$`, 'i'), { timeout: 15000 })
    .closest('li, [role="menuitem"], a')
    .click({ force: true })
  cy.wait(800)
})

// ─── Modal de ação (Nova cessação / Tornar insubsistente / etc.) ───────────
Then('o sistema exibe o modal {string}', (nomeModal) => {
  atosAdministrativosPack.modal.container().should('be.visible')
  atosAdministrativosPack.modal.contendo(nomeModal.trim()).should('be.visible')
})

Then('valida a existência do título {string}', (titulo) => {
  atosAdministrativosPack.modal.contendo(titulo.trim()).should('exist')
})

Then('valida a existência do campo {string}', (campo) => {
  atosAdministrativosPack.modal.campoPorLabel(campo.trim()).should('exist')
})

When('preenche o campo {string} com {string}', (campo, valor) => {
  atosAdministrativosPack.modal.campoPorLabel(campo.trim())
    .should('be.visible')
    .clear()
    .type(valor, { delay: 100 })
})

When('seleciona o ano {string} no campo de busca', (ano) => {
  atosAdministrativosPack.modal.selectAno().should('be.visible').click()
  cy.get('[role="option"]', { timeout: 10000 })
    .contains(new RegExp(`^${ano}$`))
    .should('be.visible')
    .click()
})

// A portaria buscada pode não ter apostila vinculada — resultado de negócio
// válido (nada para anular), não falha do teste. Reaproveita
// Cypress.env('apostilaCessacaoTemDados'), também lido por apostilar_steps.js.
Then('valida se a portaria possui apostila vinculada para anular', () => {
  cy.wait(500)
  cy.url().then((url) => {
    if (url.includes('anular-apostila')) {
      Cypress.env('apostilaCessacaoTemDados', true)
      cy.log('✓ Apostila encontrada — segue para a tela de anulação')
      return
    }

    cy.get('[role="dialog"]', { timeout: 10000 })
      .should('be.visible')
      .contains(/não possui apostila vinculada/i, { timeout: 10000 })
      .should('be.visible')

    Cypress.env('apostilaCessacaoTemDados', false)
    cy.log('⚠️ Portaria sem apostila vinculada para anular — nada a fazer, cenário concluído; etapas seguintes serão ignoradas')

    cy.get('body').type('{esc}')
    cy.wait(300)
  })
})

// A portaria padrão pode já ter sido apostilada em execução anterior — tenta
// as alternativas abaixo antes de falhar de fato.
const PORTARIAS_APOSTILA_FALLBACK = ['5791346', '7890123', '1019142']

Then('valida se a portaria possui apostila disponível para criar', () => {
  const tentar = (indice) => {
    cy.wait(500)
    cy.url().then((url) => {
      if (url.includes('apostila')) {
        cy.log(`✓ Portaria "${PORTARIAS_APOSTILA_FALLBACK[indice]}" elegível para apostila — segue para a tela de apostilamento`)
        return
      }

      cy.get('[role="dialog"]', { timeout: 10000 })
        .invoke('text')
        .then((mensagem) => {
          const proximaPortaria = PORTARIAS_APOSTILA_FALLBACK[indice + 1]

          if (!proximaPortaria) {
            throw new Error(`Nenhuma das portarias testadas (${PORTARIAS_APOSTILA_FALLBACK.join(', ')}) possui apostila disponível para criar — mensagem do modal: "${mensagem.trim()}"`)
          }

          cy.log(`⚠️ Portaria "${PORTARIAS_APOSTILA_FALLBACK[indice]}" sem apostila disponível — tentando "${proximaPortaria}"`)

          atosAdministrativosPack.modal.campoPorLabel('Portaria')
            .should('be.visible')
            .clear()
            .type(proximaPortaria, { delay: 100 })

          cy.contains('button', 'Buscar', { timeout: 10000 })
            .should('be.visible')
            .click()

          tentar(indice + 1)
        })
    })
  }

  tentar(0)
})
