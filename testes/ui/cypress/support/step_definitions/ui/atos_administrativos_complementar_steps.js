// Step Definitions — Ações da listagem de Atos Administrativos
// Cobre atos_administrativos_complementar.feature (menu "⋮" de cada linha da
// tabela de Atos Administrativos: Apostilar, Cessar, Tornar insubsistente,
// Anular Apostila, Tornar sem efeito, Excluir).
//
// Steps reutilizados de outros arquivos (não redefinidos aqui):
//   • "que o usuário já está autenticado no sistema" / "está na página {string}" → atos_administrativos_steps.js
//   • "navega para a seção Action"                    → cessacao_steps.js
//   • "clica e seleciona a opção {string}"             → cessacao_steps.js (estendido
//     aqui para tratar "Tornar sem efeito" e "Excluir" — ver comentário no próprio arquivo)
//   • "o sistema exibe a Tela {string}"                → common_steps.js
//   • "deve visualizar o texto {string}"                → designacao_steps.js
//   • "valida a existencia do botão de navegação {string}" → cessacao_steps.js
//
// Todos os steps de seleção de linha abaixo gravam o índice escolhido no
// alias "@designacaoIndex" — o MESMO alias que "navega para a seção Action"
// e "clica e seleciona a opção" já esperam (cessacao_steps.js), para poder
// reaproveitar os dois sem duplicar a lógica de abrir o dropdown/clicar na
// opção. Também gravam "@nomeServidorSelecionado" e "@seiLinhaSelecionada"
// (lidos da própria linha, antes de navegar) para validar depois, na tela de
// destino, que os dados carregados realmente correspondem à linha escolhida.

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { acoesListagemLocators } from '../../ui/locators/atos_administrativos_complementar_locators'
import { atosAdministrativosPack } from '../../ui/locators/atos_administrativos_locators'

// ─── Seleção de linha via filtro Tipo/Status ────────────────────────────────
// A listagem sem filtro nenhum chega a esconder Cessação/Apostila/
// Insubsistência por completo: confirmado em execução real que a página 1
// (10 registros de 124) só trazia "Designação"/"Aguardando publicação" —
// volume alto de dados de teste acumulados em QA. Escanear a página crua
// (abordagem anterior) falhava sempre que o tipo/status procurado não
// calhava de estar nos primeiros 10 registros. Em vez disso, aplica o
// mesmo filtro "Tipo"/"Status" já usado em filtra_atos.feature
// (atos_administrativos_steps.js) antes de escolher a linha — os resultados
// já vêm filtrados pelo backend, então qualquer linha visível serve.
//
// Valores de "Tipo" confirmados em AtosOpcoes (FiltroDeAtosAdministrativos.tsx)
// — note que são mais granulares do que o enum tipo (DESIGNACAO/CESSACAO/
// APOSTILA/INSUBSISTENCIA): "Apostila de Designação"/"Apostila de Cessação"
// em vez de só "Apostila", e "Insubsistência de Designação"/"Insubsistência
// de Cessação" em vez de só "Insubsistência" — "Anulação de Apostila" e
// "Tornar sem efeito" são tipos à parte (o EVENTO de anular/tornar sem
// efeito vira sua própria linha na listagem).

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

// Dropdown de ações (antd Dropdown) escopado em ".ant-dropdown:not(.ant-dropdown-hidden)"
// — mesmo padrão de atosAdministrativosPack.novoAto.opcao. Sem esse escopo,
// "ul li span" também casa com os itens do menu lateral (<aside>, também um
// <ul><li><span>), inflando a contagem e arriscando falso positivo/negativo
// nas checagens de conteúdo exato abaixo.
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
    // A base de QA tem registros de teste com o MESMO Nº SEI repetido em
    // várias linhas (ex.: "7643334446", "Criado via Postman — controle
    // isolando causa do 500", confirmado em inspeção real: 4 linhas
    // idênticas na mesma página) — checar exclusão por "SEI não existe mais
    // na tabela" dá falso negativo sempre que sobra uma duplicata. Grava
    // quantas linhas da página atual já compartilham esse SEI ANTES de agir,
    // para comparar CONTAGEM (não presença) depois.
    cy.get(acoesListagemLocators.linhas).then(($rows) => {
      const ocorrencias = $rows.toArray().filter((el) => el.textContent.includes(sei)).length
      cy.wrap(ocorrencias).as('ocorrenciasSeiAntes')
    })
  })
}

