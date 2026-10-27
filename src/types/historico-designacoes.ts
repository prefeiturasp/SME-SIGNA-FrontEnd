export interface AtoRelacionadoHistorico {
  readonly id: number;
  readonly ato_pai_id: number | null;
  readonly ato_raiz_id: number | null;
  readonly tipo: string;
  readonly tipo_de_ato: string;
  readonly nivel: number;
  readonly data_designacao: string | null;
  readonly data_cessacao: string | null;
  readonly numero_portaria: number | null;
  readonly ano_vigente: string;
  readonly portaria: string;
  readonly nome: string;
  readonly cargo: string;
  readonly rf: string;
  readonly status: string;
  readonly status_publicacao: string;
  readonly sei_numero: string;
  readonly doc: string | null;
  readonly criado_em: string;
  readonly criado_por_nome: string;
  readonly observacoes: string;
  readonly tipo_insubsistencia: string | null;
  readonly tipo_apostila: string | null;
  readonly ativo: boolean;
  readonly ultimo_ato_vigente: boolean;
}

export interface DesignacaoHistorico {
  readonly cargo_vaga?: number | null;
  readonly id: number;
  readonly status: string;
  readonly numero_portaria: number | null;
  readonly ano_vigente: string;
  readonly portaria: string;
  readonly sei_numero: string;
  readonly doc: string | null;
  readonly ue: string;
  readonly dre: string;
  readonly dre_nome: string;
  readonly unidade_proponente: string;
  readonly codigo_hierarquico: string;
  readonly cargo: string;
  readonly tipo: string;
  readonly tipo_de_ato: string;
  readonly status_publicacao: string;
  readonly ato_pai_id: number | null;
  readonly ato_raiz_id: number | null;
  readonly criado_em: string;
  readonly criado_por_nome: string;
  readonly nome: string;
  readonly rf: string;
  readonly indicado_nome_civil: string;
  readonly indicado_nome_servidor: string;
  readonly indicado_rf: string;
  readonly data_inicio: string | null;
  readonly data_fim: string | null;
  readonly vigente: boolean;
  readonly cessada_em: string | null;
  readonly atos_relacionados: AtoRelacionadoHistorico[];
}

export interface HistoricoDeDesignacoesFiltros {
  cargo?: string;
  tipo?: string;
  portaria?: string;
  numero_sei?: string;
  nome_titular_e_indicado?: string;
  status_publicacao?: string;
  periodo_after?: string;
  periodo_before?: string;
  rf?: string;
  observacao?: string;
}
