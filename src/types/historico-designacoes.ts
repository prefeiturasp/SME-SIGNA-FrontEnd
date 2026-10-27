export interface AtoRelacionadoHistorico {
  readonly id: number;
  readonly ato_pai_id: number;
  readonly tipo: string;
  readonly tipo_de_ato: string;
  readonly nivel: number;
  readonly data_do_ato: string | null;
  readonly numero_portaria: number | null;
  readonly ano_vigente: string;
  readonly portaria: string;
  readonly nome_display: string;
  readonly observacao: string;
  readonly ativo: boolean;
  readonly ultimo_ato_vigente: boolean;
}

export interface DesignacaoHistorico {
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
  readonly servidor_indicado: string;
  readonly indicado_rf: string;
  readonly data_inicio: string | null;
  readonly data_fim: string | null;
  readonly vigente: boolean;
  readonly cessada_em: string | null;
  readonly atos_relacionados: AtoRelacionadoHistorico[];
}

export interface HistoricoDeDesignacoesFiltros {
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
