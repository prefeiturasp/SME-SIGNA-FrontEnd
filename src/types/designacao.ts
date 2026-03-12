export interface BuscaDesignacaoRequest {
  rf: string;
}

export interface Servidor {
  nome_civil?: string;
  rf?: string;
  vinculo?: number;
  cargo_base?: string;
  lotacao?: string;
}

export interface Titular {
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

  codigo_estrutura_hierarquica?: string;

  tipo_cargo?: "vago" | "substituicao" | "disponivel";

  cargo_vago_selecionado?: string;

  a_partir_de?: string | Date;
  designacao_data_final?: string | Date;

  motivo_substituicao?: string;
  motivo_cancelamento?: string;

  impedimento_substituicao?: string;

  servidorIndicado?: Servidor;
  dadosTitular?: Titular | null;
}