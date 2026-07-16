"use server";

import {
  DesignacaoFiltros,
  PortariasDOFiltros,
  DesignacaoPaginada,
  ListagemPortariasResponse,
  ListagemDesignacoesResponse,
  AtosAdministrativosPaginada,
  AtosAdministrativosFiltros,
} from "@/types/designacao";
import { ApostilaDetailRead } from "@/types/apostila";
import { fetchWithClient } from "./http";

export const fetchDesignacoesAction = async (
  filtros: DesignacaoFiltros
): Promise<
  | { success: true; data: DesignacaoPaginada }
  | { success: false; error: string }
> => {
  return fetchWithClient<DesignacaoPaginada>(
    "/designacao/v2/designacoes/",
    filtros,
    "Erro ao buscar as designações"
  );
};



export const fetchPortariasDO = async (
  filtros: PortariasDOFiltros
): Promise<
  | { success: true; data: ListagemPortariasResponse[] }
  | { success: false; error: string }
> => {
  return fetchWithClient<ListagemPortariasResponse[]>(
    "/designacao/v2/portarias/",
    filtros,
    "Erro ao buscar as dados para alterar a data do D.O"
  );
};


export const fetchAtosAdministrativos = async (
  filtros: AtosAdministrativosFiltros
): Promise<
  | { success: true; data: AtosAdministrativosPaginada }
  | { success: false; error: string }
> => {
  console.log('filtros', filtros);
  return fetchWithClient<AtosAdministrativosPaginada>(
    "/designacao/atos-administrativos/",
    filtros,
    "Erro ao buscar os atos administrativos"
  );
};


export const fetchDesignacoesSemPaginacaoAction = async (
  filtros: DesignacaoFiltros
): Promise<
  | { success: true; data: ListagemDesignacoesResponse[] }
  | { success: false; error: string }
> => {
  return fetchWithClient<ListagemDesignacoesResponse[]>(
    "/designacao/v2/designacoes/",
    filtros,
    "Erro ao buscar as designações"
  );
};


export const fetchApostilasByIdAction = async (
  id: number
): Promise<
  | { success: true; data: ApostilaDetailRead }
  | { success: false; error: string }
> => {
  return fetchWithClient<ApostilaDetailRead>(
    `/designacao/v2/apostilas/${id}/`,
    {},
    "Erro ao buscar as apostilas"
  );
};




