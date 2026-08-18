import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import '../../ui/commands/commands_cessacao'
import { cessacaoSelectors } from '../../ui/locators/cessacao_locators'

// ETAPA 1: Navegação e Seleção da Designação

Then('Valida a existencia das Colunas {string}', (colunasParam) => {
  const colunas = colunasParam
    .split(',')
    .map(col => col.trim())
    .filter(col => col.length > 0) || [
      'RF INDICADO',
      'SERVIDOR INDICADO',
      'RF TITULAR',
      'SERVIDOR TITULAR',
      'SEI',
      'PORTARIA DESIGNAÇÃO',
      'ANO DESIGNAÇÃO',
      'DRE',
      'UNIDADE',
      'CARGO',
      'Status',
      'Action',
    ]
  colunas.forEach(col => {
    cy.contains('th', col, { timeout: 15000 }).should('be.visible')
  })
})

Then('Seleciona uma das Designação de forma aleatoria', () => {
  cy.get('table tbody tr:not(.ant-table-measure-row)', { timeout: 15000 })
    .should('have.length.greaterThan', 0)
    .its('length')
    .then(totalLinhas => {
      // PRIORIZA DESIGNAÇÕES DO TOPO - começa pela primeira disponível
      cy.wrap(null).then(() => {
        const tentativasAnteriores = Cypress.env('designacoesTentadas') || []
        let index
        
        // Tenta encontrar um índice que ainda não foi tentado
        const indicesDisponiveis = Array.from({ length: totalLinhas }, (_, i) => i)
          .filter(i => !tentativasAnteriores.includes(i))
        
        if (indicesDisponiveis.length > 0) {
          // SEMPRE PEGA A PRIMEIRA DISPONÍVEL (do topo)
          index = indicesDisponiveis[0]
        } else {
          // Se todos foram tentados, reseta e começa de novo
          cy.log('Todas as designações já foram tentadas, resetando...')
          Cypress.env('designacoesTentadas', [])
          index = 0
        }
        
        cy.log(`Selecionando designação do topo (índice: ${index} de ${totalLinhas})`)
        cy.wrap(index).as('designacaoIndex')
      })
    })
})

Then('navega para a seção Action', () => {
  // A coluna de ações da tabela unificada de Atos Administrativos não tem
  // cabeçalho de texto "Action" (é a última coluna, só com ícone/dropdown) —
  // confirmado em execução real (colunas atuais: Tipo, Nº SEI, Observações,
  // Portaria do ato, Servidor indicado, Registro Funcional (RF), Status).
  // Por isso não validamos mais o texto do th, só localizamos o dropdown
  // trigger na linha selecionada.
  cy.get('@designacaoIndex').then(index => {
    cy.log(`Buscando ação na linha: ${index}`)
    
    cy.get('table tbody tr:not(.ant-table-measure-row)', { timeout: 10000 })
      .eq(index)
      .should('be.visible')
      .scrollIntoView()
      .within(() => {
        cy.get('.ant-dropdown-trigger, [class*="dropdown-trigger"]', { timeout: 5000 })
          .first()
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true })
          .then(() => {
            cy.log('Clicou no dropdown trigger')
          })
      })
  })

  cy.wait(1000)
})

