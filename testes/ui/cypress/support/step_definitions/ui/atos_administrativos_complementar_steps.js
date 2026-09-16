// Steps de seleção de linha gravam o índice em "@designacaoIndex" (lido por
// "navega para a seção Action"/"clica e seleciona a opção", cessacao_steps.js)
// e "@nomeServidorSelecionado"/"@seiLinhaSelecionada" para validar depois que
// a tela de destino carregou os dados da linha certa.

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { acoesListagemLocators } from '../../ui/locators/atos_administrativos_complementar_locators'
import { atosAdministrativosPack } from '../../ui/locators/atos_administrativos_locators'

// ─── Seleção de linha via filtro Tipo/Status ────────────────────────────────
// Filtra antes de escolher a linha: a listagem sem filtro esconde tipos raros
// nas primeiras páginas por volume de dados de teste acumulado em QA.
const aplicarFiltroTipoStatus = ({ tipo, status }) => {
  if (tipo) {
    atosAdministrativosPack.filtros.tipo().should('be.visible').click()
    cy.wait(500)
    atosAdministrativosPack.dropdown.opcao(tipo).should('be.visible').click()
  }
  if (status) {
    atosAdministrativosPack.filtros.status().should('be.visible').click()
    cy.wait(500)
    atosAdministrativosPack.dropdown.opcao(status).should('be.visible').click()
  }

  cy.intercept('POST', '**/pages/atos-administrativos**').as('pesquisarAtosComplementar')
  atosAdministrativosPack.botoes.pesquisar().should('be.visible').and('not.be.disabled').click()
  cy.wait('@pesquisarAtosComplementar', { timeout: 15000 })
  cy.wait(500)
}

// Escopado ao dropdown aberto — sem isso "ul li span" também casa com o menu
// lateral (<aside>), inflando a contagem.
const spansDoMenuAberto = () =>
  cy.get('.ant-dropdown:not(.ant-dropdown-hidden) li span', { timeout: 10000 })

const guardarDadosDaLinha = (index) => {
  cy.wrap(index).as('designacaoIndex')
  acoesListagemLocators.colunaServidorIndicado(index).invoke('text').then((t) => {
    cy.wrap(t.trim()).as('nomeServidorSelecionado')
  })
  acoesListagemLocators.colunaNumeroSei(index).invoke('text').then((t) => {
    const sei = t.trim()
    cy.wrap(sei).as('seiLinhaSelecionada')
    // A base de QA tem SEIs duplicados entre linhas — grava a contagem antes
    // de agir pra comparar CONTAGEM (não presença) depois.
    cy.get(acoesListagemLocators.linhas).then(($rows) => {
      const ocorrencias = $rows.toArray().filter((el) => el.textContent.includes(sei)).length
      cy.wrap(ocorrencias).as('ocorrenciasSeiAntes')
    })
  })
}

const selecionarLinhaAleatoriaFiltrada = (descricao, filtro) => {
  aplicarFiltroTipoStatus(filtro)

  // O filtro pode legitimamente não ter nenhum registro em QA — falha aqui,
  // cedo e com mensagem clara, em vez de um erro obscuro de índice depois.
  cy.get('tbody', { timeout: 15000 }).then(($tbody) => {
    if (/não há dados/i.test($tbody.text())) {
      throw new Error(`Nenhum registro do tipo "${descricao}" disponível na base de QA no momento (listagem retornou "Não há dados") — cenário depende de massa de dado que hoje não existe no ambiente, não é falha de código.`)
    }
  })

  atosAdministrativosPack.tabela.linhas().should(($linhas) => {
    expect($linhas.length, `linhas encontradas para "${descricao}"`).to.be.greaterThan(0)
  })

  atosAdministrativosPack.tabela.linhas().its('length').then((total) => {
    const index = Math.floor(Math.random() * total)
    cy.log(`✓ Linha ${index}/${total} selecionada — ${descricao}`)
    guardarDadosDaLinha(index)
  })
}

When('seleciona uma designação publicada de forma aleatoria na listagem', () => {
  selecionarLinhaAleatoriaFiltrada('designação publicada', { tipo: 'Designação', status: 'Publicado' })
})

When('seleciona uma designação não publicada de forma aleatoria na listagem', () => {
  selecionarLinhaAleatoriaFiltrada('designação não publicada', { tipo: 'Designação', status: 'Aguardando publicação' })
})

When('seleciona uma cessação de forma aleatoria na listagem', () => {
  selecionarLinhaAleatoriaFiltrada('cessação', { tipo: 'Cessação' })
})

When('seleciona uma apostila de forma aleatoria na listagem', () => {
  selecionarLinhaAleatoriaFiltrada('apostila', { tipo: 'Apostila de Designação' })
})

// Depende de já existir ao menos 1 registro "Apostila de Cessação" em QA —
// base sem dado no momento, cenário fica pendente até haver massa de dado.
When('seleciona uma apostila de cessação de forma aleatoria na listagem', () => {
  selecionarLinhaAleatoriaFiltrada('apostila de cessação', { tipo: 'Apostila de Cessação' })
})

