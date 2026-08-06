
export interface CargosBaseFiltros {
  grupamento?: string;  
  descricao_resumida?: string;
  descricao_completa?: string;
  situacao_funcional?: string;
  status?: string;
  page?: number;

}


export interface CargosBaseCriarEditar {
  codigo_cargo_eol: string;
  grupamento: string;
  descricao_resumida: string;
  descricao_completa: string;
  situacao_funcional: string;
  status: string;
  utilizado_para_funcoes: boolean;
  utilizado_para_designacoes: boolean;
  utilizado_para_outros: boolean;
  utilizado_para_ste: boolean;
  utilizado_para_permutas: boolean;
  cargo_base_ficticio: boolean;
}

export interface CargosBasePaginada {
  count: number;
  next: string | null;
  previous: string | null;
  results: CargosBaseResponse[];
}

export interface CargosBaseResponse {
  id: number;
  grupamento: string;
  descricao_resumida: string;
  descricao_completa: string;
  situacao_funcional: string;
  usado_em_funcoes: boolean;
  usado_em_designacoes: boolean;
  usado_em_ste: boolean;
  usado_em_permutas: boolean;
  cargo_base_ficticio: boolean;  
  status: number;  
}