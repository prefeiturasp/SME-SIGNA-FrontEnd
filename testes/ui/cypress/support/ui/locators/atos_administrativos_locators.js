// =====================================================
// LOCATORS — ATOS ADMINISTRATIVOS (Pesquisa / Filtros)
// =====================================================
// Estratégia de localização dos campos de filtro: a tela não expõe
// label/for estável em todos eles (Período, e os selects Tipo/Status do
// shadcn-ui, não têm <label for> associado), então os inputs de texto são
// localizados por ordem de aparição visível dentro do formulário — ordem
// confirmada por inspeção manual da tela real:
//   Tipo, Nº SEI, Período, Portaria de designação, Servidor, RF, Status
//
// Escopado em "main form" para não colidir com elementos do menu lateral
// (<aside> mantém <button>/<span> ocultos no DOM mesmo com o menu fechado —
// mesma classe de bug já corrigida em common_steps.js/insubsistente_steps.js
// nesta suíte).

const formulario = () =>
  cy.get('main form', { timeout: 10000 }).first()

// Inputs de texto do formulário, excluindo os dois <input> internos do
// Ant Design RangePicker (início/fim de Período) — eles ficam ":visible"
// mesmo com o calendário fechado, então entravam na contagem posicional
// e deslocavam os índices dos campos seguintes (Portaria de designação,
// Servidor, RF), fazendo o teste digitar no campo de data errado e abrir
// o calendário por cima do botão "Pesquisar".
const camposTexto = () =>
  formulario().find('input').filter(':visible').not('.ant-picker-range input')

