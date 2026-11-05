// Steps do fluxo "editar_atos.feature": edição de uma designação, cessação,
// insubsistência ou apostila localizada por uma portaria específica (não uma linha
// aleatória) — por isso não reaproveita o step genérico "clica e seleciona a opção" (cessacao_steps.js),
// que em caso de falha reabre a listagem SEM filtro e tenta outra linha
// qualquer. Aqui a portaria buscada é sempre a mesma; se "Editar" não estiver
// disponível na linha filtrada, o cenário deve falhar de forma clara em vez
// de silenciosamente editar um registro diferente.

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { atosAdministrativosPack } from '../../ui/locators/atos_administrativos_locators'

// "Informações adicionais" (passo 3 e consulta) usa o FormItem do antd, sem o
// contexto de id do shadcn — o "for" do label não aponta para o textarea.
const CAMPOS_SEM_LABEL_ASSOCIADO = {
  'Informações adicionais': () =>
    cy.contains('label', 'Insira informações que considerar importante', { timeout: 15000 })
      .closest('.ant-form-item')
      .find('textarea'),
}

// Campos do formulário (shadcn FormLabel) apontam via "for" para o id do
// controle — input, textarea ou RadioGroup. O data-testid passado em
// PortariaDesigacaoFields não chega ao DOM, por isso o label é a âncora.
// Na apostila "Nº SEI" e "D.O" aparecem duas vezes: em "Dados da apostila"
// (somente leitura) e em "Portarias de designação" — entre labels iguais
// vale o primeiro controle habilitado, que é o editável.
const campoDaEdicao = (label) => CAMPOS_SEM_LABEL_ASSOCIADO[label]
  ? CAMPOS_SEM_LABEL_ASSOCIADO[label]()
  : cy.contains('label', label, { timeout: 10000 })
    .then(() => cy.get('label'))
    .then(($labels) => {
      const doc = $labels[0].ownerDocument
      const todos = $labels.toArray()
      const exatos = todos.filter((el) => textoExato(label).test(el.textContent))
      const controles = (exatos.length ? exatos : todos.filter((el) => el.textContent.includes(label)))
        .map((el) => el.getAttribute('for') && doc.getElementById(el.getAttribute('for')))
        .filter(Boolean)
      const alvo = controles.find((el) => !el.disabled) ?? controles[0]

      return alvo
        ? cy.get(`#${CSS.escape(alvo.id)}`)
        : cy.contains('label', label).parent().find('input, textarea').not('[type="hidden"]').first()
    })

const aliasDoCampo = (campo) =>
  campo === 'Nº SEI' ? 'novoSeiEditado' : `valorEditado-${campo.replace(/[^a-zA-Z0-9]+/g, '-')}`

const valorDoRadio = (opcao) => {
  const valores = { sim: 'sim', 'não': 'nao', nao: 'nao' }
  const valor = valores[opcao.trim().toLowerCase()]
  if (!valor) throw new Error(`Opção "${opcao}" não suportada — use "Sim" ou "Não".`)
  return valor
}

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Select do Radix (Impedimento, Detalhe para histórico): o Root não repassa o
// id do FormControl ao DOM, então o trigger é achado a partir do label irmão.
const comboDoCampo = (label) =>
  cy.contains('label', label, { timeout: 15000 })
    .parent()
    .find('button[role="combobox"]', { timeout: 15000 })

const TEXTO_DO_RADIO = { sim: 'Sim', nao: 'Não' }

const formatarDataBR = (data) =>
  [data.getDate(), data.getMonth() + 1].map((n) => String(n).padStart(2, '0')).concat(data.getFullYear()).join('/')

// Formato do atributo "title" das células do calendário do antd.
const formatarDataISO = (data) =>
  [data.getFullYear(), data.getMonth() + 1, data.getDate()].map((n) => String(n).padStart(2, '0')).join('-')

