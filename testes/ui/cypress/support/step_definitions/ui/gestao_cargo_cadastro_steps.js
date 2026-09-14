// Step Definitions — Gestão de Cargos Base (Cadastro)
// Cobre a tela /pages/gestao/criar-editar-cargo-base, aberta a partir da
// listagem (gestao_cargos_base_steps.js/locators.js cobrem a listagem em
// si — pesquisa e filtros).
//
// Steps comuns reutilizados (não redefinidos aqui):
//   • "que o usuário está logado no sistema" / "está na tela {string}" → gestao_cargos_base_steps.js
//   • "valida a existencia do Texto {string}"                          → common_steps.js
//   • "clica no botão {string}"                                        → alterar_senha_steps.js
//     (usado direto no .feature pra "Cadastrar novo cargo" e "Cadastrar
//     cargo" — caem no fallback genérico dessa step. NÃO usado pra
//     "Cancelar": aquele step tem um branch específico que só procura
//     dentro de [role="dialog"]/[class*="modal"], e o botão Cancelar desta
//     tela fica solto no PageHeader, não em modal — por isso o step próprio
//     abaixo, usando o data-testid confirmado em page.tsx.)
//   • "valida a existencia do botão de navegação {string}"             → cessacao_steps.js
//
// Textos próprios (nunca "preenche o campo {string} com {string}" nem
// "seleciona a opção {string} no filtro {string}"): esses já existem em
// outros arquivos com escopo diferente (modal de "Novo ato" e filtros da
// listagem) — reaproveitar o mesmo texto aqui causaria "Multiple matching
// step definitions" no Cucumber.

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { gestaoCargoCadastroPack, gestaoCargoCadastroUrls } from '../../ui/locators/gestao_cargo_cadastro_locators'

When('clica no botão "Cancelar" do cadastro de cargo base', () => {
  cy.get('[data-testid="btn-voltar"]', { timeout: 10000 }).should('be.visible').click({ force: true })
})

// Step próprio (em vez do fallback genérico "clica no botão {string}" de
// alterar_senha_steps.js): o breadcrumb da tela usa o mesmo título da página
// como texto do link ("Cadastrar cargo base", href="/") e vem antes do botão
// de submit no DOM — cy.contains('button, a', 'Cadastrar cargo') casa com o
// breadcrumb primeiro e, com {force: true}, navega para fora da tela em vez
// de submeter o formulário. data-testid confirmado em
// FormCargosBase (criar-editar-cargo-base/page.tsx).
//
// Retry ao esbarrar em código EOL já cadastrado: confirmado em execução real
// (inspeção direta do DOM em QA) que o submit pode falhar com uma
// notification.error do antd — "codigo_cargo: cargo base com este Código
// cargo no EOL já existe." — não é bug de layout/switch nenhum, é regra de
// negócio (unicidade) batendo contra o pool pequeno de códigos (só 5) que a
// própria suíte vai esgotando a cada cadastro bem-sucedido. Em vez de deixar
// o teste estourar timeout esperando uma notificação de sucesso que nunca
// chega, troca de código (excluindo os já tentados, guardados em
// "@codigosEolTentados") e resubmete — até esgotar as opções, quando então
// falha com mensagem clara em vez do timeout genérico.
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
              // Fecha o popover do combobox (Esc) ANTES de desistir — sem
              // isso o teste falhava aqui mas deixava o popover aberto na
              // tela; com @testIsolation(false) essa sujeira sobrevivia pro
              // próximo Cenário da feature e quebrava ele também (confirmado
              // em execução real: Cenário seguinte não achava mais nem o
              // trigger "select-codigo-cargo-eol" da tela de cadastro).
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

// Grupamento / Situação Funcional / Status usam o mesmo componente SelectField
// (shadcn Select) já usado nos filtros da listagem — mesmo padrão de
// localização (label + button[role="combobox"] irmão), texto de step
// diferente ("campo" em vez de "filtro") só pra não colidir com o step de
// gestao_cargos_base_steps.js.
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

// "Código do cargo no EOL" vem de uma lista carregada via API — sem valor
// fixo conhecido, escolhe uma opção aleatória entre as visíveis (mesmo
// espírito de "seleciona o cargo de forma aleatoria no painel da unidade"
// em designacao_steps.js).
//
// A lista tem só 5 opções (ASSISTENTE DE DIRETOR DE ESCOLA, DIRETOR DE
// ESCOLA, COORDENADOR PEDAGOGICO, SECRETARIO DE ESCOLA, SUPERVISOR ESCOLAR —
// confirmado em inspeção real) e NÃO filtra as que já têm cargo base
// cadastrado — o backend só rejeita duplicata no submit ("codigo_cargo:
// cargo base com este Código cargo no EOL já existe."). Como a suíte cadastra
// um cargo novo por execução (Cenários 1/4/5/6/7 desta feature), o pool
// de código livre esgota com o tempo — grava os códigos já tentados em
// "@codigosEolTentados" pra "clica no botão Cadastrar cargo" poder trocar de
// código e tentar de novo em vez de estourar timeout esperando uma
// notificação de sucesso que nunca vai vir.
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

// FormMessage (src/components/ui/form.tsx) só existe no DOM quando o campo
// tem erro — cada um dos 5 campos obrigatórios visíveis (Código do cargo no
// EOL, Grupamento, Descrição Resumida, Situação Funcional, Status) renderiza
// o próprio <p class="...text-destructive"> ao tentar submeter vazio
// (confirmado no schema: createFormSchemaCargosBase.ts, mensagem
// "Campo obrigatório." em cada um). "descricao_completa" também é
// obrigatório no schema, mas não tem campo visível próprio no formulário —
// não conta aqui.
Then('cada campo obrigatorio do cargo base exibe a mensagem de campo obrigatorio', () => {
  gestaoCargoCadastroPack.mensagensDeErro()
    .should('have.length.at.least', 5)
    .each(($mensagem) => {
      cy.wrap($mensagem).should('contain.text', 'Campo obrigatório.')
    })
})

// "valida a existencia do Texto" (common_steps.js) é escopado a <main> de
// propósito (evita colisão com texto do menu lateral). O toast de sucesso do
// cadastro usa notification.success do antd (NotificationProvider.tsx), que
// renderiza via portal direto em document.body — fora de <main> — então
// nunca seria encontrado por aquele step. Mesma classe já usada em
// apostilar_steps.js/altera_DO_steps.js para notificação de sucesso do antd.
Then('a notificação de sucesso do cadastro de cargo base deve exibir {string}', (texto) => {
  cy.get('.ant-notification-notice-success', { timeout: 15000 })
    .contains(texto, { timeout: 15000 })
    .should('be.visible')
})