export const atosAdministrativosPack = {

  // Escopado em "main": sem isso, depois de navegar pelo menu lateral (ver
  // atos_novos.feature, retorno via "seleciona a opção ... no menu lateral"),
  // o item de submenu "Atos administrativos" continua no DOM oculto
  // (display:none, dentro de .ant-menu-hidden) e o cy.contains genérico
  // encontra esse <div class="app-sider-menu-title"> escondido em vez do
  // <h1> real da página — mesma classe de bug já corrigida em
  // common_steps.js/insubsistente_steps.js para o mesmo <aside>.
  titulo: () =>
    cy.get('main', { timeout: 15000 }).contains('Atos administrativos', { timeout: 15000 }),

  textoInstrucao: () =>
    cy.contains('Selecione os campos para buscar as portarias disponíveis.', { timeout: 10000 }),

  filtros: {
    // Select shadcn/ui (Radix) — primeiro <button> do formulário. O
    // trigger não exibe "Tipo" como texto (placeholder diferente), por
    // isso a localização é posicional em vez de por texto.
    tipo: () =>
      formulario().find('button').eq(0),

    numeroSei: () =>
      camposTexto().eq(0),

    periodo: () =>
      formulario().find('.ant-picker-range').first(),

    // Os dois <input> internos do Ant Design RangePicker (início/fim)
    periodoInputs: () =>
      formulario().find('.ant-picker-range input'),

    portariaDesignacao: () =>
      camposTexto().eq(1),

    servidor: () =>
      camposTexto().eq(2),

    rf: () =>
      camposTexto().eq(3),

    // Assim como "Tipo", o trigger de Status não exibe "Status" como texto
    // visível (é só um placeholder genérico do componente) — localização
    // por texto não funciona. Posicional: segundo <button> do formulário
    // (o primeiro é "Tipo"; os dois últimos são as ações "Limpar filtros"
    // e "Pesquisar", confirmado por inspeção manual da tela real).
    status: () =>
      formulario().find('button').eq(1),
  },

  botoes: {
    limpar: () =>
      cy.contains('button', 'Limpar filtros', { timeout: 10000 }),

    pesquisar: () =>
      cy.contains('button', 'Pesquisar', { timeout: 10000 }),
  },

  // Os triggers de Tipo/Status são componentes shadcn/ui (Radix Select),
  // não Ant Design — classes como "data-[placeholder]:..." e
  // "[&>span]:line-clamp-1" são do shadcn. As opções do popup usam o
  // atributo ARIA padrão do Radix (role="option") em vez de classes
  // ".ant-select-*".
  dropdown: {
    opcao: (texto) =>
      cy.get('[role="option"]', { timeout: 10000 }).contains(texto),
  },

  // Menu "Novo ato +": diferente do dropdown de filtros acima — este é um
  // menu de ações (role "menuitem"), não um Radix Select (role "option"). O
  // botão que abre o menu é clicado via step genérico "clica no botão
  // {string}" (alterar_senha_steps.js), por isso só as opções do menu
  // precisam de locator próprio aqui.
  novoAto: {
    // Regex ancorada (^...$, case-insensitive) em vez de substring simples:
    // evita que uma opção cujo texto é prefixo/sufixo de outra (ex.: "Nova
    // apostila" vs "Anular apostila") ou que rótulos internos duplicados no
    // DOM causem match errado.
    //
    // Escopado em ".ant-dropdown:not(.ant-dropdown-hidden)": o Ant Design
    // mantém no DOM instâncias antigas/fechadas do dropdown "Novo ato +"
    // (raiz com a classe "ant-dropdown-hidden", display:none) depois de
    // navegações repetidas pela SPA — confirmado em execução real, onde
    // cy.contains() (sem esse filtro) pegava o <span> de uma cópia oculta
    // em vez do menu efetivamente aberto, e o clique falhava com "not
    // visible" mesmo com a opção certa existindo e visível em outro lugar
    // do DOM. Sem esse escopo, um cenário que roda depois de outro que já
    // abriu esse mesmo menu fica sujeito a esse falso negativo.
    opcao: (texto) =>
      cy.get('.ant-dropdown:not(.ant-dropdown-hidden) [role="menuitem"], .ant-dropdown:not(.ant-dropdown-hidden) li, .ant-dropdown:not(.ant-dropdown-hidden) button, .ant-dropdown:not(.ant-dropdown-hidden) div', { timeout: 10000 })
        .filter(':visible')
        .contains(new RegExp(`^${texto}$`, 'i')),
  },

  // Modal aberto a partir de uma opção do menu "Novo ato" (ex.: Nova
  // cessação) — confirmado via HTML real: é um Dialog Radix/shadcn
  // (role="dialog"), NÃO Ant Design. .ant-modal (tentativa anterior) nunca
  // deu match porque essa classe não existe nesse componente.
  modal: {
    container: () =>
      cy.get('[role="dialog"]', { timeout: 15000 }),

    contendo: (texto) =>
      cy.get('[role="dialog"]', { timeout: 15000 }).contains(texto),

    // Busca o input pela associação padrão HTML label[for] -> input[id]
    // (confirmado no HTML real: <label for="_r_dn_-form-item"> e
    // <input id="_r_dn_-form-item">). O id é gerado dinamicamente pelo
    // Radix a cada montagem, por isso é lido em tempo de execução em vez
    // de hardcoded.
    campoPorLabel: (label) =>
      cy.get('[role="dialog"]', { timeout: 15000 })
        .contains('label', label)
        .invoke('attr', 'for')
        .then((forId) => cy.get(`[role="dialog"] #${forId}`)),

    // Select "Ano" (shadcn/ui Select sobre Radix) do modal de busca por
    // portaria — campo obrigatório adicionado pelo dev (zod: "Selecione o
    // ano."). Localizado por data-testid fixo do componente
    // (ModalBuscaPortaria.tsx: data-testid="select-busca-ano"), mais
    // estável que resolver via label[for] porque não depende do id gerado
    // dinamicamente pelo Radix.
    selectAno: () =>
      cy.get('[role="dialog"] [data-testid="select-busca-ano"]', { timeout: 15000 }),
  },

  tabela: {
    container: () =>
      cy.get('table', { timeout: 15000 }),

    linhas: () =>
      // Exclui a linha oculta de medição de colunas que o Ant Design
      // Table injeta no DOM (.ant-table-measure-row, height 0, usada
      // apenas para calcular a largura das colunas) — não é dado real e
      // quebra as asserções de conteúdo ao ser tratada como linha válida.
      cy.get('tbody tr', { timeout: 15000 }).not('.ant-table-measure-row'),

    // Esta tela NÃO usa o componente Empty padrão do Ant Design (sem
    // classes .ant-empty/.ant-table-empty) — o estado vazio é uma linha
    // de texto customizada "Não há dados" dentro do tbody (confirmado por
    // evidência real: uma linha de resultado chegou a conter literalmente
    // esse texto durante uma renderização em transição).
    estadoVazio: () =>
      cy.get('tbody', { timeout: 15000 }).contains(/não há dados/i),
  },
}

export const atosAdministrativosTextos = {
  titulo: 'Atos administrativos',
  instrucao: 'Selecione os campos para buscar as portarias disponíveis.',
}

export const atosAdministrativosUrls = {
  pagina: 'atos-administrativos',
}
