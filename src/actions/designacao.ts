"use server";

import {
  DesignacaoFiltros,
  PortariasDOFiltros,
  DesignacaoPaginada,
  ListagemPortariasResponse,
  ListagemDesignacoesResponse,
} from "@/types/designacao";
import { getApiClient } from "@/lib/api";
import { handleApiError } from "@/lib/api-error";


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
  console.log('params33', params);
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
    "/designacao/portarias/",
    filtros,
    "Erro ao buscar as dados para alterar a data do D.O"
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