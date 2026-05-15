import { InsubsistenciaRead, InsubsistenciaCessacaoRead } from "./insubsistencia";
import { ApostilaRead } from "./apostila";

export interface BuscaDesignacaoRequest {
  rf: string;
}

export interface Servidor {
  nome_servidor: string,
  nome_civil?: string;
  rf?: string;
  vinculo?: number;
  cargo_base?: string;
  lotacao?: string;
}

export interface Titular {
  nome_servidor?: string;
  nome_civil?: string;
  rf?: string;
  vinculo?: number;
  tipo_vinculo?: string; // efetivo / nomeado
  cargo_base?: string;
}

export interface DesignacaoData {
  portaria_designacao?: string;
  ano?: string;
  numero_sei?: string;
  doc?: string;

  dre?: string;
  dre_nome?: string;

  ue?: string;
  ue_nome?: string;

  codigo_hierarquico?: string;

  tipo_cargo?: "vago" | "substituicao" | "disponivel";

  cargo_vago_selecionado?:
  | string
  | {
    id: number;
    label: string;
  }
  | null;

  a_partir_de?: string | Date;
  designacao_data_final?: string | Date;

  motivo_substituicao?: string;
  motivo_cancelamento?: string;

  impedimento_substituicao?: string;

  servidorIndicado?: Servidor;
  dadosTitular?: Titular | null;
}

export type StatusDesignacaoV2 = 'ativo' | 'cessada' | 'insubsistente';

export enum StatusDesignacao {
  PENDENTE = 0,
  AGUARD_PUBLICACAO = 1,
  PUBLICADO_COM_PENDENCIA = 2,
  PUBLICADO = 3,
}

export interface ListagemDesignacoesResponse {
  id: number;
  dre_nome: string;
  unidade_proponente: string;
  indicado_nome_servidor: string;
  indicado_rf: string;
  titular_nome_servidor: string;
  titular_rf: string;
  numero_portaria: string;
  ano_vigente: string;
  sei_numero: string;
  data_inicio: string;
  data_fim: string | null;
  tipo_vaga: string;
  tipo_vaga_display: string;
  cargo_vaga: number | null;
  cargo_vaga_display: string;
  status?: StatusDesignacao;
  cessacao?: Cessacao | null;
  insubsistencia?: InsubsistenciaRead;
  apostilas?: ApostilaRead[];
}

export interface PortariasDOBody {
  ids: number[];
  data_publicacao: string;
}

export interface ListagemPortariasResponse {
  id: number;
  portaria: string;
  tipo_de_ato: string;
  nome: string;
  cargo: string;
  doc: string;
  data_designacao: string | null;
  data_cessacao: string | null;
  numero_sei: string;
}

export interface DesignacaoFiltros {
  rf?: string;
  nome?: string;
  periodo_after?: string;
  periodo_before?: string;
  cargo_base?: string;
  cargo_sobreposto?: string;
  dre?: string;
  unidade?: string;
  ano?: string;
  page?: number;
  page_size?: number;
  no_pagination?: boolean;
}

export interface DesignacaoPaginada {
  count: number;
  next: string | null;
  previous: string | null;
  results: ListagemDesignacoesResponse[];
}

export interface Cessacao {
  id: number;
  numero_portaria: string;
  ano_vigente: string;
  sei_numero: string;
  a_pedido: boolean;
  remocao: boolean;
  aposentadoria: boolean;
  data_cessacao: string;
  doc: string;
  criado_em: string;
  status: StatusDesignacaoV2;
  ato_pai_id: number;
  apostilas: ApostilaRead[];
  insubsistencia: InsubsistenciaCessacaoRead | null;
}

export interface DesignacaoResponse {
  id: number;
  tipo: string;
  status: StatusDesignacaoV2;
  ato_pai_id: number | null;
  ato_raiz_id: number | null;
  impedimento_substituicao_detail: string | null;
  impedimento_substituicao: string | null;
  impedimento_display: string;
  tipo_vaga_display: string;
  cargo_vaga_display: string;
  dre_nome: string;
  unidade_proponente: string;
  dre: string;
  ue: string;
  funcionarios_da_unidade: string;
  codigo_hierarquico: string;
  indicado_nome_civil: string;
  indicado_nome_servidor: string;
  indicado_rf: string;
  indicado_vinculo: number;
  indicado_cargo_base: string;
  indicado_codigo_cargo_base: number;
  indicado_lotacao: string;
  indicado_cargo_sobreposto: string;
  indicado_codigo_cargo_sobreposto: number;
  indicado_local_exercicio: string;
  indicado_local_servico: string;
  titular_nome_civil: string;
  titular_nome_servidor: string;
  titular_rf: string;
  titular_vinculo: number;
  titular_cargo_base: string;
  titular_codigo_cargo_base: number;
  titular_lotacao: string;
  titular_cargo_sobreposto: string;
  titular_codigo_cargo_sobreposto: number;
  titular_local_exercicio: string;
  titular_local_servico: string;
  numero_portaria: string;
  ano_vigente: string;
  sei_numero: string;
  doc: string;
  data_inicio: string;
  data_fim: string | null;
  carater_excepcional: boolean;
  com_afastamento: boolean;
  possui_pendencia: boolean;
  pendencias: string;
  motivo_afastamento: string;
  informacoes_adicionais: string;
  detalhe_para_quadro_de_historico_por_ano: boolean;
  tipo_vaga: string;
  cargo_vaga: number;
  criado_em: string;
  cessacao: Cessacao | null;
  apostilas: ApostilaRead[];
  insubsistencia: InsubsistenciaRead | null;
}

export type CargoAPI = {
  codigoCargo: string;
  nomeCargo: string;
};

export type CargoSelect = {
  codigo: string;
  cargo: string;
};