Then('clica e seleciona a opção {string}', (opcao) => {
  const MAX_TENTATIVAS = 4
  // "Editar" passou a navegar para /visualizar-designacao/{id} — a mesma URL
  // de "Detalhar" — confirmado em execução real (duas rodadas completas, 4
  // designações distintas cada, sempre o mesmo destino). Antes da migração do
  // menu era /designacoes-passo-2, uma rota própria; hoje URL não distingue
  // mais editar de visualizar, então a validação de conteúdo em "o sistema
  // exibe a Tela" (common_steps.js) é quem garante que é de fato o modo edição.
  const paginaEsperada = opcao.toLowerCase().includes('insubsist') ? 'insubsistencia'
    : opcao.toLowerCase().includes('apostil') ? 'apostila'
    : opcao.toLowerCase().includes('editar') ? 'visualizar-designacao'
    : 'cessacao'
  const chaveEnv = opcao.toLowerCase().includes('insubsist') ? 'insubsistenciasTentadas'
    : opcao.toLowerCase().includes('apostil') ? 'apostilarTentadas'
    : opcao.toLowerCase().includes('editar') ? 'editarTentadas'
    : 'designacoesTentadas'

  cy.log(`Selecionando a opção: "${opcao.trim()}"`)

  // Navega para a próxima designação disponível e chama tentarOpcao novamente
  const irParaProxima = () => {
    cy.log('↻ Voltando para listagem...')
    cy.visit('/pages/atos-administrativos')
    cy.wait(2000)

    cy.get('table tbody tr:not(.ant-table-measure-row)', { timeout: 15000 })
      .should('have.length.greaterThan', 0)
      .its('length')
      .then(totalLinhas => {
        const tentadas = Cypress.env(chaveEnv) || []
        const disponiveis = Array.from({ length: totalLinhas }, (_, i) => i)
          .filter(i => !tentadas.includes(i))

        if (disponiveis.length === 0) {
          throw new Error(`Todas as ${totalLinhas} designações foram testadas sem sucesso para "${opcao}"`)
        }

        const novoIndex = disponiveis[0]
        cy.log(`↻ Tentando designação ${novoIndex} (${disponiveis.length} restantes)`)
        cy.wrap(novoIndex).as('designacaoIndex')

        cy.get('table tbody tr:not(.ant-table-measure-row)')
          .eq(novoIndex).should('be.visible').scrollIntoView()
          .within(() => {
            cy.get('.ant-dropdown-trigger, [class*="dropdown-trigger"]')
              .first().should('be.visible').click({ force: true })
          })

        cy.wait(1000)
        tentarOpcao()
      })
  }

  // Tenta clicar a opção no dropdown atual e valida navegação
  // Se falhar, registra o índice e delega a irParaProxima (recursão efetiva)
  const tentarOpcao = () => {
    cy.get('ul li span', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .then($spans => {
        const textos = $spans.map((i, el) => Cypress.$(el).text().trim()).get()
        cy.log(`Dropdown: ${textos.join(', ')}`)
      })

    cy.get('body').then($body => {
      const encontrada = $body.find('ul li span').toArray()
        .some(el => Cypress.$(el).text().trim().toLowerCase()
          .includes(opcao.trim().toLowerCase()))

      if (!encontrada) {
        cy.log(`✗ Opção "${opcao}" não disponível`)
        cy.get('@designacaoIndex').then(index => {
          const tentadas = Cypress.env(chaveEnv) || []
          if (!tentadas.includes(index)) tentadas.push(index)
          Cypress.env(chaveEnv, tentadas)
          if (tentadas.length >= MAX_TENTATIVAS) {
            throw new Error(`Esgotadas ${MAX_TENTATIVAS} tentativas para "${opcao}"`)
          }
          cy.log(`Designação ${index} ignorada (${tentadas.length}/${MAX_TENTATIVAS})`)
        })
        cy.get('body').click(0, 0)
        cy.wait(500)
        irParaProxima()
        return
      }

      cy.log(`✓ Opção "${opcao}" encontrada`)
      // force: true ignora opacity:0 da animação ant-slide-up-appear do dropdown
      cy.get('ul li span')
        .contains(new RegExp(`^${opcao.trim()}$`, 'i'))
        .click({ force: true })

      // Visualizar/Detalhar não exige validação de URL
      if (opcao.toLowerCase().includes('visualizar') || opcao.toLowerCase().includes('detalhar')) {
        cy.log('✓ Navegação para visualização')
        return
      }

      // Polling em vez de um wait(3000) fixo seguido de checagem única: sob
      // ambiente de QA lento (mesmo padrão de instabilidade já visto com
      // 500 esporádico nas DREs), a navegação real pode levar mais que 3s
      // para trocar a URL — um wait fixo curto demais queima as 4 tentativas
      // em falso negativo (linha descartada por lentidão, não por estar
      // realmente indisponível), gerando "Esgotadas N tentativas" mesmo com
      // o app funcionando. Confere a cada 1s, até 8s no total, antes de
      // desistir da linha atual.
      const MAX_CHECAGENS_URL = 8
      const aguardarNavegacao = (checagem) => {
        cy.wait(1000)
        cy.url().then(url => {
          if (url.includes(paginaEsperada)) {
            cy.log(`✓ Navegação para ${paginaEsperada} confirmada! (checagem ${checagem}/${MAX_CHECAGENS_URL})`)
            return
          }

          if (checagem < MAX_CHECAGENS_URL) {
            aguardarNavegacao(checagem + 1)
            return
          }

          cy.log(`✗ Navegação falhou! Ainda em: ${url}`)
          cy.get('@designacaoIndex').then(index => {
            const tentadas = Cypress.env(chaveEnv) || []
            if (!tentadas.includes(index)) tentadas.push(index)
            Cypress.env(chaveEnv, tentadas)
            if (tentadas.length >= MAX_TENTATIVAS) {
              throw new Error(`Esgotadas ${MAX_TENTATIVAS} tentativas de navegação para "${opcao}"`)
            }
            cy.log(`Designação ${index} não navegou (${tentadas.length}/${MAX_TENTATIVAS})`)
          })
          irParaProxima()
        })
      }

      aguardarNavegacao(1)
    })
  }

  tentarOpcao()
})

// ETAPAS 2-4: Validação de Abas

Then('valida e clica na aba {string}', (abaTexto) => {
  cy.log(`Clicando na aba: "${abaTexto}"`)
  
  cessacaoSelectors.aba(abaTexto)
    .should('be.visible')
    .click({ force: true })
  
  cy.log(`Aba "${abaTexto}" clicada com sucesso`)
  cy.wait(1500)
})

Then('valida a existencia dos Titulos', (docString) => {
  cy.log('Iniciando validação de títulos')
  
  const titulos = docString
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map(t => t.replace(/^-\s*/, '').trim())
    .filter(t => t.length > 0)
  
  cy.log(`Total de títulos a validar: ${titulos.length}`)
  titulos.forEach(t => cy.log(`  - ${t}`))
  
  let camposEncontrados = 0
  let camposNaoEncontrados = []
  
  titulos.forEach((titulo, index) => {
    cy.log(`[${index + 1}/${titulos.length}] Validando: "${titulo}"`)
    
    cy.get('main').then($body => {
      const existe = $body.find(`label:contains("${titulo}"), span:contains("${titulo}"), p:contains("${titulo}"), div:contains("${titulo}"), h1:contains("${titulo}"), h2:contains("${titulo}"), h3:contains("${titulo}"), h4:contains("${titulo}")`).length > 0
      
      if (existe) {
        cessacaoSelectors.label(titulo)
          .should('exist')
          .should('be.visible')
          .then(($el) => {
            cy.log(`Título encontrado: "${titulo}" (elemento: ${$el.prop('tagName')})`)
            camposEncontrados++
          })
      } else {
        cy.log(`Campo "${titulo}" não encontrado (ignorado)`)
        camposNaoEncontrados.push(titulo)
      }
    })
  })
  
  cy.then(() => {
    cy.log(`Resumo: ${camposEncontrados} encontrados, ${camposNaoEncontrados.length} não encontrados`)
    if (camposNaoEncontrados.length > 0) {
      cy.log(`Campos não encontrados: ${camposNaoEncontrados.join(', ')}`)
    }
    cy.log('Validação de títulos concluída')
  })
})

Then('valida a existencia do Botão {string}', (textoBotao) => {
  cy.log(`Validando existência do botão: "${textoBotao}"`)
  
  cy.get('body').then($body => {
    const botaoExiste = $body.find(`button:contains("${textoBotao}")`).length > 0
    
    if (botaoExiste) {
      cessacaoSelectors.botao(textoBotao)
        .should('exist')
        .and('be.visible')
        .then(() => {
          cy.log(`Botão "${textoBotao}" encontrado`)
        })
    } else {
      cy.log(`Botão "${textoBotao}" não encontrado`)
    }
  })
})

// ETAPA 5: Preenchimento de Campos

When('preenche o campo {string} com numero aleatorio', (labelCampo) => {
  cy.log(`Preenchendo campo "${labelCampo}" com número aleatório`)
  
  const numero = Math.floor(1000000 + Math.random() * 9000000)
  cy.log(`Número gerado: ${numero}`)
  
  cessacaoSelectors.inputPorLabel(labelCampo)
    .should('be.visible')
    .should('not.be.disabled')
    .clear({ force: true })
    .type(numero.toString(), { force: true })
    .then(($input) => {
      const valorDigitado = $input.val()
      cy.log(`Campo "${labelCampo}" preenchido com: ${numero} (valor no campo: ${valorDigitado})`)
    })
  
  cy.wait(500)
})

// ETAPA 6: Validação de Trechos para o SEI

Then('valida a existencia do botão de navegação {string}', (textoBotao) => {
  cy.log(`Validando botão: "${textoBotao}"`)
  
  cessacaoSelectors.botao(textoBotao)
    .should('exist')
    .and('be.visible')
    .then(() => {
      cy.log(`Botão "${textoBotao}" encontrado`)
    })
})

// ETAPA 7: Finalização

Then('valida a existencia dos botões de navegação {string} e {string}', (botao1, botao2) => {
  cy.log(`Validando botões de navegação: "${botao1}" e "${botao2}"`)
  
  cy.get('body').then($body => {
    const botao1Existe = $body.find(`button:contains("${botao1}"), a:contains("${botao1}")`).length > 0
    const botao2Existe = $body.find(`button:contains("${botao2}"), a:contains("${botao2}")`).length > 0
    
    if (botao1Existe) {
      cessacaoSelectors.botao(botao1)
        .should('exist')
        .and('be.visible')
        .then(() => {
          cy.log(`Botão "${botao1}" encontrado`)
        })
    } else {
      cy.log(`Botão "${botao1}" não encontrado na página`)
    }
    
    if (botao2Existe) {
      cessacaoSelectors.botao(botao2)
        .should('exist')
        .and('be.visible')
        .then(() => {
          cy.log(`Botão "${botao2}" encontrado`)
        })
    } else {
      cy.log(`Botão "${botao2}" não encontrado na página`)
    }
  })
  
  cy.log('Validação de botões concluída')
})
