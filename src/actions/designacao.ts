"use server";

import {
  DesignacaoFiltros,
  DesignacaoPaginada,
  ListagemDesignacoesResponse,
} from "@/types/designacao";
import { getApiClient } from "@/lib/api";
import { handleApiError } from "@/lib/api-error";


const sanitizeParams = (filtros: DesignacaoFiltros) => {
  return Object.fromEntries(
    Object.entries(filtros).filter(
      ([_, v]) => v !== "" && v !== undefined && v !== null
    )
  );
};


const fetchWithClient = async <T>(
  url: string,
  filtros: DesignacaoFiltros,
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
    "/designacao/designacoes/",
    filtros,
    "Erro ao buscar as designações"
  );
};


export const fetchDesignacoesSemPaginacaoAction = async (
  filtros: DesignacaoFiltros
): Promise<
  | { success: true; data: ListagemDesignacoesResponse[] }
  | { success: false; error: string }
> => {
  return fetchWithClient<ListagemDesignacoesResponse[]>(
    "/designacao/designacoes/",
    filtros,
    "Erro ao buscar as designações"
  );
};