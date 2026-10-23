"use server";

import axios from "axios";
import { toAxiosError } from "@/lib/axios-error";
import { UnidadeCadastrada, UnidadesCadastradasResult } from "@/types/designacao-unidade";
import { ErrorResponse } from "@/types/generic";
import { cookies } from "next/headers";

export async function getUnidadesCadastradasAction(): Promise<UnidadesCadastradasResult> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    try {
        const { data } = await axios.get<UnidadeCadastrada[]>(`${API_URL}/designacao/unidade/cadastradas/`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
        });
        return { success: true, data };

    } catch (err) {
        const error = toAxiosError<ErrorResponse>(err);

        let message = "Não foi possível buscar as unidades cadastradas";

        if (error.response?.status === 500) {
          message = "Erro interno no servidor";
        } else if (error.response?.data?.detail) {
          message = error.response.data.detail;
        }

        return { success: false, error: message };
    }
}
