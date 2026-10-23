// Steps do fluxo "editar_atos.feature": edição de uma designação ou cessação
// localizada por uma portaria específica (não uma linha aleatória) — por isso não
// reaproveita o step genérico "clica e seleciona a opção" (cessacao_steps.js),
// que em caso de falha reabre a listagem SEM filtro e tenta outra linha
// qualquer. Aqui a portaria buscada é sempre a mesma; se "Editar" não estiver
// disponível na linha filtrada, o cenário deve falhar de forma clara em vez
// de silenciosamente editar um registro diferente.

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { atosAdministrativosPack } from '../../ui/locators/atos_administrativos_locators'

// Campos do formulário (shadcn FormLabel) apontam via "for" para o id do
// controle — input, textarea ou RadioGroup. O data-testid passado em
// PortariaDesigacaoFields não chega ao DOM, por isso o label é a âncora.
const campoDaEdicao = (label) =>
  cy.contains('label', label, { timeout: 10000 })
    .invoke('attr', 'for')
    .then((inputId) => (inputId
      ? cy.get(`#${CSS.escape(inputId)}`)
      : cy.contains('label', label).parent().find('input, textarea').not('[type="hidden"]').first()))

const aliasDoCampo = (campo) =>
  campo === 'Nº SEI' ? 'novoSeiEditado' : `valorEditado-${campo.replace(/[^a-zA-Z0-9]+/g, '-')}`

const valorDoRadio = (opcao) => {
  const valores = { sim: 'sim', 'não': 'nao', nao: 'nao' }
  const valor = valores[opcao.trim().toLowerCase()]
  if (!valor) throw new Error(`Opção "${opcao}" não suportada — use "Sim" ou "Não".`)
  return valor
}

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Rotas abertas por cada tipo de ato: "Editar" de uma cessação abre a tela de
// cessação pelo id da designação de origem (/pages/cessacao?id=<ato_pai_id>);
// o clique na linha abre a tela de visualização do próprio ato.
const ROTAS_POR_TIPO = {
  'designação': { editar: 'designacoes-passo-2', consultar: 'visualizar-designacao' },
  'cessação': { editar: '/pages/cessacao?id=', consultar: 'visualizar-cessacao' },
}

// O conteúdo de um accordion Radix fica no elemento apontado pelo
// aria-controls do botão — escopo para validar só os textos daquela seção.
const conteudoDaSecao = (secao) =>
  cy.contains('main button', secao, { timeout: 15000 })
    .invoke('attr', 'aria-controls')
    .then((idConteudo) => cy.get(`#${CSS.escape(idConteudo)}`, { timeout: 15000 }))

// Textos comparados por igualdade, aceitando só o "*" de labels obrigatórios
// ("Ano Vigente*") e um complemento entre parênteses que a UI acrescenta ao
// label ("Até (16 dias)"); assim não passa por um texto maior que apenas
// contenha o esperado.
const validarTextos = (escopo, dataTable) => {
  dataTable.raw().flat().map((t) => t.trim()).filter(Boolean).forEach((texto) => {
    escopo()
      .contains(new RegExp(`^\\s*${escaparRegex(texto)}\\s*\\*?\\s*(\\([^)]*\\))?\\s*$`), { timeout: 15000 })
      .scrollIntoView()
      .should('be.visible')
  })
}

// Pré-requisito de massa de dado: a portaria buscada precisa estar com status
// "Aguardando publicação" em QA — só atos não publicados oferecem a opção
// "Editar" no menu de ações (ListagemDeAtosAdministrativos.tsx, itens
// "desigacaoNaoPublicadaItems" e "cessacaoNaoPublicadaItems"). Se o ato virar
// "Publicado", este step falha ao não achar "Editar" no menu em vez de
// mascarar o problema tentando outra linha.
When(/^clica no menu de ações e seleciona "([^"]+)" para a (designação|cessação) filtrada$/, (opcao, tipo) => {
  atosAdministrativosPack.tabela.linhas().should('have.length.greaterThan', 0)

  atosAdministrativosPack.tabela.linhas()
    .first()
    .find('.ant-dropdown-trigger, [class*="dropdown-trigger"]')
    .first()
    .click({ force: true })

  cy.wait(500)

  cy.get('ul li span', { timeout: 10000 })
    .should('have.length.greaterThan', 0)
    .contains(new RegExp(`^${opcao.trim()}$`, 'i'))
    .should('be.visible')
    .click({ force: true })

  cy.url({ timeout: 15000 }).should('include', ROTAS_POR_TIPO[tipo].editar)
})

