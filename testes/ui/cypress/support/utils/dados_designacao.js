// ============================================================================
// DADOS REUTILIZÁVEIS — testes de API de Designação
// ============================================================================

// Servidores reais existentes em QA.
const RF_POOL = [
  '7311559', '7704941', '5764521', '7443625',
  '7914229', '7209983', '7443668',
]

// Combinação válida e conhecida de dre/ue/codigo_hierarquico, obtida de uma
// designação já existente em QA — não referencia nem altera esse registro.
const UNIDADE_REFERENCIA = {
  dre: '108500',
  dre_nome: 'DIRETORIA REGIONAL DE EDUCACAO GUAIANASES',
  ue: '009130',
  unidade_proponente: 'EMEI - OLGA BENARIO PRESTES',
  codigo_hierarquico: '162500000670000',
  funcionarios_da_unidade: '3085',
}

const PORTARIA_EXISTENTE = { portaria: '5791346', ano: '2026' }
const PORTARIA_CESSACAO_EXISTENTE = { portaria: '3', ano: '2026' }
const PORTARIA_INSUBSISTENCIA_EXISTENTE = { portaria: '8857671', ano: '2026' }

// Cargo de referência pra montar payload com tipo_vaga=VAGO, evitando
// depender de um segundo servidor "titular".
const CARGO_VAGA_REFERENCIA = { codigo: 3085, nome: 'ASSISTENTE DE DIRETOR DE ESCOLA' }

function numeroAleatorio(digitos = 7) {
  const min = Math.pow(10, digitos - 1)
  const max = Math.pow(10, digitos) - 1
  return String(Math.floor(min + Math.random() * (max - min)))
}

function rfAleatorio() {
  return RF_POOL[Math.floor(Math.random() * RF_POOL.length)]
}

// Campos opcionais (doc, data_fim, impedimento_substituicao, etc.) são
// OMITIDOS de propósito: a API responde 400 quando enviados como null.
function montarPayloadDesignacao(servidor, overrides = {}) {
  return {
    dre_nome: UNIDADE_REFERENCIA.dre_nome,
    unidade_proponente: UNIDADE_REFERENCIA.unidade_proponente,
    dre: UNIDADE_REFERENCIA.dre,
    ue: UNIDADE_REFERENCIA.ue,
    funcionarios_da_unidade: UNIDADE_REFERENCIA.funcionarios_da_unidade,
    codigo_hierarquico: UNIDADE_REFERENCIA.codigo_hierarquico,

    indicado_nome_civil: servidor.nome_civil || '',
    indicado_nome_servidor: servidor.nome_servidor,
    indicado_rf: servidor.rf,
    indicado_vinculo: servidor.vinculo,
    indicado_cargo_base: servidor.cargo_base,
    indicado_codigo_cargo_base: servidor.cd_cargo_base,
    indicado_lotacao: servidor.lotacao,
    indicado_cargo_sobreposto: servidor.cargo_sobreposto_funcao_atividade,
    indicado_codigo_cargo_sobreposto: servidor.cd_cargo_sobreposto_funcao_atividade,
    indicado_local_exercicio: servidor.local_de_exercicio,
    indicado_local_servico: servidor.local_de_servico,
    indicado_categoria: servidor.categoria || '',

    numero_portaria: numeroAleatorio(7),
    ano_vigente: '2026',
    sei_numero: numeroAleatorio(7),
    data_inicio: new Date().toISOString().split('T')[0],

    carater_excepcional: false,
    com_afastamento: false,
    possui_pendencia: false,

    tipo_vaga: 'VAGO',
    cargo_vaga: CARGO_VAGA_REFERENCIA.codigo,
    informacoes_adicionais: 'Criado por automacao de testes de API - cy.signa_api',

    ...overrides,
  }
}

module.exports = {
  RF_POOL,
  UNIDADE_REFERENCIA,
  PORTARIA_EXISTENTE,
  PORTARIA_CESSACAO_EXISTENTE,
  PORTARIA_INSUBSISTENCIA_EXISTENTE,
  CARGO_VAGA_REFERENCIA,
  numeroAleatorio,
  rfAleatorio,
  montarPayloadDesignacao,
}
