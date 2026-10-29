const ROTAS_POR_TIPO: Record<string, string> = {
  DESIGNACAO: "listagem-designacoes/visualizar-designacao",
  CESSACAO: "visualizar-cessacao",
  APOSTILA: "visualizar-apostila",
  INSUBSISTENCIA: "visualizar-insubsistencia",
};

export const pathDetalhesDoAto = (ato: { id: number; tipo: string }): string | null => {
  const path = ROTAS_POR_TIPO[ato.tipo];

  if (!path) return null;

  return `/pages/${path}/${ato.id}`;
};