// Lê o valor de volta do input (após a máscara ser aplicada) em vez de prever
// a formatação — garante que a conferência posterior compare com o que a UI
// realmente exibe/persiste, não com uma suposição sobre a máscara do campo.
When('edita o campo {string} com um novo número e guarda o valor para conferência', (campo) => {
  if (campo !== 'Nº SEI') {
    throw new Error(`Campo "${campo}" não suportado neste step — apenas "Nº SEI" está implementado.`)
  }

  const numeroAleatorio = String(Math.floor(1000000 + Math.random() * 9000000))

  campoDaEdicao('Nº SEI')
    .should('be.visible')
    .and('not.be.disabled')
    .clear()
    .type(numeroAleatorio, { delay: 80 })
    .then(($input) => {
      cy.wrap($input.val()).as(aliasDoCampo('Nº SEI'))
    })

  cy.wait(300)
})

Then('a tabela apresenta o novo valor do {string} editado', (campo) => {
  if (campo !== 'Nº SEI') {
    throw new Error(`Campo "${campo}" não suportado neste step — apenas "Nº SEI" está implementado.`)
  }

  cy.get('@novoSeiEditado').then((novoSei) => {
    atosAdministrativosPack.tabela.linhas().should(($linhas) => {
      const encontrado = $linhas.toArray().some((el) => el.textContent.includes(novoSei))
      expect(encontrado, `tabela deve exibir o novo Nº SEI "${novoSei}" após a edição`).to.be.true
    })
  })
})

When(/^clica na (designação|cessação) encontrada na listagem para consultar$/, (tipo) => {
  atosAdministrativosPack.tabela.linhas().should('have.length.greaterThan', 0)

  atosAdministrativosPack.tabela.linhas()
    .first()
    .find('td')
    .first()
    .click()

  cy.url({ timeout: 15000 }).should('include', ROTAS_POR_TIPO[tipo].consultar)
})

Then('os dados exibidos confirmam a alteração do {string}', (campo) => {
  if (campo !== 'Nº SEI') {
    throw new Error(`Campo "${campo}" não suportado neste step — apenas "Nº SEI" está implementado.`)
  }

  cy.get('@novoSeiEditado').then((novoSei) => {
    cy.get('main', { timeout: 15000 }).should('contain.text', novoSei)
  })
})

Then('valida o título da página {string}', (titulo) => {
  cy.contains('h1', new RegExp(`^\\s*${escaparRegex(titulo.trim())}\\s*$`), { timeout: 15000 })
    .should('be.visible')
})

// O título da cessação traz o nome do servidor ("Cessação - Servidor: <nome>").
Then('valida o título da página iniciando com {string}', (inicio) => {
  cy.contains('h1', new RegExp(`^\\s*${escaparRegex(inicio.trim())}`), { timeout: 15000 })
    .should('be.visible')
})

Then('a tela de edição exibe os textos:', (dataTable) => {
  validarTextos(() => cy.get('main', { timeout: 15000 }), dataTable)
})

Then('a seção {string} exibe os textos:', (secao, dataTable) => {
  validarTextos(() => conteudoDaSecao(secao), dataTable)
})

// "Servidor titular" só traz dados quando a designação de origem tem titular
// (Cargo Disponível); em Cargo Vago a seção exibe apenas a mensagem informada.
Then('a seção {string} exibe os textos ou a mensagem {string}:', (secao, mensagem, dataTable) => {
  conteudoDaSecao(secao).then(($conteudo) => {
    if ($conteudo.text().includes(mensagem)) {
      cy.wrap($conteudo).contains(mensagem).should('be.visible')
      cy.log(`↷ Seção "${secao}" sem dados — exibe "${mensagem}"`)
      return
    }
    validarTextos(() => conteudoDaSecao(secao), dataTable)
  })
})

// O accordion "Unidade Proponente" abre fechado e o Radix não renderiza o
// conteúdo enquanto fechado — sem expandir, os labels internos não existem.
When('expande a seção {string}', (secao) => {
  cy.contains('main button', secao, { timeout: 15000 })
    .scrollIntoView()
    .then(($botao) => {
      if ($botao.attr('data-state') !== 'open') cy.wrap($botao).click()
    })

  cy.contains('main button', secao).should('have.attr', 'data-state', 'open')
})

