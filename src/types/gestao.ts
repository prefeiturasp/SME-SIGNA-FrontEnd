
export interface CargosBaseFiltros {
  grupamento?: string;  
  descricao_resumida?: string;
  descricao_completa?: string;
  situacao_funcional?: string;
  status?: string;
  page?: number;

}

export enum StatusCargosBase {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  EXTINTO = 'EXTINTO',
}


export interface CargosBasePaginada {
  count: number;
  next: string | null;
  previous: string | null;
  results: CargosBaseResponse[];
}

export interface TextosDePortariasPaginada {
  count: number;
  next: string | null;
  previous: string | null;
  results: TextosDePortariasResponse[];
}


export interface CargosBaseCamposComuns {
  grupamento: string;
  descricao_resumida: string;
  descricao_completa: string;
  situacao_funcional: string;
  utilizado_para_funcoes: boolean;
  utilizado_para_designacoes: boolean;
  utilizado_para_ste: boolean;
  utilizado_para_permutas: boolean;
  cargo_base_ficticio: boolean;
  testar_laudo: boolean;
  status: string;
  pesquisar_licencas_no_sigpec: boolean;
  quantidade_maxima_de_dias_de_licenca?: string;
}

export interface CargosBaseResponse extends CargosBaseCamposComuns {
  id: number;
}

export interface CargosBaseCriarEditar extends CargosBaseCamposComuns {
  codigo_cargo: string;
}

export interface TextosDePortariasResponse {
  id: number;
  tipo_ato_pai: string;
  tipo_portaria: string;
  tipo_de_ato: string;
  nome_modelo: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
  texto_portaria: string;
  variaveis: string[];
  tipo_cargo: string;
  observacoes: string;
}


export interface Variavel {  
  display_name: string;
  value: string;
}
