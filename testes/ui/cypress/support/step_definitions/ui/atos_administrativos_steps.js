// Step Definitions — Pesquisa de Atos Administrativos
// Steps comuns reutilizados:
//   • "valida a existencia do titulo {string}"     → alterar_senha_steps.js
//
// Observação: "o sistema exibe a tabela sem resultados" NÃO é reutilizado
// aqui — aquele step (definido em altera_DO_steps.js) usa o locator de
// Empty do Ant Design (.ant-empty/.ant-table-empty), que não existe nesta
// tela. Esta feature usa seu próprio step com texto diferente, checando o
// markup real desta tela ("Não há dados" como texto dentro do tbody).
//
// Login: esta feature tem seu próprio step de autenticação — "que o
// usuário já está autenticado no sistema" — em vez de reutilizar o step
// compartilhado de common_steps.js. Cada um dos Cenários desta feature
// roda o Contexto (Background) antes de si, e o login via UI completo
// (visitar /login, digitar RF/CPF e senha, clicar em Acessar) é lento;
// como nenhum cenário aqui depende de uma sessão "fresca", o login real só
// precisa acontecer uma vez por execução da suíte. Mudança isolada nesta
// feature — common_steps.js e as demais features continuam fazendo login
// via UI a cada cenário.
//
// Abordagem: cy.session (restaurar cookies/localStorage após um hard
// reload) foi tentada e descartada — confirmado em execução real que esta
// aplicação não recompõe o estado autenticado da SPA a partir de um reload
// frio, mesmo com os cookies corretos presentes (login some, ou o app fica
// preso na raiz sem nunca navegar para a tela de destino). Em vez de lutar
// contra esse comportamento, a Funcionalidade (no .feature) carrega a tag
// @testIsolation(false), suportada nativamente pelo cypress-cucumber-
// preprocessor como suite-level override — o Cypress só aceita mudar essa
// config dessa forma, não em runtime/hook. Com isso o navegador nunca é
// resetado entre os cenários desta feature: a sessão da SPA permanece viva
// na memória, exatamente como um usuário real navegando sem dar F5. O
// login via UI roda uma única vez (1º cenário); os demais reaproveitam a
// mesma aba/página já autenticada.

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import {
  atosAdministrativosPack,
  atosAdministrativosUrls,
} from '../../ui/locators/atos_administrativos_locators'

// ─── Contexto — Login único, reaproveitado entre cenários ──────────────────
let loginJaRealizado = false

