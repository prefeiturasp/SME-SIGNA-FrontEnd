"use server";

import axios from "axios";
import { toAxiosError } from "@/lib/axios-error";
import { cookies } from "next/headers";
import { mapearPayloadDesignacao } from "@/utils/designacao/mapearPayload";
import { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";

type DesignacaoErrorResponse = {
    detail?: string;
    field?: string;
};

type DesignacaoResult =
    | { success: true; data: unknown }
    | { success: false; error: string; field?: string };

// O backend retorna `detail` já formatado como "campo_snake_case: mensagem"
// (várias ocorrências separadas por "; "). Aqui só humanizamos o nome do
// campo (snake_case → "Primeira palavra minúsculas") para exibição na UI.
function humanizarDetail(detail: string): string {
    return detail
        .split("; ")
        .map((parte) => {
            const idx = parte.indexOf(":");
            if (idx === -1) return parte;

            const campo = parte.slice(0, idx);
            if (!/^[a-z0-9_]+$/.test(campo)) return parte;

            const resto = parte.slice(idx + 1).trimStart();
            const label = campo.replaceAll("_", " ");

            return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${resto}`;
        })
        .join("; ");
}

export async function designacaoAction(
    formData: FormDesignacaoEServidorIndicado | null,
    id: string | null
): Promise<DesignacaoResult> {
    if (!formData) {
        return { success: false, error: "Dados do formulário ausentes." };
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    const payload = mapearPayloadDesignacao(formData);
     try {
         const headers = {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        };      
          
          let data;
          
          if (id) {            
            
            const response = await axios.patch(
              `${API_URL}/designacao/designacoes/${id}/`,
              payload,
              { headers }
            );
            data = response.data;
          } else {
            const response = await axios.post(
              `${API_URL}/designacao/designacoes/`,
              payload,
              { headers }
            );
            data = response.data;
          }
          
          
        return { success: true,  data };
    } catch (err) {
        const error = toAxiosError<DesignacaoErrorResponse>(err);

        let message = "Erro ao salvar designação";

        if (error.response?.status === 500) {
            message = "Erro interno no servidor";
        } else if (error.response?.data?.detail) {
            message = humanizarDetail(error.response.data.detail);
        } else if (error.message) {
            message = error.message;
        }

        const field = error.response?.data?.field;

        return { success: false, error: message, field };
    }
}