When('seleciona uma insubsistência de forma aleatoria na listagem', () => {
  selecionarLinhaAleatoriaFiltrada('insubsistência', { tipo: 'Insubsistência de Designação' })
})

// ─── Seleção de linha por ausência de opção no menu (regras de negócio) ────
// Não dá pra saber pela tabela se um ato já tem cessação/insubsistência
// vinculada — só abrindo o próprio menu de ações (a opção já executada some).
const linhaTemOpcaoNoMenu = (index, opcao) =>
  acoesListagemLocators.dropdownTrigger(index).click({ force: true }).then(() => {
    return spansDoMenuAberto().then(($spans) => {
      const textos = $spans.map((i, el) => Cypress.$(el).text().trim().toLowerCase()).get()
      const encontrada = textos.some((t) => t === opcao.trim().toLowerCase())
      // Encadeia o fechamento do dropdown ANTES de devolver o resultado —
      // retornar um valor síncrono depois de disparar comandos cy sem
      // encadear (bug original) gera "mixing up async and sync code".
      return cy.get('body').click(0, 0).wait(300).then(() => encontrada)
    })
  })

// Pagina até achar (ou esgotar) uma linha qualificada — a candidata válida
// nem sempre está na primeira página de resultados filtrados.
const selecionarLinhaSemOpcaoNoMenu = (descricao, opcaoAusente) => {
  aplicarFiltroTipoStatus({ tipo: 'Designação', status: 'Publicado' })

  const tentarNaPaginaAtual = () => {
    atosAdministrativosPack.tabela.linhas().should(($linhas) => {
      expect($linhas.length, `linhas encontradas para "${descricao}"`).to.be.greaterThan(0)
    })

    atosAdministrativosPack.tabela.linhas().its('length').then((totalLinhas) => {
      const tentarLinha = (indices) => {
        if (indices.length === 0) {
          irParaProximaPaginaOuDesistir()
          return
        }
        const [index, ...resto] = indices
        linhaTemOpcaoNoMenu(index, opcaoAusente).then((temOpcao) => {
          if (!temOpcao) {
            cy.log(`✓ Linha ${index} selecionada — ${descricao}`)
            guardarDadosDaLinha(index)
            return
          }
          tentarLinha(resto)
        })
      }
      tentarLinha(Array.from({ length: totalLinhas }, (_, i) => i))
    })
  }

  const irParaProximaPaginaOuDesistir = () => {
    cy.get('.ant-pagination-next', { timeout: 10000 }).then(($next) => {
      if ($next.hasClass('ant-pagination-disabled')) {
        throw new Error(`Nenhuma linha "${descricao}" (sem "${opcaoAusente}" no menu) encontrada em nenhuma página da listagem filtrada — cenário depende de massa de dado que hoje não existe no ambiente, não é falha de código.`)
      }
      cy.wrap($next).click({ force: true })
      cy.wait(1000)
      tentarNaPaginaAtual()
    })
  }

  tentarNaPaginaAtual()
}

When('seleciona uma designação com cessação vinculada de forma aleatoria na listagem', () => {
  selecionarLinhaSemOpcaoNoMenu('designação com cessação vinculada', 'Cessar')
})

When('seleciona um ato com insubsistência vinculada de forma aleatoria na listagem', () => {
  selecionarLinhaSemOpcaoNoMenu('ato com insubsistência vinculada', 'Tornar insubsistente')
})

// ─── Validação dos dados carregados na tela de destino ─────────────────────
// Confirma que a tela chegou pré-carregada com o ato certo, comparando com o
// nome do servidor OU o Nº SEI capturados na listagem antes de navegar — um
// único critério fixo falha numa das famílias de tela (Apostila nunca exibe
// o nome do servidor; nomes de servidor também se repetem entre registros).
const validarDadosCarregados = () => {
  cy.get('.ant-spin, .loading, .spinner', { timeout: 15000 }).should('not.exist')

  cy.get('@nomeServidorSelecionado').then((nome) => {
    cy.get('@seiLinhaSelecionada').then((sei) => {
      const nomeUtil = nome && nome !== '-' ? nome : null
      const seiUtil = sei && sei !== '-' ? sei : null

      if (!nomeUtil && !seiUtil) {
        cy.log('Servidor indicado e Nº SEI vazios na listagem de origem — validação pulada')
        return
      }

      cy.get('main', { timeout: 15000 }).should(($main) => {
        const texto = $main.text()
        const valoresInputs = [...$main[0].querySelectorAll('input, textarea')].map((el) => el.value)
        const nomeEncontrado = !!nomeUtil && texto.includes(nomeUtil)
        const seiEncontrado = !!seiUtil && (texto.includes(seiUtil) || valoresInputs.includes(seiUtil))
        expect(
          nomeEncontrado || seiEncontrado,
          `dados da linha selecionada carregados na tela (nome "${nomeUtil}" ou Nº SEI "${seiUtil}")`
        ).to.be.true
      })
    })
  })
}

