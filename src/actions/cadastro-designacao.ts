"use server";

import axios, { AxiosError } from "axios";
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

export async function designacaoAction(
    formData: FormDesignacaoEServidorIndicado | null
): Promise<DesignacaoResult> {
    if (!formData) {
        return { success: false, error: "Dados do formulário ausentes." };
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const payload = mapearPayloadDesignacao(formData);

    console.log(payload)

    try {
        const { data } = await axios.post(
            `${API_URL}/designacao/designacoes/`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
            }
        );

        return { success: true, data };
    } catch (err) {
        const error = err as AxiosError<DesignacaoErrorResponse>;

        console.log("Status:", error.response?.status);
        console.log("Response data:", JSON.stringify(error.response?.data, null, 2));

        let message = "Erro ao salvar designação";

        if (error.response?.status === 500) {
            message = "Erro interno no servidor";
        } else if (error.response?.data?.detail) {
            message = error.response.data.detail;
        } else if (error.message) {
            message = error.message;
        }

        const field = error.response?.data?.field;

        return { success: false, error: message, field };
    }
}