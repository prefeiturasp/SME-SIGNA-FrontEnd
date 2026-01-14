"use server";

import { BuscaServidorDesignacaoResponse } from "@/types/busca-servidor-designacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
 
 

export const getServidorDesignacaoAction = async (designacaoRequest: BuscaDesignacaoRequest): Promise<
    | { success: true; data: BuscaServidorDesignacaoResponse }
    | { success: false; error: string }
> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    //const API_URL = process.env.NEXT_PUBLIC_API_URL !;
    const API_URL = "http://localhost:4000/";
    if (!token) {
        return { success: false, error: "Usuário não autenticado" };
    }

    try {
        const { data } = await axios.get<BuscaServidorDesignacaoResponse>(
            `${API_URL}/servidorDesignacao/?rf=${designacaoRequest.rf}&nome_do_servidor=${designacaoRequest.nome_do_servidor || ''}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return { success: true, data };
    } catch (err) {
        console.log("err", err);
        const error = err as AxiosError<{ detail?: string }>;
        let message = "Erro ao buscar as Servidor";

        if (error.response?.status === 401) {
            message = "Não autorizado. Faça login novamente.";
        } else if (error.response?.status === 400) {
            message = "Servidor não encontrados";
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