Then('os dados da designação selecionada já aparecem carregados na tela', validarDadosCarregados)
Then('os dados da cessação selecionada já aparecem carregados na tela', validarDadosCarregados)
Then('os dados da apostila selecionada já aparecem carregados na tela', validarDadosCarregados)

Then('não deve exibir o modal de busca de portaria', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[role="dialog"]').length > 0) {
      throw new Error('Modal de busca de portaria não deveria aparecer — a ação partiu de um ato já existente')
    }
  })
  cy.log('✓ Modal de busca de portaria não exibido')
})

// Tipo de apostila é implícito na navegação (query string ?origem=...) e
// exibido como rótulo de texto — checa os dois sinais.
Then('o tipo de apostila pré-selecionado é {string}', (tipo) => {
  const origem = tipo.trim().toLowerCase() === 'cessação' ? 'cessacao' : 'designacao'
  cy.url({ timeout: 15000 }).should('include', `origem=${origem}`)
  cy.get('main', { timeout: 15000 }).contains(tipo, { timeout: 15000 }).should('be.visible')
})

Then('o sistema exibe a tela de anulação de apostila', () => {
  cy.url({ timeout: 15000 }).should('include', 'anular-apostila')
  cy.get('main', { timeout: 15000 }).contains(/Anular Apostila/i, { timeout: 15000 }).should('be.visible')
  cy.wait(1000)
})

Then('o sistema direciona para a tela de detalhes da insubsistência', () => {
  cy.url({ timeout: 15000 }).should('include', 'tornar-sem-efeito')
  cy.get('main', { timeout: 15000 }).contains(/Detalhes da insubsistência/i, { timeout: 15000 }).should('be.visible')
  cy.wait(1000)
})

// ─── Excluir designação (Modal.confirm) ────────────────────────────────────

Then('o sistema exibe o modal de confirmação {string}', (titulo) => {
  acoesListagemLocators.modalConfirm.container().should('be.visible')
  acoesListagemLocators.modalConfirm.titulo().should('contain.text', titulo)
})

Then('o modal exibe o texto {string}', (texto) => {
  acoesListagemLocators.modalConfirm.conteudo().should('contain.text', texto)
})

When('confirma a exclusão clicando em {string}', (botao) => {
  acoesListagemLocators.modalConfirm.botao(botao).click({ force: true })
})

When('cancela a exclusão clicando em {string}', (botao) => {
  acoesListagemLocators.modalConfirm.botao(botao).click({ force: true })
})

Then('o sistema exibe a notificação {string}', (texto) => {
  acoesListagemLocators.notificacao(texto).should('be.visible')
})

Then('o modal de confirmação é fechado', () => {
  cy.get('.ant-modal-confirm', { timeout: 10000 }).should('not.exist')
})

// Compara CONTAGEM de ocorrências do SEI (antes vs. depois), não presença —
// evita falso negativo quando outra linha compartilha o mesmo SEI duplicado.
Then('a designação excluída não aparece mais na listagem', () => {
  cy.url({ timeout: 15000 }).should('include', 'atos-administrativos')
  cy.get('@seiLinhaSelecionada').then((sei) => {
    if (!sei || sei === '-') return
    cy.get('@ocorrenciasSeiAntes').then((ocorrenciasAntes) => {
      cy.get('table tbody', { timeout: 15000 }).should(($tbody) => {
        const linhas = $tbody[0].querySelectorAll('tr:not(.ant-table-measure-row)')
        const ocorrenciasDepois = [...linhas].filter((el) => el.textContent.includes(sei)).length
        expect(ocorrenciasDepois, `ocorrências do Nº SEI "${sei}" após excluir (antes: ${ocorrenciasAntes})`).to.equal(ocorrenciasAntes - 1)
      })
    })
  })
})

Then('a designação permanece na listagem', () => {
  cy.get('@seiLinhaSelecionada').then((sei) => {
    if (sei && sei !== '-') {
      cy.get('table tbody', { timeout: 15000 }).should('contain.text', sei)
    }
  })
})

// ─── Regras de exibição do menu de ações ───────────────────────────────────
// Roda logo após "navega para a seção Action" (cessacao_steps.js), que já
// deixa o dropdown aberto.
Then('o menu de ações exibe as opções:', (dataTable) => {
  const opcoes = dataTable.raw().flat().map((o) => o.trim()).filter(Boolean)
  spansDoMenuAberto().then(($spans) => {
    const textos = $spans.map((i, el) => Cypress.$(el).text().trim().toLowerCase()).get()
    opcoes.forEach((opcao) => {
      expect(textos, `menu de ações contém "${opcao}"`).to.include(opcao.toLowerCase())
    })
  })
})

Then('o menu de ações não exibe a opção {string}', (opcao) => {
  spansDoMenuAberto().then(($spans) => {
    const textos = $spans.map((i, el) => Cypress.$(el).text().trim().toLowerCase()).get()
    expect(textos, `menu de ações NÃO deveria conter "${opcao}"`).to.not.include(opcao.trim().toLowerCase())
  })
})
