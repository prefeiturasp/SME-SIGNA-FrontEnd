// src/actions/fetchDesignacoesAction.ts
"use server";

import { DesignacaoFiltros, DesignacaoPaginada } from "@/types/designacao";
import { getApiClient } from "@/lib/api";
import { handleApiError } from "@/lib/api-error";

export const fetchDesignacoesAction = async (
  filtros: DesignacaoFiltros
): Promise<
  | { success: true; data: DesignacaoPaginada }
  | { success: false; error: string }
> => {
  const apiClient = await getApiClient();

  if (!apiClient) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Filtra parâmetros vazios
  const params = Object.fromEntries(
    Object.entries(filtros).filter(
      ([_, v]) => v !== "" && v !== undefined && v !== null
    )
  );

  try {
    const { data } = await apiClient.get<DesignacaoPaginada>(
      "/designacao/designacoes/",
      { params }
    );
    return { success: true, data };
  } catch (err) {
    const message = handleApiError(err, "Erro ao buscar as designações");
    return { success: false, error: message };
  }
};