Then('o campo {string} da edição exibe o valor {string}', (campo, valor) => {
  campoDaEdicao(campo).should('have.value', valor)
})

Then('o campo {string} da edição está preenchido', (campo) => {
  campoDaEdicao(campo).should(($campo) => {
    expect(String($campo.val()).trim(), `campo "${campo}" deve vir preenchido`).not.to.be.empty
  })
})

Then('o campo {string} da edição está desabilitado', (campo) => {
  campoDaEdicao(campo).should('be.disabled')
})

// Campos "Sim/Não" (CheckboxField) são RadioGroup do Radix: o label do campo
// aponta para o grupo, e cada opção é um button[role=radio] com value sim/nao.
When('marca a opção {string} no campo {string}', (opcao, campo) => {
  campoDaEdicao(campo)
    .find(`button[role="radio"][value="${valorDoRadio(opcao)}"]`)
    .scrollIntoView()
    .click()
    .should('have.attr', 'data-state', 'checked')
})

Then('a opção {string} está marcada no campo {string}', (opcao, campo) => {
  campoDaEdicao(campo)
    .find(`button[role="radio"][value="${valorDoRadio(opcao)}"]`, { timeout: 15000 })
    .should('have.attr', 'data-state', 'checked')
})

// Texto com timestamp: cada execução grava um valor diferente, então a
// conferência pós-salvamento não passa por causa de um valor de execução anterior.
When('preenche o campo de texto {string} com um texto único e guarda o valor para conferência', (campo) => {
  const texto = `Automação QA - ${campo} - ${Date.now()}`

  campoDaEdicao(campo)
    .scrollIntoView()
    .should('be.visible')
    .and('not.be.disabled')
    .clear()
    .type(texto, { delay: 0 })
    .should('have.value', texto)

  cy.wrap(texto).as(aliasDoCampo(campo))
})

Then('o campo {string} da edição exibe o valor guardado', (campo) => {
  cy.get(`@${aliasDoCampo(campo)}`).then((valorGuardado) => {
    campoDaEdicao(campo).should('have.value', valorGuardado)
  })
})

// O filtro "Tipo" vem com "Designação" por padrão. Comparação exata porque
// "Cessação" também é parte de "Insubsistência de Cessação" e "Apostila de Cessação".
When('clica em tipo e seleciona {string}', (tipo) => {
  atosAdministrativosPack.filtros.tipo().should('be.visible').click()

  cy.get('[role="option"]', { timeout: 10000 })
    .contains(new RegExp(`^\\s*${escaparRegex(tipo.trim())}\\s*$`))
    .should('be.visible')
    .click()

  atosAdministrativosPack.filtros.tipo().should('contain.text', tipo.trim())
})

Then('o sistema exibe a tela de edição da cessação', () => {
  cy.url({ timeout: 15000 }).should('include', ROTAS_POR_TIPO['cessação'].editar)
  cy.contains('main button', 'Portaria de cessação', { timeout: 20000 }).should('be.visible')
})

// Inverte o valor atual (Sim ↔ Não) para garantir que a edição muda de fato o
// registro, independente do que a execução anterior deixou gravado.
When('inverte a opção do campo {string} e guarda o valor para conferência', (campo) => {
  campoDaEdicao(campo)
    .find('button[role="radio"][data-state="checked"]', { timeout: 15000 })
    .invoke('attr', 'value')
    .then((valorAtual) => {
      const novoValor = valorAtual === 'sim' ? 'nao' : 'sim'

      campoDaEdicao(campo)
        .find(`button[role="radio"][value="${novoValor}"]`)
        .scrollIntoView()
        .click()
        .should('have.attr', 'data-state', 'checked')

      cy.wrap(novoValor).as(aliasDoCampo(campo))
    })
})

Then('a opção guardada está marcada no campo {string}', (campo) => {
  cy.get(`@${aliasDoCampo(campo)}`).then((valorGuardado) => {
    campoDaEdicao(campo)
      .find(`button[role="radio"][value="${valorGuardado}"]`, { timeout: 15000 })
      .should('have.attr', 'data-state', 'checked')
  })
})
