"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import type {
    AtualizarEmailRequest,
    AtualizarEmailErrorResponse,
    AtualizarEmailResult,
} from "@/types/atualizar-email";

export async function atualizarEmailAction(
    dados: AtualizarEmailRequest
): Promise<AtualizarEmailResult> {
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

        await axios.post(`${API_URL}/alteracao-email/solicitar/`, dados, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        return { success: true };
    } catch (err) {
        const error = err as AxiosError<AtualizarEmailErrorResponse>;

        let message = "Ocorreu um erro ao tentar atualizar seu Email.";
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