Given('que o usuário já está autenticado no sistema', () => {
  if (loginJaRealizado) {
    // Já autenticado e na tela correta — o navegador não foi resetado
    // desde o cenário anterior (testIsolation:false acima). Se o cenário
    // anterior falhou com um modal Radix (Dialog/Select) ainda aberto, o
    // Cypress pula direto pro próximo teste sem rodar o fechamento — o
    // Radix deixa <body data-scroll-locked="1" style="pointer-events:none">
    // preso, o que bloqueia até o clique em "Limpar filtros" (elemento
    // coberto por um body com pointer-events:none) e quebra em cascata
    // todos os cenários seguintes. Fecha qualquer dialog/dropdown residual
    // com Esc antes de seguir.
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.get('body').type('{esc}')
        cy.wait(300)
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

  // .then() em vez de atribuir logo após a chamada: comandos Cypress são
  // enfileirados (assíncronos) — a linha seguinte a cy.realizarLogin(...)
  // rodaria antes do login realmente terminar, marcando a flag como "já
  // logado" mesmo se o login falhar (ex.: página fora do ar), fazendo os
  // cenários seguintes pularem o login direto para uma tela inexistente.
  cy.realizarLogin(username, password).then(() => {
    loginJaRealizado = true
  })
})

// Estado do último filtro aplicado e da última requisição de pesquisa,
// usados em "a tabela apresenta resultado para" para provar que o valor
// buscado foi realmente enviado ao backend — e não só que o texto aparece
// na tabela por coincidência (ex.: "Publicado" sendo o status mais comum
// mesmo com o filtro não tendo funcionado).
let ultimoFiltroAplicado = null
let corpoUltimaRequisicaoPesquisa = null

// Filtros de texto livre: o valor digitado tende a ir literal no corpo da
// requisição. "Tipo"/"Status" são dropdowns que costumam mandar um
// código/id para o backend em vez do texto exibido na tela, então não dá
// pra fazer essa checagem neles sem risco de falso negativo.
const FILTROS_TEXTO_LIVRE = [
  'Nº SEI',
  'Portaria de designação',
  'Servidor',
  'Registro Funcional (RF)',
]

// ─── Contexto — Confirmação de tela ────────────────────────────────────────
// "Atos administrativos" é a rota padrão pós-login (o app redireciona para
// /pages/atos-administrativos automaticamente ao acessar "/"). Não há
// navegação via sidebar aqui — apenas confirmamos que a tela carregou.
// O redirect é assíncrono, então a checagem de URL usa .should() (com
// retry) em vez de .then() — um .then() captura a URL uma única vez e
// pode rodar antes do redirect terminar, quebrando o teste à toa.
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
  // "Pesquisar" dispara um POST assíncrono para a própria rota — um wait
  // fixo não garante que a resposta já chegou antes das validações
  // seguintes, causando checagens em cima de um estado transitório da
  // tabela (mistura de linha antiga + "Não há dados" + resultado final).
  // Intercepta e aguarda essa resposta específica, mesmo padrão já usado
  // em designacao_steps.js para os POSTs de listagem/pesquisa.
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

// Validação forte: garante que TODAS as linhas visíveis contêm o valor
// pesquisado, não apenas que a tabela existe — evita falso positivo de um
// filtro que "parece" funcionar mas devolve resultados não relacionados.
//
// Usa .should(callback) em vez de .each() com elementos presos: a tabela
// re-renderiza de forma assíncrona (primeiro com dado antigo/parcial,
// depois com o resultado filtrado final), e um .each() guarda referência
// fixa aos elementos — se o React trocar o DOM no meio da checagem, o
// elemento "morre" e o Cypress lança "subject is no longer attached to
// the DOM". O callback do .should() reconsulta o DOM do zero a cada
// tentativa, então ele naturalmente re-tenta até a tabela estabilizar
// com o resultado correto, dentro do timeout.
Then('a tabela apresenta resultado para {string}', (valor) => {
  // Prova de que o filtro realmente foi aplicado no backend (não só que o
  // texto aparece na tabela por coincidência) — ver comentário na
  // declaração de FILTROS_TEXTO_LIVRE.
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
// Digitação direta nos inputs do RangePicker em vez de clicar em células do
// calendário: evita lidar com navegação entre meses/anos quando início e
// fim estão em painéis diferentes (ex.: janeiro e dezembro do mesmo ano).
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
// Não define "clica no botão {string}" aqui: esse step já existe, registrado
// globalmente em alterar_senha_steps.js (linha 121), e o Cucumber trava com
// "Multiple matching step definitions" se dois arquivos declararem o mesmo
// texto. O fallback genérico de lá (`cy.contains('button, a', btnText,
// {matchCase:false}).click({force:true})`) já cobre "Novo ato +" sem
// necessidade de um step dedicado.
Then('o sistema exibe as opções:', (dataTable) => {
  const opcoes = dataTable.raw().flat()
  opcoes.forEach((opcao) => {
    atosAdministrativosPack.novoAto.opcao(opcao.trim()).should('exist')
  })
})

// Nome específico ("... no menu de novo ato") em vez de "seleciona a opção
// {string}" genérico: esse texto já existe em insubsistente_steps.js, ligado
// a radio buttons Ant Design (.ant-radio-wrapper) — incompatível com o menu
// de ações do "Novo ato +" e causaria "Multiple matching step definitions".
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
// Após salvar uma designação o app redireciona para listagem-designacoes.
// Para voltar a "Atos Administrativos" sem logar de novo (a sessão continua
// viva entre Cenários por causa de @testIsolation(false), ver cabeçalho do
// arquivo), o teste navega pelo menu lateral esquerdo — mesmo tratamento de
// sidebar colapsada e filtro ":visible" (para não colidir com a cópia oculta
// do popup do Ant Design Menu) já usado em "navega até o menu lateral e
// seleciona {string}" (common_steps.js).
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

// Nome específico ("... no menu lateral") para não colidir com "seleciona a
// opção {string}" (insubsistente_steps.js) nem com "... no menu de novo ato"
// (acima) — os três textos precisam ser distintos para o Cucumber resolver
// sem ambiguidade.
When('seleciona a opção {string} no menu lateral', (opcao) => {
  cy.contains('span:visible, a:visible, div:visible', new RegExp(`^${opcao}$`, 'i'), { timeout: 15000 })
    .closest('li, [role="menuitem"], a')
    .click({ force: true })
  cy.wait(800)
})

// ─── Modal de ação (Nova cessação / Tornar insubsistente / etc.) ───────────
// Confirmado contra o HTML real: é um Dialog Radix/shadcn (role="dialog"),
// com <h2> de título, <label for="..."> + <input id="..."> e um <button
// type="submit" data-testid="botao-buscar-portaria">Buscar</button>.
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

// Select "Ano" do modal de busca por portaria — campo novo e obrigatório
// (ver atosAdministrativosPack.modal.selectAno). Abre o Select (shadcn/
// Radix) e clica na opção com o texto exato do ano; as opções usam o
// mesmo role="option" já tratado por atosAdministrativosPack.dropdown.
When('seleciona o ano {string} no campo de busca', (ano) => {
  atosAdministrativosPack.modal.selectAno().should('be.visible').click()
  cy.get('[role="option"]', { timeout: 10000 })
    .contains(new RegExp(`^${ano}$`))
    .should('be.visible')
    .click()
})

// ─── "Anular apostila" — a portaria buscada pode não ter nenhuma apostila
// vinculada. Nesse caso useNovoAto.buscarParaAnularApostila (src, branch
// test) retorna false e mostra "Essa portaria não possui apostila
// vinculada para anular." no próprio modal, sem navegar — resultado de
// negócio válido (nada para anular), não uma falha do teste. Reaproveita
// Cypress.env('apostilaCessacaoTemDados'), o mesmo flag que as etapas
// condicionais de apostilar_steps.js (Valida a existencia do texto,
// preenche o campo apostilamento, Valida o botão, Clica no botão
// apostilamento) e o branch "apostil" de "o sistema exibe a Tela" já
// verificam para pular com log em vez de falhar por timeout.
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
