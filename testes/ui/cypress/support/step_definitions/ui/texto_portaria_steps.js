import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { textoPortariaPack, textoPortariaUrls, TIPOS_DE_PORTARIA, TIPO_PORTARIA_NA_LISTAGEM } from '../../ui/locators/texto_portaria_locators'

// ─── Modal "Novo texto de portaria" ─────────────────────────────────────────

Then('o sistema exibe o modal de novo texto de portaria', () => {
  textoPortariaPack.modalNovoTexto.dialog().should('be.visible')
  textoPortariaPack.modalNovoTexto.dialog().should('contain.text', 'Novo texto de portaria')
})

Then('o modal de novo texto de portaria exibe o texto {string}', (texto) => {
  textoPortariaPack.modalNovoTexto.dialog().should('contain.text', texto)
})

Then('a opção {string} já vem selecionada por padrão no modal de novo texto de portaria', (opcao) => {
  const valor = opcao.toLowerCase().includes('último') || opcao.toLowerCase().includes('ultimo')
    ? 'ultimo_texto_cadastrado'
    : 'criar_novo_texto'

  textoPortariaPack.modalNovoTexto.dialog()
    .find(`button[role="radio"][value="${valor}"]`)
    .should('have.attr', 'aria-checked', 'true')
})

// ─── Navegação entre telas ──────────────────────────────────────────────────

Then('o sistema direciona para a tela de cadastro de texto de portaria', () => {
  cy.url({ timeout: 20000 }).should('include', textoPortariaUrls.cadastro)
  textoPortariaPack.cadastro.titulo().should('be.visible')
  cy.get('.loading, .spinner, .loader').should('not.exist')
})

Then('o sistema retorna para a listagem de textos de portaria', () => {
  cy.url({ timeout: 20000 })
    .should('include', textoPortariaUrls.listagem)
    .and('not.include', 'criar-textos-de-portaria')
  textoPortariaPack.listagem.titulo().should('be.visible')
})

Then('o sistema permanece na tela de cadastro de texto de portaria', () => {
  cy.url({ timeout: 10000 }).should('include', textoPortariaUrls.cadastro)
  textoPortariaPack.cadastro.titulo().should('be.visible')
})

When('clica no botão "Cancelar" do cadastro de texto de portaria', () => {
  textoPortariaPack.cadastro.botaoCancelar().should('be.visible').click({ force: true })
})

// ─── Preenchimento do formulário de cadastro ────────────────────────────────

When('seleciona o tipo de portaria {string}', (tipo) => {
  if (!TIPOS_DE_PORTARIA.some((t) => t.toLowerCase() === tipo.toLowerCase())) {
    throw new Error(`"${tipo}" não é um tipo de portaria conhecido. Tipos válidos: ${TIPOS_DE_PORTARIA.join(', ')}`)
  }

  textoPortariaPack.cadastro.tipoPortaria().should('be.visible').click()
  cy.get('[role="listbox"] [role="option"]', { timeout: 10000 })
    .contains(new RegExp(`^${tipo}$`, 'i'))
    .should('be.visible')
    .click()
})

When('seleciona uma opção aleatória no campo {string} do cadastro de texto de portaria', (campo) => {
  textoPortariaPack.cadastro.comboboxPorLabel(campo).should('be.visible').click()

  cy.get('[role="listbox"] [role="option"]', { timeout: 10000 })
    .should('have.length.greaterThan', 0)
    .then(($opcoes) => {
      const indice = Math.floor(Math.random() * $opcoes.length)
      const texto = $opcoes.eq(indice).text().trim()
      cy.log(`Campo "${campo}": opção selecionada (índice ${indice}) — ${texto}`)
      cy.wrap($opcoes.eq(indice)).click()
    })
})

// Nome único por execução (sufixo de timestamp), guardado em
// "@nomeModeloCriado" para as validações pós-submit conferirem depois.
When('preenche o campo {string} do cadastro de texto de portaria com um nome único de automação para {string}', (campo, tipo) => {
  const valor = `QA automação - ${tipo} - ${Date.now()}`
  textoPortariaPack.cadastro.campoPorLabel(campo)
    .should('be.visible')
    .clear()
    .type(valor, { delay: 20 })
  cy.wrap(valor).as('nomeModeloCriado')
})