// Rotas abertas por cada tipo de ato: "Editar" de uma cessação abre a tela de
// cessação pelo id da designação de origem (/pages/cessacao?id=<ato_pai_id>),
// já o de uma insubsistência ou apostila usa o id dela mesma; o clique na
// linha abre a tela de visualização do próprio ato.
const ROTAS_POR_TIPO = {
  'designação': { editar: 'designacoes-passo-2', consultar: 'visualizar-designacao' },
  'cessação': { editar: '/pages/cessacao?id=', consultar: 'visualizar-cessacao' },
  'insubsistência': { editar: '/pages/insubsistencia?id_insubsistencia=', consultar: 'visualizar-insubsistencia' },
  'apostila': { editar: '/pages/apostila?origem=designacao&apostila_id=', consultar: 'visualizar-apostila' },
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
const textoExato = (texto) => new RegExp(`^\\s*${escaparRegex(texto)}\\s*\\*?\\s*(\\([^)]*\\))?\\s*$`)

// Na consulta (e nas seções somente leitura da edição, como "Portaria de
// designação" na insubsistência) cada dado é um InfoItem: o <p> do rótulo fica
// numa div e o <p> do valor é o irmão seguinte dessa div.
const valorDoItemDaConsulta = (secao, item) =>
  conteudoDaSecao(secao)
    .contains('p', textoExato(item), { timeout: 15000 })
    .parent()
    .next('p')

const validarTextos = (escopo, dataTable) => {
  dataTable.raw().flat().map((t) => t.trim()).filter(Boolean).forEach((texto) => {
    escopo()
      .contains(textoExato(texto), { timeout: 15000 })
      .scrollIntoView()
      .should('be.visible')
  })
}

// Pré-requisito de massa de dado: a portaria buscada precisa estar com status
// "Aguardando publicação" em QA — só atos não publicados oferecem a opção
// "Editar" no menu de ações (ListagemDeAtosAdministrativos.tsx, itens
// "desigacaoNaoPublicadaItems", "cessacaoNaoPublicadaItems", "apostilaNaoPublicadaItems" e
// "insubsistenciaItemsNaoPublicada"). O status é conferido antes de abrir o
// menu para que, se o ato virar "Publicado", a falha aponte a massa de dado
// em vez de um "Editar" ausente — e sem mascarar tentando outra linha.
When(/^clica no menu de ações e seleciona "([^"]+)" para a (designação|cessação|insubsistência|apostila) filtrada$/, (opcao, tipo) => {
  atosAdministrativosPack.tabela.linhas().should('have.length.greaterThan', 0)

  atosAdministrativosPack.tabela.linhas().first().should(($linha) => {
    expect($linha.text(), `a ${tipo} filtrada deve estar "Aguardando publicação" para ser editável`)
      .to.contain('Aguardando publicação')
  })

  atosAdministrativosPack.tabela.linhas()
    .first()
    .find('.ant-dropdown-trigger, [class*="dropdown-trigger"]')
    .first()
    .click({ force: true })

  // Escopado ao dropdown aberto — "ul li span" sozinho também casa com o menu
  // lateral, e o antd mantém no DOM instâncias fechadas de dropdowns anteriores.
  cy.get('.ant-dropdown:not(.ant-dropdown-hidden) li span', { timeout: 10000 })
    .should('have.length.greaterThan', 0)
    .contains(new RegExp(`^\\s*${escaparRegex(opcao.trim())}\\s*$`, 'i'))
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

When(/^clica na (designação|cessação|insubsistência|apostila) encontrada na listagem para consultar$/, (tipo) => {
  atosAdministrativosPack.tabela.linhas().should('have.length.greaterThan', 0)

  atosAdministrativosPack.tabela.linhas()
    .first()
    .find('td')
    .first()
    .click()

  cy.url({ timeout: 15000 }).should('include', ROTAS_POR_TIPO[tipo].consultar)
})

