// Step Definitions — Textos de Portaria
// Cobre a listagem (/pages/gestao/textos-de-portaria), o modal "Novo texto
// de portaria" e o cadastro (/pages/gestao/criar-textos-de-portaria).
//
// Steps comuns reutilizados (não redefinidos aqui):
//   • "que o usuário está logado no sistema" / "está na tela {string}" → gestao_cargos_base_steps.js
//     (o branch "textos de portarias" foi adicionado lá, junto do de
//     "gestão de cargos base", em vez de duplicar aqui a lógica de abrir o
//     submenu lateral "Gestão")
//   • "clica no botão {string}"                                        → alterar_senha_steps.js
//     (usado direto no .feature pra "Cadastrar novo texto", "Criar texto",
//     "Cancelar" do modal "Novo texto de portaria" e "Revisar texto" — nenhum
//     desses cai nos branches especiais problemáticos dessa step. "Cancelar"
//     da TELA de cadastro é o único caso à parte — ver o step próprio
//     abaixo, mesmo motivo já documentado em gestao_cargo_cadastro_steps.js:
//     aquele branch genérico de "cancelar" só procura dentro de
//     [role="dialog"]/[class*="modal"], e o botão Cancelar da tela de
//     cadastro fica solto no cabeçalho da página, não em modal.)
//
// Textos próprios (nunca "preenche o campo {string} com {string}" nem
// "seleciona a opção {string} no campo {string}" nem "o modal exibe o texto
// {string}"): esses já existem em outros arquivos com escopo diferente —
// reaproveitar o mesmo texto aqui causaria "Multiple matching step
// definitions" no Cucumber.

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { textoPortariaPack, textoPortariaUrls, TIPOS_DE_PORTARIA, TIPO_PORTARIA_NA_LISTAGEM } from '../../ui/locators/texto_portaria_locators'

// ─── Modal "Novo texto de portaria" ─────────────────────────────────────────
// Não usa "o sistema exibe o modal {string}" (já registrado em
// atos_administrativos_steps.js, escopado a outro locator/modal — reaproveitar
// o mesmo texto aqui causaria "Multiple matching step definitions").

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

// Combobox próprio (data-testid="select-listar-para", confirmado em
// inspeção real do DOM — nome do testid não reflete o campo real "Tipo de
// portaria", provável reaproveitamento de outro componente; documentado
// aqui pra não confundir leitura futura). Como o cenário depende de qual
// tipo foi escolhido (um cenário por opção do combobox), este step é
// explícito em vez de aleatório — ao contrário de Status/Tipo de cargo
// abaixo, que qualquer opção válida serve.
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

// Status e Tipo de cargo usam o mesmo componente Select (shadcn/Radix) —
// qualquer opção válida cobre o campo, por isso a escolha é aleatória entre
// as visíveis (mesmo espírito de "seleciona um código de cargo aleatório no
// EOL" em gestao_cargo_cadastro_steps.js). Nome de step com sufixo "do
// cadastro de texto de portaria" pra não colidir com "seleciona a opção
// {string} no campo {string}" (gestao_cargo_cadastro_steps.js) nem com
// "seleciona a opção {string} no filtro {string}" (gestao_cargos_base_steps.js).
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

// Nome do Modelo precisa ser único a cada execução (a suíte roda contra QA
// de verdade e cadastra o registro de fato — POST real, mesmo padrão de
// gestao_cargo_cadastro_steps.js) — por isso o valor digitado leva um sufixo
// de timestamp, guardado em "@nomeModeloCriado" pra "o novo modelo de texto
// aparece na listagem" conferir depois sem precisar repetir a string.
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

// Selecionar uma variável insere automaticamente o placeholder [[NOME]]
// correspondente no editor de Texto da portaria (comportamento confirmado
// em inspeção real: clicar a opção "Portaria" no popover grava o chip
// removível E escreve "[[PORTARIA]]" no editor, sem precisar digitar nada à
// parte) — por isso este step não mexe no editor diretamente, só no popover.
When('seleciona as variáveis {string} no texto da portaria', (variaveisCsv) => {
  const variaveis = variaveisCsv.split(',').map((v) => v.trim()).filter(Boolean)

  textoPortariaPack.cadastro.variavel.botao().should('be.visible').click()

  variaveis.forEach((nome) => {
    textoPortariaPack.cadastro.variavel.opcao(nome).should('be.visible').click()
  })

  cy.get('body').type('{esc}')
})

// Acrescenta ao final do conteúdo já existente (placeholders inseridos pelo
// step acima) — NUNCA limpa o editor antes: setar o value/clear() direto
// apaga os placeholders [[NOME]] já gravados (confirmado em inspeção manual
// via evaluate: um fill() bruto no contenteditable substitui o conteúdo
// inteiro). "{end}" garante que o cursor esteja no fim antes de digitar.
When('adiciona o texto {string} ao final do texto da portaria', (texto) => {
  textoPortariaPack.cadastro.editor()
    .click()
    .type('{end}')
    .type(` ${texto}`, { delay: 20 })
})

// Único jeito confirmado de reproduzir a validação "Revise as variáveis do
// texto" de propósito: apaga o conteúdo do editor (removendo os placeholders
// [[NOME]] já inseridos) mas mantém os chips de variável selecionados no
// popover — a mesma inconsistência que a tela detecta e bloqueia no submit.
When('apaga o conteúdo do texto da portaria mantendo as variáveis selecionadas', () => {
  textoPortariaPack.cadastro.editor()
    .click()
    .type('{selectall}{del}')
    .type('Texto sem os marcadores de variável', { delay: 20 })
})

// ─── Validações pós-submit ──────────────────────────────────────────────────

// FormMessage (shadcn Form) só existe no DOM quando o campo tem erro — os 6
// campos obrigatórios da tela (Tipo de portaria, Status, Nome do Modelo,
// Tipo de cargo, Variavel, Texto da portaria — "Observações" é o único
// opcional) renderizam "Campo obrigatório." ao tentar submeter vazio
// (confirmado em execução real).
Then('cada campo obrigatorio do cadastro de texto de portaria exibe a mensagem de campo obrigatorio', () => {
  textoPortariaPack.cadastro.mensagensDeErro()
    .should('have.length.at.least', 6)
    .each(($mensagem) => {
      cy.wrap($mensagem).should('contain.text', 'Campo obrigatório.')
    })
})

// Notificação usa notification.success do antd (mesma classe já usada em
// gestao_cargo_cadastro_steps.js/apostilar_steps.js/altera_DO_steps.js),
// renderizada via portal direto em document.body — por isso não usa a step
// "valida a existencia do Texto" de common_steps.js (escopada a <main>).
Then('a notificação de sucesso do cadastro de texto de portaria deve exibir {string}', (texto) => {
  cy.get('.ant-notification-notice-success', { timeout: 15000 })
    .contains(texto, { timeout: 15000 })
    .should('be.visible')
})

// O parâmetro {string} é o tipo escolhido no COMBOBOX de cadastro — a
// coluna "Tipo de portaria" da listagem exibe um rótulo diferente pra 3 dos
// 8 tipos (ver comentário de TIPO_PORTARIA_NA_LISTAGEM no locators), por
// isso a asserção compara contra o rótulo traduzido, não contra o texto
// literal recebido.
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

// Usa "@nomeModeloCriado" (não o texto literal do .feature) de propósito:
// o valor real digitado leva o sufixo de timestamp adicionado por "preenche
// o campo {string} do cadastro de texto de portaria com um nome único de
// automação para {string}" — conferir o texto sem o sufixo sempre daria
// "não encontrado", mesmo com o cadastro tendo sido cancelado com sucesso.
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
