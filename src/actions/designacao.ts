"use server";

import { DesignacaoFiltros, DesignacaoPaginada } from "@/types/designacao";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

export const fetchDesignacoesAction = async (
  filtros: DesignacaoFiltros
): Promise<
  | { success: true; data: DesignacaoPaginada }
  | { success: false; error: string }
> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL !;

  if (!token) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const params = Object.fromEntries(
    Object.entries(filtros).filter(
      ([_, v]) => v !== "" && v !== undefined && v !== null
    )
  );

  try {
    const { data } = await axios.get<DesignacaoPaginada>(
      `${API_URL}/designacao/designacoes/`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, data };
  } catch (err) {
    console.log("err", err);
    const error = err as AxiosError<{ detail?: string }>;
    let message = "Erro ao buscar as designações";

    if (error.response?.status === 401) {
      message = "Não autorizado. Faça login novamente.";
    } else if (error.response?.status === 400) {
      message = "Parâmetros inválidos";
    } else if (error.response?.status === 500) {
      message = "Erro interno no servidor";
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.message) {
      message = error.message;
    }

    return { success: false, error: message };
  }
};