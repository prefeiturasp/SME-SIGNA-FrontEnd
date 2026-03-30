"use server";

import { DesignacaoResponse } from "@/types/designacao";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";



function getMessage(error: AxiosError<{ detail?: string }>) {
    let message = "Erro ao executar ação.";

    if (error.response?.status === 401) {
        message = "Não autorizado. Faça login novamente.";
    } else if (error.response?.status === 404) {
        message = "Designação não encontrada.";
    } else if (error.response?.status === 500) {
        message = "Erro interno no servidor.";
    } else if (error.response?.data?.detail) {
        message = error.response.data.detail;
    } else if (error.message) {
        message = error.message;
    }
    return message

}
export async function getDesignacaoByIdAction(id: number) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

   
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    try {
        const { data } = await axios.get<DesignacaoResponse>(`${API_URL}/designacao/designacoes/${id}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return { success: true, data:data };

    } catch (err) {

        const error = err as AxiosError<{ detail?: string }>;

        return { success: false, error: getMessage(error) };
    }
}
 

 
export const excluirDesignacao = async (
    id: number
): Promise<{ success: true } | { success: false; error: string }> => {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth_token")?.value;
        const API_URL = process.env.NEXT_PUBLIC_API_URL!;

        if (!authToken) {
            return {
                success: false,
                error: "Usuário não autenticado. Token não encontrado.",
            };
        }
        
        await axios.delete(`${API_URL}/designacao/designacoes/${id}/`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        return { success: true };
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        return { success: false, error: getMessage(error) };

    }
};
