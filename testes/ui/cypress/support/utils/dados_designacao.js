// ============================================================================
// DADOS REUTILIZÁVEIS — testes de API de Designação
// ============================================================================
// Centraliza dados de teste hoje duplicados dentro de step definitions de UI
// (cypress/support/step_definitions/ui/designacao_steps.js e
// cessacao_steps.js), para os novos steps de API reaproveitarem sem repetir
// a lista. Não altera os arquivos de UI existentes.
// ============================================================================

// Mesmo pool de RFs já validado pela suíte de UI
// (designacao_steps.js:607-610) — servidores reais existentes em QA.
const RF_POOL = [
  '7311559', '7704941', '5764521', '7443625',
  '7914229', '7209983', '7443668',
]

// Unidade de referência real, obtida de uma designação já existente em QA
// (GET /designacao/designacoes/buscar-por-portaria/?portaria=5791346&ano=2026,
// verificado manualmente antes de escrever estes testes). Serve só como
// combinação válida e conhecida de dre/ue/codigo_hierarquico para montar o
// payload de criação — não referencia nem altera esse registro.
const UNIDADE_REFERENCIA = {
  dre: '108500',
  dre_nome: 'DIRETORIA REGIONAL DE EDUCACAO GUAIANASES',
  ue: '009130',
  unidade_proponente: 'EMEI - OLGA BENARIO PRESTES',
  codigo_hierarquico: '162500000670000',
  funcionarios_da_unidade: '3085',
}

// RF real em QA cujo retorno de POST /designacao/servidor NÃO tem cargo
// sobreposto nem local de exercício (cargo_sobreposto_funcao_atividade e
// local_de_exercicio vêm null) — confirmado manualmente contra QA em
// 2026-08-21. Usado para reproduzir de forma determinística o cenário de
// "ausência de dados opcionais/obrigatórios da integração" sem depender de
// sorteio no pool de RFs.
const RF_SEM_CARGO_SOBREPOSTO_E_LOCAL_EXERCICIO = '7936460'

// Portaria/ano de uma designação já existente em QA, usada nos cenários de
// "buscar por portaria" (mesmo dado já usado em cypress/e2e/ui/atos_novos.feature).
const PORTARIA_EXISTENTE = { portaria: '5791346', ano: '2026' }

// Portaria/ano de uma cessação já existente em QA (GET /designacao/cessacoes/,
// verificado manualmente), usada no cenário de "buscar cessação por portaria".
const PORTARIA_CESSACAO_EXISTENTE = { portaria: '3', ano: '2026' }

// Portaria/ano de uma insubsistência já existente em QA (GET
// /designacao/insubsistencias/, verificado manualmente), usada no cenário de
// "buscar insubsistência por portaria".
const PORTARIA_INSUBSISTENCIA_EXISTENTE = { portaria: '8857671', ano: '2026' }

// Cargo de referência para o payload de criação com tipo_vaga=VAGO (evita
// depender de um segundo servidor "titular" para montar o payload) — código
// confirmado em GET /designacao/designacoes/cargos-sobrepostos-pareados/.
const CARGO_VAGA_REFERENCIA = { codigo: 3085, nome: 'ASSISTENTE DE DIRETOR DE ESCOLA' }

function numeroAleatorio(digitos = 7) {
  const min = Math.pow(10, digitos - 1)
  const max = Math.pow(10, digitos) - 1
  return String(Math.floor(min + Math.random() * (max - min)))
}

function rfAleatorio() {
  return RF_POOL[Math.floor(Math.random() * RF_POOL.length)]
}

// Monta o payload de POST /designacao/designacoes/ no mesmo formato de
// mapearPayloadDesignacao (src/utils/designacao/mapearPayload.ts), a partir
// dos dados de um servidor (resposta de POST /designacao/servidor).
//
// IMPORTANTE: campos opcionais (doc, data_fim, impedimento_substituicao,
// motivo_afastamento, pendencias, detalhe_para_quadro_de_historico_por_ano)
// são OMITIDOS de propósito — confirmado manualmente contra QA que a API
// responde 400 ("Este campo pode não ser nulo.") quando eles são enviados
// como null explícito.
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
  RF_SEM_CARGO_SOBREPOSTO_E_LOCAL_EXERCICIO,
  UNIDADE_REFERENCIA,
  PORTARIA_EXISTENTE,
  PORTARIA_CESSACAO_EXISTENTE,
  PORTARIA_INSUBSISTENCIA_EXISTENTE,
  CARGO_VAGA_REFERENCIA,
  numeroAleatorio,
  rfAleatorio,
  montarPayloadDesignacao,
}
