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
import { getApiClient } from "@/lib/api";
import { handleApiError } from "@/lib/api-error";
import { ApostilaDetailRead } from "@/types/apostila";


const sanitizeParams = (filtros: DesignacaoFiltros|PortariasDOFiltros) => {
  return Object.fromEntries(
    Object.entries(filtros).filter(
      ([_, v]) => v !== "" && v !== undefined && v !== null
    )
  );
};


const fetchWithClient = async <T>(
  url: string,
  filtros: DesignacaoFiltros|PortariasDOFiltros,
  errorMessage: string
): Promise<{ success: true; data: T } | { success: false; error: string }> => {
  const apiClient = await getApiClient();

  if (!apiClient) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const params = sanitizeParams(filtros);
  try {
    const { data } = await apiClient.get<T>(url, { params });
    return { success: true, data };
  } catch (err) {
    const message = handleApiError(err, errorMessage);
    return { success: false, error: message };
  }
};


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




export const fetchInsubsistenciasByIdAction = async (
  id: number
): Promise<
  | { success: true; data: ApostilaDetailRead }
  | { success: false; error: string }
> => {
  return fetchWithClient<ApostilaDetailRead>(
    `/designacao/v2/insubsistencias/${id}/`,
    {},
    "Erro ao buscar as insubsistencias"
  );
};
