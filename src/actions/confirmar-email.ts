"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import type {
    ConfirmarEmailRequest,
    ConfirmarEmailErrorResponse,
    ConfirmarEmailResult,
} from "@/types/confirmar-email";

export async function confirmarEmailAction(
    code: ConfirmarEmailRequest
): Promise<ConfirmarEmailResult> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    try {
        const cookieStore = cookies();
        const authToken = cookieStore.get("auth_token")?.value;

        if (!authToken) {
            return {
                success: false,
                error: "Usuário não autenticado. Token não encontrado.",
            };
        }

        const response = await axios.put(
            `${API_URL}/alteracao-email/validar/${code.code}/`,
            null,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        return { success: true, new_mail: response.data.email };
    } catch (err) {
        const error = err as AxiosError<ConfirmarEmailErrorResponse>;

        let message = "Ocorreu um erro ao tentar confirmar seu Email.";
        let field: string | undefined;

        if (error.response?.status === 401) {
            message = "Sua sessão expirou. Por favor, faça login novamente.";
        } else if (error.response?.status === 500) {
            message = "Erro interno no servidor. Tente novamente mais tarde.";
        } else if (error.response?.data?.detail) {
            message = error.response.data.detail;
        } else if (error.message) {
            message = error.message;
        }

        if (error.response?.data?.field) {
            field = error.response.data.field;
        }

        return { success: false, error: message, field };
    }
}
