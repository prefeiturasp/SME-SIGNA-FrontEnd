// Steps de asserção da tabela para o filtro de "Textos de portaria"
// (filtra_texto_portaria.feature). Navegação, preenchimento de filtro,
// seleção de combobox e estado dos botões reaproveitam os steps genéricos já
// existentes em gestao_cargos_base_steps.js (mesmo componente FiltroAcoes/
// FieldsForm usado em outras telas de "Gestão").
//
// Validado em navegador real (Playwright): esta tela sofre o mesmo bug de
// polling RSC contínuo já documentado em designacao_steps.js para
// "listagem-designacoes" — um clique "de verdade" no botão Pesquisar/Limpar
// filtros pode travar esperando o elemento "estabilizar". O step genérico
// "clica no botão {string}" (alterar_senha_steps.js) já usa
// .click({ force: true }), que ignora essa checagem — não trocar por um
// clique sem force nesses botões.
//
// O mesmo polling foi observado remontando o Context do menu lateral
// (Sider/provider), fechando o submenu "Gestão" sem nenhuma ação do usuário
// — openKeys começa sempre em [] (Sider/provider/index.tsx) e qualquer
// clique num item-folha do menu já reseta pra [] (Sider/index.tsx,
// handleMenuClick). Se o Cenário 1 (navegação pela barra lateral) ficar
// instável, o alvo mais provável é esse polling, não o step em si.

import { Then } from '@badeball/cypress-cucumber-preprocessor'
import { textoPortariaPack } from '../../ui/locators/texto_portaria_locators'

Then('a tabela de textos de portaria exibe resultado para {string}', (valor) => {
  textoPortariaPack.listagem.linhas().should(($linhas) => {
    expect($linhas.length, `linhas retornadas para "${valor}"`).to.be.greaterThan(0)
    $linhas.each((_, linha) => {
      expect(linha.textContent).to.contain(valor)
    })
  })
})

// Validado via navegador real: sem resultado, o AntD Table renderiza uma
// <tr> de verdade com "Não há dados" (não é a .ant-table-measure-row já
// filtrada por "linhas()") — checar "have.length 0" nas linhas dá falso
// negativo, pois essa linha do estado vazio sempre conta como 1.
// O "Não há dados" também existe no <title> do SVG do estado vazio (0x0 px),
// e cy.contains() casa nele primeiro — por isso a checagem é pelo texto do
// tbody, não pela visibilidade do elemento encontrado.
Then('a tabela de textos de portaria não exibe resultados', () => {
  cy.get('tbody', { timeout: 15000 })
    .should('be.visible')
    .and(($tbody) => {
      expect($tbody.text()).to.match(/não há dados/i)
    })
})
