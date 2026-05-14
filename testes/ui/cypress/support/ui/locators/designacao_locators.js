// Locators para as páginas de Designação do SIGNA
// Dashboard : https://qa-signa.sme.prefeitura.sp.gov.br/pages
// Nova designação: https://qa-signa.sme.prefeitura.sp.gov.br/pages/designacoes/designacoes-passo-1

export const designacaoLocators = {

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  // Card do módulo Designação (primeiro card na grade)
  tituloCardDesignacao: 'h2.font-semibold:contains("Designação")',
  descricaoCardDesignacao: 'p.text-sm.text-gray-600:contains("Realize a pesquisa")',
  // Botão de abrir módulo (direto no card — seletor estrutural de fallback)
  botaoAbrirModulo: 'main > div > div > div:first-child button',

  // ─── Lista de Designações ──────────────────────────────────────────────────
  logoSigna: 'header img',
  botaoNovaDesignacao: 'button:contains("Nova designação")',

  // ─── Nova Designação — Passo 1 ─────────────────────────────────────────────
  tituloPagina: 'h1:contains("Designação")',
  formDesignacao: '.bg-white',

  // Card "Servidor indicado" (Ant Design)
  cardServidorIndicado: '.ant-card',
  tituloCardServidor: '.ant-card-head span:contains("Servidor")',
  // Campo RF — input dentro do corpo do card de servidor
  campoRF: '.ant-card-body input',
  // Botão Pesquisar do card de servidor (1º botão Pesquisar da página)
  botaoPesquisarServidor: '[id^="radix-"] form > div:nth-child(3) button, .ant-card-body button:contains("Pesquisar")',

  // ─── Accordion "Dados do servidor indicado" (Radix UI) ────────────────────
  triggerAccordionServidor: 'button:contains("Dados do servidor indicado")',
  conteudoAccordionServidor: '[data-state="open"]',

  // Rótulos dos campos do servidor exibidos no accordion
  campoNomeServidor:    'p.font-bold:contains("Nome Servidor")',
  campoNomeSocial:      'p.font-bold:contains("Nome Social")',
  campoRFServidor:      'p.font-bold:contains("RF")',
  campoVinculo:         'p.font-bold:contains("nculo")',       // Vínculo / Vinculo
  campoCargoBase:       'p.font-bold:contains("Cargo base")',
  campoLotacao:         'p.font-bold:contains("Lota")',         // Lotação
  campoCursosTitulos:   'p.font-bold:contains("Cursos")',
  campoCargoSobreposto: 'p.font-bold:contains("Cargo sobreposto")',
  campoLocalExercicio:  'p.font-bold:contains("Local")',
  campoLaudoMedico:     'p.font-bold:contains("Laudo")',

  // Botão Editar (dentro do accordion aberto)
  botaoEditarServidor: 'button:contains("Editar")',

  // ─── Modal "Editar dados servidor indicado" ────────────────────────────────
  modalEditar:         '[role="dialog"]',
  tituloModalEditar:   'h2:contains("Editar dados servidor indicado")',
  formularioEdicao:    '#editar-servidor-form',

  // Labels dos campos editáveis no modal
  labelNomeServidor:    'label:contains("Nome servidor")',
  labelNomeSocial:      'label:contains("Nome Social")',
  labelRFModal:         'label:contains("RF")',
  labelVinculo:         'label:contains("nculo")',
  labelCargoBase:       'label:contains("Cargo base")',
  labelLotacao:         'label:contains("Lota")',
  labelCargoSobreposto: 'label:contains("Cargo sobreposto")',
  labelLocalExercicio:  'label:contains("Local de exerc")',
  labelLaudoMedico:     'label:contains("Laudo")',

  botaoCancelarModal: '#editar-servidor-form button:contains("Cancelar")',
  botaoSalvarModal:   '#editar-servidor-form button:contains("Salvar")',

  // ─── Seção "Unidade Proponente" ────────────────────────────────────────────
  tituloUnidadeProponente: 'span:contains("Unidade Proponente")',
  labelDRE:                'label:contains("DRE")',
  labelUnidadeProponente:  'label:contains("Unidade proponente")',

  // Triggers dos dropdowns Radix Select (combobox)
  dropdownDRE:      'button[role="combobox"]:first',
  dropdownUnidade:  'button[role="combobox"]:eq(1)',

  botaoPesquisarUnidade: 'button:contains("Pesquisar")',

  // Itens do dropdown (renderizados via portal pelo Radix)
  opcoesDropdown: '[role="option"]',
};

// ─── Textos esperados ──────────────────────────────────────────────────────────
export const designacaoTextos = {
  tituloCard:              'Designação',
  descricaoCard:           'Realize a pesquisa e validação de servidores para verificar a aptidão e efetuar a designação para cargos ou funções disponíveis.',
  tituloPagina:            'Designação',
  tituloCardServidor:      'Servidor indicado',
  tituloAccordionServidor: 'Dados do servidor indicado',
  tituloModalEditar:       'Editar dados servidor indicado',
  tituloUnidadeProponente: 'Unidade Proponente',
};

// ─── URLs ──────────────────────────────────────────────────────────────────────
export const designacaoUrls = {
  dashboard:             '/pages',
  listaDesignacoes:      '/pages/designacoes',
  novaDesignacaoPasso1:  '/pages/designacoes/designacoes-passo-1',
};