// Os rótulos da consulta diferem dos da edição ("Caráter Excepcional" x
// "Carater Especial", "Cessar a partir de" x "Cessação a partir de"), por isso a
// tabela liga cada item da consulta ao campo editado cujo valor foi guardado.
Then('a seção {string} da consulta exibe os valores editados:', (secao, dataTable) => {
  dataTable.hashes().forEach(({ 'item da consulta': item, 'campo editado': campo }) => {
    cy.get(`@${aliasDoCampo(campo)}`).then((valorGuardado) => {
      const esperado = TEXTO_DO_RADIO[valorGuardado] ?? valorGuardado

      valorDoItemDaConsulta(secao, item).should(($valor) => {
        expect($valor.text().trim(), `item "${item}" da consulta`).to.eq(esperado)
      })
    })
  })
})

Then(/^a seção "([^"]+)" da (consulta|edição) exibe "([^"]*)" no item "([^"]+)"$/, (secao, tela, esperado, item) => {
  valorDoItemDaConsulta(secao, item).should(($valor) => {
    expect($valor.text().trim(), `item "${item}" da ${tela}`).to.eq(esperado)
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

Then(/^o campo "([^"]+)" da (?:edição|consulta) exibe o valor guardado$/, (campo) => {
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

Then('o sistema exibe a tela de edição da insubsistência', () => {
  cy.url({ timeout: 15000 }).should('include', ROTAS_POR_TIPO['insubsistência'].editar)
  cy.contains('main button', 'Portaria de Insubsistência', { timeout: 20000 }).should('be.visible')
})

Then('o sistema exibe a tela de edição da apostila', () => {
  cy.url({ timeout: 15000 }).should('include', ROTAS_POR_TIPO['apostila'].editar)
  cy.contains('main button', 'Dados da apostila', { timeout: 20000 }).should('be.visible')
})

// Na edição o tipo (Designação/Cessação) vem do ato original e o RadioGroup
// fica desabilitado (insubsistencia/page.tsx, "desabilita_radio").
Then('o tipo de insubsistência {string} está marcado e bloqueado para edição', (tipo) => {
  cy.contains('label', 'Selecione o tipo de insubsistência', { timeout: 15000 })
    .parent()
    .contains('label', textoExato(tipo))
    .invoke('attr', 'for')
    .then((idRadio) => cy.get(`#${CSS.escape(idRadio)}`))
    .should('have.attr', 'data-state', 'checked')
    .and('be.disabled')
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

const sortearEntre = (min, max) => min + Math.floor(Math.random() * (max - min + 1))

// O DatePicker do antd bloqueia o Enter (DateField), então a data é digitada
// para o calendário navegar até ela e confirmada clicando na célula.
const editarCampoDeData = (campo, data) => {
  const dataBR = formatarDataBR(data)

  campoDaEdicao(campo)
    .scrollIntoView()
    .should('be.visible')
    .and('not.be.disabled')
    .click()
    .type(`{selectall}{backspace}${dataBR}`, { delay: 50 })

  cy.get('.ant-picker-dropdown:visible', { timeout: 10000 })
    .find(`td[title="${formatarDataISO(data)}"]`, { timeout: 10000 })
    .click()

  campoDaEdicao(campo).should('have.value', dataBR)
  cy.wrap(dataBR).as(aliasDoCampo(campo))
}

// Data sorteada a cada execução para que o salvamento altere o registro de fato.
When(
  'edita o campo de data {string} com uma data entre {int} e {int} dias após hoje e guarda o valor para conferência',
  (campo, diasMin, diasMax) => {
    const data = new Date()
    data.setDate(data.getDate() + sortearEntre(diasMin, diasMax))
    editarCampoDeData(campo, data)
  }
)

// Substituição de Diretor (cargo 3360) só avança com período de 16 a 30 dias,
// contando o primeiro e o último dia (utils/designacao/substituicaoDiretor.ts);
// fora disso o "Avançar" fica desabilitado. Por isso a data final é sorteada a
// partir da data inicial já editada, e não a partir de hoje. A apostila não tem
// essa regra, mas reaproveita o step: o mesmo intervalo mantém o período válido.
When(
  'edita o campo de data {string} para um período de {int} a {int} dias contados de {string} e guarda o valor para conferência',
  (campo, diasMin, diasMax, campoInicio) => {
    cy.get(`@${aliasDoCampo(campoInicio)}`).then((inicioBR) => {
      const [dia, mes, ano] = inicioBR.split('/').map(Number)
      const data = new Date(ano, mes - 1, dia)
      data.setDate(data.getDate() + sortearEntre(diasMin, diasMax) - 1)
      editarCampoDeData(campo, data)
    })
  }
)

// Escolhe ao acaso uma opção diferente da atual; com duas opções
// ("Contabilizar" / "Não contabilizar") equivale a inverter o valor.
// O clique é feito por texto (cy.contains) e não no elemento já capturado: a
// lista do Radix re-renderiza ao rolar até a opção (Impedimento tem ~23 itens)
// e um elemento embrulhado com cy.wrap fica destacado do DOM.
When('seleciona uma opção diferente no campo {string} e guarda o valor para conferência', (campo) => {
  comboDoCampo(campo)
    .scrollIntoView()
    .should('be.visible')
    .and('not.be.disabled')
    .then(($trigger) => {
      const valorAtual = $trigger.text().trim()
      cy.wrap($trigger).click()

      cy.get('[role="option"]', { timeout: 10000 })
        .should('have.length.greaterThan', 0)
        .then(($opcoes) => {
          const diferentes = $opcoes.toArray().filter((el) => el.textContent.trim() !== valorAtual)
          if (diferentes.length === 0) {
            throw new Error(`Campo "${campo}" não tem opção diferente de "${valorAtual}" para selecionar.`)
          }

          const textoEscolhido = diferentes[Math.floor(Math.random() * diferentes.length)].textContent.trim()

          cy.contains('[role="option"]', new RegExp(`^\\s*${escaparRegex(textoEscolhido)}\\s*$`)).click()
          comboDoCampo(campo).should(($novo) => {
            expect($novo.text().trim(), `campo "${campo}" após a seleção`).to.eq(textoEscolhido)
          })
          cy.wrap(textoEscolhido).as(aliasDoCampo(campo))
        })
    })
})

// SelectAnoField: trocar para um ano diferente do ano corrente abre o
// Popconfirm "Tem certeza que deseja mudar o ano?" e o valor só é gravado ao
// confirmar. O ano corrente fica fora do sorteio para que a confirmação sempre
// apareça — o step não depende de checar se o popup abriu ou não.
When('seleciona um ano diferente no campo {string} confirmando a mudança e guarda o valor para conferência', (campo) => {
  const anoCorrente = new Date().getFullYear()

  comboDoCampo(campo)
    .scrollIntoView()
    .should('be.visible')
    .and('not.be.disabled')
    .then(($trigger) => {
      const anoAtual = $trigger.text().trim()
      const candidatos = Array.from({ length: 10 }, (_, i) => String(anoCorrente - 1 - i))
        .filter((ano) => ano !== anoAtual)
      const anoEscolhido = candidatos[sortearEntre(0, candidatos.length - 1)]

      cy.wrap($trigger).click()
      cy.contains('[role="option"]', new RegExp(`^\\s*${anoEscolhido}\\s*$`), { timeout: 10000 }).click()

      cy.contains('.ant-popconfirm', 'Tem certeza que deseja mudar o ano?', { timeout: 10000 })
        .contains('button', 'Sim')
        .should('be.visible')
        .click()

      comboDoCampo(campo).should(($novo) => {
        expect($novo.text().trim(), `campo "${campo}" após confirmar a mudança`).to.eq(anoEscolhido)
      })
      cy.wrap(anoEscolhido).as(aliasDoCampo(campo))
    })
})

Then('o campo {string} da edição exibe a opção guardada', (campo) => {
  cy.get(`@${aliasDoCampo(campo)}`).then((valorGuardado) => {
    comboDoCampo(campo).should(($trigger) => {
      expect($trigger.text().trim(), `campo "${campo}"`).to.eq(valorGuardado)
    })
  })
})

Then('o sistema exibe a etapa de confirmação da edição da designação', () => {
  cy.url({ timeout: 15000 }).should('include', 'designacoes-passo-3')
  cy.contains('span', 'Informações adicionais', { timeout: 15000 }).should('be.visible')
})
