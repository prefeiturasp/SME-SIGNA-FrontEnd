"use server";

import axios, { AxiosError } from "axios";
import type {
    CadastroRequest,
    CadastroErrorResponse,
    CadastroResult,
} from "@/types/cadastro";

export async function cadastroAction(
    dadosCadastro: CadastroRequest
): Promise<CadastroResult> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    try {
        await axios.post(`${API_URL}/users/registrar`, dadosCadastro, {
            withCredentials: true,
        });

        return { success: true };
    } catch (err) {
        const error = err as AxiosError<CadastroErrorResponse>;

        let message = "Erro na autenticação";
        let field: string | undefined;

        if (error.response?.status === 500) {
            message = "Erro interno no servidor";
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