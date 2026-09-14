// Step Definitions — Gestão de Cargos Base (Pesquisa / Filtros)
// Steps comuns reutilizados (não redefinidos aqui):
//   • "valida a existencia do Texto {string}"        → common_steps.js
//   • "Valida a existencia da Tabela"                → common_steps.js
//   • "Valida a existencia das Colunas {string}"     → cessacao_steps.js
//   • "valida a existencia do Botão {string}"        → cessacao_steps.js
//   • "clica no botão {string}"                      → alterar_senha_steps.js
//
// Não reaproveita "que o usuário está autenticado no sistema" (common_
// steps.js — login completo sempre) nem "que o usuário já está autenticado
// no sistema" (atos_administrativos_steps.js — login único por suíte, mas
// com recuperação hardcoded pra tela de Atos Administrativos, incompatível
// aqui). Nem "preenche o campo {string} com {string}" (idem: só resolve
// campo dentro de [role="dialog"]) nem "está na página {string}" (idem:
// ignora o parâmetro e sempre valida a URL de Atos Administrativos). Por
// isso os steps abaixo usam texto próprio ("está logado", "preenche o
// filtro", "está na tela") em vez de colidir/depender desses.

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { gestaoCargosBasePack, gestaoCargosBaseUrls } from '../../ui/locators/gestao_cargos_base_locators'

// ─── Login único por suíte (sessão reaproveitada entre os cenários desta
// feature) ────────────────────────────────────────────────────────────────
// Exige a tag @testIsolation(false) na Funcionalidade — sem ela o Cypress
// reseta o navegador (cookies/localStorage) entre cenários e este cache
// nunca seria reaproveitado de verdade, cada "if" cairia sempre no login
// completo mesmo assim.
let loginJaRealizado = false

Given('que o usuário está logado no sistema', () => {
  if (loginJaRealizado) {
    // Sessão já ativa nesta suíte — só fecha modal/dropdown residual que o
    // cenário anterior possa ter deixado aberto (mesma categoria de
    // problema já resolvida em atos_administrativos_steps.js), sem
    // recuperação por URL: a navegação de verdade acontece sempre em
    // "está na tela", que já roda de novo em todo cenário.
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

  // .then() em vez de atribuir logo após a chamada: cy.realizarLogin é
  // assíncrono (comandos Cypress são enfileirados) — atribuir antes do
  // .then() marcaria a flag como "logado" mesmo se o login falhar.
  cy.realizarLogin(username, password).then(() => {
    loginJaRealizado = true
  })
})

Given('está na tela {string}', (tela) => {
  if (tela.trim().toLowerCase() !== 'gestão de cargos base') {
    throw new Error(`Step "está na tela" só implementado para "Gestão de cargos base" (recebido: "${tela}")`)
  }

  // NÃO usa cy.visit() direto pra "/pages/gestao/cargos-base": confirmado em
  // execução real que a aplicação responde com 307 e redireciona de volta
  // pra "/" numa navegação dura (reload completo) pra uma rota profunda,
  // mesmo logo após o login — mesmo comportamento já documentado nos
  // comentários de atos_administrativos_steps.js ("a aplicação não
  // recompõe o estado autenticado da SPA a partir de um reload frio"). A
  // navegação real só funciona clicando pelo menu lateral, como um usuário
  // faria — por isso a sequência abaixo replica esse caminho.

  // Sidebar colapsada: mesmo tratamento usado em common_steps.js
  // ("navega até o menu lateral e seleciona") — sem isso, qualquer clique
  // num item do menu dispara navegação em vez de abrir o submenu.
  cy.get('aside').then(($aside) => {
    if ($aside.hasClass('is-collapsed')) {
      cy.get('aside').find('button').first().click({ force: true })
      cy.get('aside', { timeout: 8000 }).should('not.have.class', 'is-collapsed')
      cy.wait(600)
    }
  })

  cy.get('aside, nav', { timeout: 10000 }).should('be.visible')

  // Abre o submenu "Gestão" (não navega — só expande, mesmo padrão do menu
  // lateral usado no resto do projeto). Em execução real esse clique nem
  // sempre expande o submenu na primeira tentativa (confirmado: 1 a cada 3
  // execuções não achava "Cargos base" depois do wait) — sem elemento
  // óbvio pra esperar (o próprio "Cargos base" só existe no DOM depois do
  // submenu abrir), a saída é tentar de novo em vez de confiar numa única
  // tentativa com wait fixo.
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
        .some((el) => /^Cargos base$/i.test(el.textContent.trim()))

      if (!abriu && tentativa < MAX_TENTATIVAS_MENU) {
        cy.log(`Submenu "Gestão" não abriu na tentativa ${tentativa}/${MAX_TENTATIVAS_MENU} — tentando de novo`)
        abrirSubmenuGestao(tentativa + 1)
      }
    })
  }
  abrirSubmenuGestao(1)

  // Clica no item "Cargos base" dentro do submenu recém-aberto.
  cy.contains('span:visible, a:visible, div:visible', /^Cargos base$/i, { timeout: 15000 })
    .closest('li, [role="menuitem"], a')
    .click({ force: true })

  cy.url({ timeout: 20000 }).should('include', gestaoCargosBaseUrls.pagina)
  gestaoCargosBasePack.titulo().should('be.visible')
  cy.get('.loading, .spinner, .loader').should('not.exist')

  // Com a sessão reaproveitada entre cenários (@testIsolation(false)), um
  // cenário anterior pode ter deixado filtro aplicado — reseta pra um
  // estado limpo antes de começar o cenário atual. "Limpar filtros" só
  // existe habilitado quando há algo pra limpar; se já estiver desabilitado
  // (primeiro cenário da suíte, tela já limpa) não há nada a fazer.
  cy.get('body').then(($body) => {
    const $botaoLimpar = $body.find('[data-testid="btn-limpar-filtros"]')
    if ($botaoLimpar.length && !$botaoLimpar.prop('disabled')) {
      cy.wrap($botaoLimpar).click({ force: true })
      cy.wait(500)
    }
  })
})