const selecionarLinhaAleatoriaFiltrada = (descricao, filtro) => {
  aplicarFiltroTipoStatus(filtro)

  // O filtro pode legitimamente não ter nenhum registro em QA (confirmado em
  // execução real para "Apostila de Cessação": listagem retorna a linha de
  // estado vazio "Não há dados", que "tbody tr:not(.ant-table-measure-row)"
  // conta como 1 "linha" — o length>0 abaixo passaria mesmo sem dado real, e
  // o teste só quebraria depois, com um erro obscuro de índice de coluna).
  // Falha aqui, cedo e com mensagem clara, em vez de deixar estourar lá na
  // frente.
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

// Cenário 14 depende de já existir ao menos 1 registro tipo "Apostila de
// Cessação" em QA — confirmado em 04/09/2026 que a base não tinha nenhum
// (0 registros no filtro). Investigado como criar via UI: nem "listagem →
// Cessação → Apostilar" (/pages/apostila?id=X&origem=cessacao) nem "Novo
// ato → Nova apostila" (busca por portaria de designação,
// /pages/apostila?id=X&origem=designacao) expõem um botão "Salvar" — as
// duas telas terminam em "Gerar texto SEI" sem disparar nenhuma requisição
// de rede, mesmo com o campo "Texto para a apostila" preenchido. A aba
// "Portarias de Cessação" que atos_novos.feature (Cenário "Nova Apostila",
// @skip) e apostilar_steps.js esperam não existe nessa tela na versão atual
// do app — teste provavelmente desatualizado. Até alguém com acesso ao
// código-fonte do front confirmar o fluxo real de criação, este cenário
// fica pendente (falha por falta de dado, não por bug do teste).
When('seleciona uma apostila de cessação de forma aleatoria na listagem', () => {
  selecionarLinhaAleatoriaFiltrada('apostila de cessação', { tipo: 'Apostila de Cessação' })
})

When('seleciona uma insubsistência de forma aleatoria na listagem', () => {
  selecionarLinhaAleatoriaFiltrada('insubsistência', { tipo: 'Insubsistência de Designação' })
})

// ─── Seleção de linha por ausência de opção no menu (regras de negócio) ────
// Não dá pra saber pela tabela se um ato já tem cessação/insubsistência
// vinculada — só abrindo o próprio menu de ações (ListagemDeAtosAdministrativos.tsx
// remove a opção já executada: "não pode cessar 2x", "não pode insubsistir 2x").
// Abre o dropdown de cada linha candidata, olha se a opção está lá e fecha de
// novo (mesmo clique em body 0,0 usado em "clica e seleciona a opção").

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

// Filtra por Tipo="Designação" + Status="Publicado" antes de sondar — só
// designações publicadas fazem sentido como candidatas reais a já terem
// cessação/insubsistência vinculada (mesmo filtro usado nos Cenários 1-3).
//
// Pagina até achar (ou esgotar): confirmado em execução real que a linha
// qualificada ("Cessar" ausente do menu) para o filtro atual em QA estava na
// PÁGINA 2 (13 registros filtrados, 10 por página) — a versão anterior só
// sondava a página 1 e sempre falhava com "nenhuma linha encontrada" mesmo
// havendo uma candidata válida logo na página seguinte.
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
// Confirma que a tela chegou pré-carregada com o ato certo (sem passar pelo
// modal de busca de portaria), comparando com o nome do servidor OU o Nº SEI
// capturados ainda na listagem, antes de navegar.
//
// Por que os dois critérios: confirmado em inspeção real que a tela de
// Apostila (origem=designacao E origem=cessacao) NUNCA exibe o nome do
// servidor — só os dados da portaria/SEI/unidade — enquanto Cessação e
// Insubsistência exibem o nome como texto visível mas só carregam o Nº SEI
// dentro de abas/inputs (não aparece em innerText antes de abrir a aba). Um
// único critério fixo falha sempre numa das duas famílias de tela. Além
// disso, vários registros de QA compartilham o mesmo nome de servidor
// (dado de teste reaproveitado, ex.: "ADALBERTO PAVLIDIS DA SILVA" aparece
// em dezenas de linhas) — o Nº SEI é o identificador mais confiável da linha
// realmente escolhida.
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

// Não existe mais nenhum RadioGroupItem "#designacao"/"#cessacao" nesta tela
// (confirmado em inspeção real do DOM: os únicos radios da página são
// "Sim"/"Não" de outros campos, tipo Carater Especial). O tipo de apostila
// hoje é implícito na navegação — vem pela query string da URL
// (?origem=designacao|cessacao) e é exibido como rótulo de texto logo abaixo
// do título (ex.: <div>Cessação</div> abaixo de "Apostila de cessação").
// Checa os dois sinais: URL (estável, não depende de texto/idioma) e rótulo
// visível (evidência para quem lê o relatório de execução).
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
// "não contém mais o SEI" dá falso negativo sempre que outra linha da
// própria QA compartilha o mesmo Nº SEI duplicado (ver comentário em
// guardarDadosDaLinha/@ocorrenciasSeiAntes). Se a linha excluída era a única
// com esse SEI, a contagem depois é 0, que é o mesmo efeito da checagem
// antiga — só passa a funcionar também quando havia duplicatas.
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
// deixa o dropdown aberto — só lê os itens, não clica em nenhum.
// (spansDoMenuAberto definido no topo do arquivo, reaproveitado também por
// linhaTemOpcaoNoMenu.)

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
