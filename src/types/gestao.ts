
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
  status: string;
}

export interface CargosBaseResponse extends CargosBaseCamposComuns {
  id: number;
}

export interface CargosBaseCriarEditar extends CargosBaseCamposComuns {
  codigo_cargo: string;
}