Then('valida a existencia dos campos de filtro {string}', (camposParam) => {
  const campos = camposParam.split(',').map((c) => c.trim()).filter(Boolean)
  campos.forEach((campo) => {
    cy.contains('label', campo, { timeout: 10000 }).should('be.visible')
  })
})

// Pesquisar/Limpar filtros começam desabilitados e só habilitam quando
// pelo menos 1 filtro é preenchido — comportamento confirmado em execução
// real (os dois botões vêm com o atributo disabled no carregamento inicial
// da tela, e ficam habilitados assim que qualquer campo recebe valor).
Then('os botões {string} e {string} devem estar desabilitados', (btn1, btn2) => {
  cy.contains('button', btn1, { timeout: 10000 }).should('be.disabled')
  cy.contains('button', btn2, { timeout: 10000 }).should('be.disabled')
})

Then('os botões {string} e {string} devem estar habilitados', (btn1, btn2) => {
  cy.contains('button', btn1, { timeout: 10000 }).should('not.be.disabled')
  cy.contains('button', btn2, { timeout: 10000 }).should('not.be.disabled')
})

// Select shadcn/ui (Radix) — mesmo padrão de dropdown já usado em
// atos_administrativos_locators.js: abre o trigger (button role=combobox
// irmão do label) e clica na opção pelo texto exato (regex ancorada evita
// que uma opção prefixo/sufixo de outra dê match errado).
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

// Case-insensitive de propósito: o próprio filtro da tela busca sem
// diferenciar maiúsculas/minúsculas (confirmado em execução real —
// digitar "escola" em "Descrição Completa" encontrou linhas com "ESCOLA"
// em caixa alta), então a validação segue a mesma semântica.
//
// ":not(.ant-table-measure-row)" exclui uma linha oculta que o Ant Design
// injeta em tbody (usada só internamente pra calcular largura de coluna),
// cujo texto é o dos próprios cabeçalhos concatenados — confirmado em
// execução real: sem esse filtro, o .each() sempre falhava nessa linha
// fantasma antes de chegar nas linhas de dado de verdade.
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

// "Vazio" cobre os dois tipos de campo desta tela: combobox (volta a
// exibir o placeholder "Selecione") e input de texto (volta a "").
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