When('preenche o campo {string} do cadastro de texto de portaria com {string}', (campo, valor) => {
  textoPortariaPack.cadastro.campoPorLabel(campo)
    .should('be.visible')
    .clear()
    .type(valor, { delay: 20 })
})

// Selecionar uma variável no popover já insere o placeholder [[NOME]]
// correspondente no editor — este step não mexe no editor diretamente.
When('seleciona as variáveis {string} no texto da portaria', (variaveisCsv) => {
  const variaveis = variaveisCsv.split(',').map((v) => v.trim()).filter(Boolean)

  textoPortariaPack.cadastro.variavel.botao().should('be.visible').click()

  variaveis.forEach((nome) => {
    textoPortariaPack.cadastro.variavel.opcao(nome).should('be.visible').click()
  })

  cy.get('body').type('{esc}')
})

// NUNCA limpa o editor antes de digitar: clear() apagaria os placeholders
// [[NOME]] já gravados pelo step de seleção de variáveis.
When('adiciona o texto {string} ao final do texto da portaria', (texto) => {
  textoPortariaPack.cadastro.editor()
    .click()
    .type('{end}')
    .type(` ${texto}`, { delay: 20 })
})

When('apaga o conteúdo do texto da portaria mantendo as variáveis selecionadas', () => {
  textoPortariaPack.cadastro.editor()
    .click()
    .type('{selectall}{del}')
    .type('Texto sem os marcadores de variável', { delay: 20 })
})

// ─── Validações pós-submit ──────────────────────────────────────────────────

Then('cada campo obrigatorio do cadastro de texto de portaria exibe a mensagem de campo obrigatorio', () => {
  textoPortariaPack.cadastro.mensagensDeErro()
    .should('have.length.at.least', 6)
    .each(($mensagem) => {
      cy.wrap($mensagem).should('contain.text', 'Campo obrigatório.')
    })
})

Then('a notificação de sucesso do cadastro de texto de portaria deve exibir {string}', (texto) => {
  cy.get('.ant-notification-notice-success', { timeout: 15000 })
    .contains(texto, { timeout: 15000 })
    .should('be.visible')
})

// A listagem exibe um rótulo diferente do combobox pra alguns tipos (ver
// TIPO_PORTARIA_NA_LISTAGEM no locators) — compara contra o rótulo traduzido.
Then('o novo modelo de texto aparece na listagem com o tipo {string}', (tipoSelecionadoNoCombobox) => {
  const tipoEsperadoNaListagem = TIPO_PORTARIA_NA_LISTAGEM[tipoSelecionadoNoCombobox]
  if (!tipoEsperadoNaListagem) {
    throw new Error(`"${tipoSelecionadoNoCombobox}" não está mapeado em TIPO_PORTARIA_NA_LISTAGEM.`)
  }

  cy.get('@nomeModeloCriado').then((nome) => {
    textoPortariaPack.listagem.linhas()
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const linha = $linhas.toArray().find((el) => el.textContent.includes(nome))
        expect(linha, `linha da listagem contendo "${nome}"`).to.exist
        expect(linha.textContent, 'tipo de portaria exibido na linha').to.include(tipoEsperadoNaListagem)
      })
  })
})

Then('o modelo de texto preenchido não aparece na listagem', () => {
  cy.get('@nomeModeloCriado').then((nome) => {
    textoPortariaPack.listagem.linhas().should(($linhas) => {
      const existe = $linhas.toArray().some((el) => el.textContent.includes(nome))
      expect(existe, `"${nome}" não deveria aparecer na listagem`).to.be.false
    })
  })
})

Then('o sistema exibe o modal de revisão de variáveis do texto', () => {
  textoPortariaPack.modalRevisarVariaveis.dialog().should('be.visible')
})

Then('o modal de revisão de variáveis exibe o texto {string}', (texto) => {
  textoPortariaPack.modalRevisarVariaveis.dialog().should('contain.text', texto)
})
