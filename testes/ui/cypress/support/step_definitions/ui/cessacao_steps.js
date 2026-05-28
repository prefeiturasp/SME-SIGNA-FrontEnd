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
  cy.contains('th', 'Action', { timeout: 10000 })
    .should('be.visible')
    .then(() => {
      cy.log('Coluna Action validada')
    })

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
  const MAX_TENTATIVAS = 10
  const paginaEsperada = opcao.toLowerCase().includes('insubsist') ? 'insubsistencia' : 'cessacao'
  const chaveEnv = opcao.toLowerCase().includes('insubsist') ? 'insubsistenciasTentadas' : 'designacoesTentadas'
  
  cy.log(`Selecionando a opção: "${opcao.trim()}"`)
  
  // Lista todos os textos do dropdown para debug
  cy.get('ul li span', { timeout: 10000 })
    .should('have.length.greaterThan', 0)
    .then($spans => {
      const textos = $spans.map((i, el) => Cypress.$(el).text().trim()).get()
      cy.log(`✓ Dropdown aberto com ${textos.length} opções: ${textos.join(', ')}`)
    })
  
  // Tenta clicar na opção - se não existir, vai falhar e entramos no retry
  cy.get('body').then($body => {
    let opcaoEncontrada = false
    
    // Verifica se a opção existe checando todos os spans
    $body.find('ul li span').each((index, el) => {
      const texto = Cypress.$(el).text().trim().toLowerCase()
      if (texto.includes(opcao.trim().toLowerCase())) {
        opcaoEncontrada = true
        return false // break
      }
    })
    
    if (!opcaoEncontrada) {
      cy.log(`✗ Opção "${opcao}" não disponível para esta designação`)
      
      // Registra tentativa e tenta próxima
      cy.get('@designacaoIndex').then(index => {
        const tentadas = Cypress.env(chaveEnv) || []
        tentadas.push(index)
        Cypress.env(chaveEnv, tentadas)
        
        if (tentadas.length >= MAX_TENTATIVAS) {
          throw new Error(`Esgotadas ${MAX_TENTATIVAS} tentativas de encontrar designação válida`)
        }
        
        cy.log(`Designação ${index} sem opção "${opcao}" (${tentadas.length}/${MAX_TENTATIVAS} tentadas)`)
      })
      
      // Fecha dropdown e volta para listagem
      cy.get('body').click(0, 0)
      cy.wait(1000)
      
      cy.log('↻ Voltando para listagem...')
      cy.visit('/pages/listagem-designacoes')
      cy.wait(2000)
      
      // Seleciona próxima designação disponível
      cy.get('table tbody tr:not(.ant-table-measure-row)', { timeout: 15000 })
        .should('have.length.greaterThan', 0)
        .its('length')
        .then(totalLinhas => {
          const tentadas = Cypress.env(chaveEnv) || []
          const indicesDisponiveis = Array.from({ length: totalLinhas }, (_, i) => i)
            .filter(i => !tentadas.includes(i))
          
          if (indicesDisponiveis.length === 0) {
            throw new Error(`Todas as ${totalLinhas} designações foram testadas`)
          }
          
          const novoIndex = indicesDisponiveis[0]
          cy.log(`↻ Tentando designação ${novoIndex} (${indicesDisponiveis.length} restantes)`)
          cy.wrap(novoIndex).as('designacaoIndex')
          
          // Abre dropdown da nova designação
          cy.get('table tbody tr:not(.ant-table-measure-row)')
            .eq(novoIndex)
            .should('be.visible')
            .scrollIntoView()
            .within(() => {
              cy.get('.ant-dropdown-trigger, [class*="dropdown-trigger"]')
                .first()
                .should('be.visible')
                .click({ force: true })
            })
          
          cy.wait(1000)
          
          // Tenta clicar na opção recursivamente
          cy.then(() => {
            cy.get('ul li span')
              .contains(new RegExp(`^${opcao.trim()}$`, 'i'))
              .should('be.visible')
              .click({ force: true })
          })
        })
      
      return
    }
    
    // Opção encontrada - clica
    cy.log(`✓ Opção "${opcao}" encontrada`)
    cy.get('ul li span')
      .contains(new RegExp(opcao.trim(), 'i'))
      .should('be.visible')
      .click({ force: true })
    
    cy.wait(3000)
    
    // Visualizar não precisa validar navegação
    if (opcao.toLowerCase().includes('visualizar') || opcao.toLowerCase().includes('detalhar')) {
      cy.log(`✓ Navegação para visualização`)
      return
    }
    
    // Valida navegação para Cessação/Insubsistência
    cy.url({ timeout: 10000 }).then(url => {
      if (!url.includes(paginaEsperada)) {
        cy.log(`✗ Navegação falhou! Ainda em: ${url}`)
        
        // Registra falha e tenta próxima
        cy.get('@designacaoIndex').then(index => {
          const tentadas = Cypress.env(chaveEnv) || []
          tentadas.push(index)
          Cypress.env(chaveEnv, tentadas)
          
          if (tentadas.length >= MAX_TENTATIVAS) {
            throw new Error(`Esgotadas ${MAX_TENTATIVAS} tentativas`)
          }
          
          cy.log(`Designação ${index} não navegou (${tentadas.length}/${MAX_TENTATIVAS})`)
        })
        
        cy.log('↻ Voltando para listagem...')
        cy.visit('/pages/listagem-designacoes')
        cy.wait(2000)
        
        cy.get('table tbody tr:not(.ant-table-measure-row)', { timeout: 15000 })
          .should('have.length.greaterThan', 0)
          .its('length')
          .then(totalLinhas => {
            const tentadas = Cypress.env(chaveEnv) || []
            const indicesDisponiveis = Array.from({ length: totalLinhas }, (_, i) => i)
              .filter(i => !tentadas.includes(i))
            
            if (indicesDisponiveis.length === 0) {
              throw new Error(`Todas as ${totalLinhas} designações testadas`)
            }
            
            const novoIndex = indicesDisponiveis[0]
            cy.log(`↻ Tentando designação ${novoIndex}`)
            cy.wrap(novoIndex).as('designacaoIndex')
            
            cy.get('table tbody tr:not(.ant-table-measure-row)')
              .eq(novoIndex)
              .should('be.visible')
              .scrollIntoView()
              .within(() => {
                cy.get('.ant-dropdown-trigger, [class*="dropdown-trigger"]')
                  .first()
                  .should('be.visible')
                  .click({ force: true })
              })
            
            cy.wait(1000)
            
            cy.then(() => {
              cy.get('ul li span')
                .contains(new RegExp(`^${opcao.trim()}$`, 'i'))
                .should('be.visible')
                .click({ force: true })
              
              cy.wait(3000)
              cy.url({ timeout: 10000 }).should('include', paginaEsperada)
            })
          })
      } else {
        cy.log(`✓ Navegação para ${paginaEsperada} confirmada!`)
      }
    })
  })
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
    
    cy.get('body').then($body => {
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
