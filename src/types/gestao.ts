
export interface CargosBaseFiltros {
  grupamento?: string;  
  descricao_resumida?: string;
  descricao_completa?: string;
  situacao_funcional?: string;
  status?: string;
}

export interface CargosBasePaginada {
  count: number;
  next: string | null;
  previous: string | null;
  results: CargosBaseResponse[];
}

export interface CargosBaseResponse {
  id: number;
  nome: string;
}