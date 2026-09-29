import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { gestaoCargoCadastroPack, gestaoCargoCadastroUrls } from '../../ui/locators/gestao_cargo_cadastro_locators'

When('clica no botão "Cancelar" do cadastro de cargo base', () => {
  cy.get('[data-testid="btn-voltar"]', { timeout: 10000 }).should('be.visible').click({ force: true })
})

// Pool de códigos EOL é pequeno e não filtra duplicados — troca de código e
// resubmete até esgotar as opções (ver "@codigosEolTentados").
When('clica no botão "Cadastrar cargo" do cadastro de cargo base', () => {
  const submeterEChecar = () => {
    cy.get('[data-testid="botao-cadastrar-cargo"]', { timeout: 10000 }).should('be.visible').click({ force: true })
    cy.wait(1200)

    cy.get('body').then(($body) => {
      const duplicado = [...$body.find('.ant-notification-notice-error')]
        .some((el) => /código cargo no eol já existe/i.test(el.textContent))

      if (!duplicado) {
        return
      }

      gestaoCargoCadastroPack.codigoCargoEol.trigger().should('be.visible').click({ force: true })

      cy.get('@codigosEolTentados').then((tentados) => {
        gestaoCargoCadastroPack.codigoCargoEol.opcoes()
          .filter(':visible')
          .should('have.length.greaterThan', 0)
          .then(($opcoes) => {
            const disponiveis = $opcoes.toArray().filter((el) => !tentados.includes(el.textContent.trim()))
            if (disponiveis.length === 0) {
              // Fecha o popover (Esc) antes de falhar, senão o próximo
              // Cenário herda o popover aberto (@testIsolation(false)).
              cy.get('body').type('{esc}').then(() => {
                throw new Error('Todos os códigos de cargo no EOL disponíveis já têm cargo base cadastrado em QA — cenário depende de massa de dado (código EOL livre) que hoje não existe no ambiente, não é falha de código.')
              })
              return
            }
            const escolhido = disponiveis[Math.floor(Math.random() * disponiveis.length)]
            const texto = escolhido.textContent.trim()
            cy.log(`⚠️ Código já cadastrado — tentando outro: "${texto}"`)
            cy.wrap([...tentados, texto]).as('codigosEolTentados')
            cy.wrap(escolhido).click()
          })
      })

      submeterEChecar()
    })
  }

  submeterEChecar()
})

Then('o sistema direciona para a tela de cadastro de cargo base', () => {
  cy.url({ timeout: 20000 }).should('include', gestaoCargoCadastroUrls.pagina)
  gestaoCargoCadastroPack.titulo().should('be.visible')
  cy.get('.loading, .spinner, .loader').should('not.exist')
})

When('seleciona a opção {string} no campo {string}', (opcao, campo) => {
  gestaoCargoCadastroPack.comboboxPorLabel(campo).should('be.visible').click()

  cy.get('[role="option"]', { timeout: 10000 })
    .contains(new RegExp(`^${opcao}$`, 'i'))
    .should('be.visible')
    .click()
})

When('preenche o campo {string} do cargo base com {string}', (campo, valor) => {
  gestaoCargoCadastroPack.campoPorLabel(campo)
    .should('be.visible')
    .clear()
    .type(valor, { delay: 50 })
})

When('seleciona um código de cargo aleatório no EOL', () => {
  gestaoCargoCadastroPack.codigoCargoEol.trigger().should('be.visible').click()

  gestaoCargoCadastroPack.codigoCargoEol.opcoes()
    .filter(':visible')
    .should('have.length.greaterThan', 0)
    .then(($opcoes) => {
      const indice = Math.floor(Math.random() * $opcoes.length)
      const texto = $opcoes.eq(indice).text().trim()
      cy.log(`Código do cargo selecionado (índice ${indice}): ${texto}`)
      cy.wrap([texto]).as('codigosEolTentados')
      cy.wrap($opcoes.eq(indice)).click()
    })
})

When('ativa a opção {string} de utilização do cargo', (opcao) => {
  gestaoCargoCadastroPack.switchPorLabel(opcao)
    .should('be.visible')
    .click({ force: true })
})

Then('o sistema retorna para a listagem de cargos base', () => {
  cy.url({ timeout: 20000 })
    .should('include', 'gestao/cargos-base')
    .and('not.include', 'criar-editar-cargo-base')
})

Then('cada campo obrigatorio do cargo base exibe a mensagem de campo obrigatorio', () => {
  gestaoCargoCadastroPack.mensagensDeErro()
    .should('have.length.at.least', 5)
    .each(($mensagem) => {
      cy.wrap($mensagem).should('contain.text', 'Campo obrigatório.')
    })
})

Then('a notificação de sucesso do cadastro de cargo base deve exibir {string}', (texto) => {
  cy.get('.ant-notification-notice-success', { timeout: 15000 })
    .contains(texto, { timeout: 15000 })
    .should('be.visible')
})
