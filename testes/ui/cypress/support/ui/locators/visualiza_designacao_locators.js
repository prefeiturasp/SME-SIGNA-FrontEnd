// =====================================================
// 🔹 LOCATORS - VISUALIZAR DESIGNAÇÃO
// =====================================================

export const visualizarDesignacaoSelectors = {

  // ===============================
  // AÇÃO NA TABELA (VISUALIZAR)
  // ===============================
  botaoVisualizarTabela: () => {
    return cy.get('tbody tr', { timeout: 10000 })
      .first()
      .find('td')
      .last()
      .find('svg[data-icon="eye"], button:contains("Visualizar"), a:contains("Visualizar")')
      .first()
  },

  // ===============================
  // TELA
  // ===============================
  tituloTela: () => cy.contains(
    'h1, h2, h3, div, span',
    /Visualizar\s+Designa[çc][ãa]o/i,
    { timeout: 15000 }
  ),

  // ===============================
  // ABAS
  // ===============================
  aba: (nome) => cy.contains(
    '.ant-tabs-tab, button, span, h2, h3',
    nome,
    { timeout: 10000 }
  ),

  // ===============================
  // LABELS / TEXTOS
  // ===============================
  label: (texto) => cy.contains(
    'label, span, p, div, h1, h2, h3, h4, strong',
    texto,
    { timeout: 10000 }
  ),

  // ===============================
  // TEXTOS GENÉRICOS
  // ===============================
  textoGenerico: (texto) => cy.contains(
    'label, span, p, div, h1, h2, h3, h4, strong, td, th',
    texto,
    { timeout: 10000 }
  ),

  // ===============================
  // VALIDAÇÕES
  // ===============================
  validarAbaVazia: () => {
    return cy.get('body').then($body => {
      const temConteudo = 
        $body.find('input:visible, textarea:visible, select:visible, .ant-form-item, span:visible, p:visible').length > 0
      return !temConteudo
    })
  },

  verificarCamposVisiveis: () => {
    return cy.get('body').then($body => {
      const qtdCampos = $body.find('label:visible, span:visible, p:visible, div:visible').length
      cy.log(`📊 Campos visíveis encontrados: ${qtdCampos}`)
      return qtdCampos > 0
    })
  }
}

// ===============================
// MAPA DE ABAS E TÍTULOS
// ===============================
export const visualizarDesignacaoMap = {
  
  abas: {
    unidadeProponente: {
      nome: 'Unidade Proponente',
      titulos: [
        'DRE',
        'Unidade proponente',
        'Codigo Estrutura hierárquica'
      ]
    },

    portariaDesignacao: {
      nome: 'Portaria de designação',
      titulos: [
        'Portaria da designação',
        'Ano Vigente',
        'Nº SEI',
        'D.O',
        'A partir de',
        'Até',
        'Caráter Excepcional',
        'Impedimento para substituição:',
        'Motivo do afastamento:',
        'Pendência:'
      ]
    },

    servidorIndicado: {
      nome: 'Servidor indicado',
      titulos: [
        'Nome Servidor',
        'Nome Social',
        'RF',
        'Vínculo',
        'Cargo base',
        'Cargo sobreposto/Função atividade',
        'Local de exercício',
        'Laudo médico'
      ]
    },

    cargoDisponivel: {
      nome: 'Cargo Disponivel',
      titulos: [
        'Nome do Cargo Disponível'
      ]
    }
  },

  textos: {
    portariaFinal: 'PORTARIA'
  }
}
