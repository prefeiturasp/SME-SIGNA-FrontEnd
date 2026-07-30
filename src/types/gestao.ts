
export interface CargosBaseFiltros {
  grupamento?: string;  
  descricao_resumida?: string;
  descricao_completa?: string;
  situacao_funcional?: string;
  status?: string;
  page?: number;

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