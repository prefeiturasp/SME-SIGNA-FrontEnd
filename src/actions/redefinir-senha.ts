"use server";

import axios, { AxiosError } from "axios";
import type {
    RedefinirSenhaRequest,
    RedefinirSenhaErrorResponse,
    RedefinirSenhaResult,
} from "@/types/redefinir-senha";

export async function redefinirSenhaAction(
    dados: RedefinirSenhaRequest
): Promise<RedefinirSenhaResult> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    try {
        const formData = new FormData();
        formData.append("uid", dados.uid);
        formData.append("token", dados.token);
        formData.append("password", dados.password);
        formData.append("password2", dados.password2);
        await axios.post(`${API_URL}/users/redefinir-senha`, formData);
        return { success: true };
    } catch (err) {
        const error = err as AxiosError<RedefinirSenhaErrorResponse>;
        let message = "Erro ao redefinir senha";

        const data = error.response?.data;

        if (error.response?.status === 500) {
            message = "Erro interno no servidor";
        } else if (data?.errors?.non_field_errors?.length) {
            message = data.errors.non_field_errors[0];
        } else if (data?.detail) {
            message = data.detail;
        } else if (error.message) {
            message = error.message;
        }

        return { success: false, error: message };
    }
}
