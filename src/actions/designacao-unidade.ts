"use server";

import axios, { AxiosError } from "axios";
import { DesignacaoUnidadeResponse, DesignacaoUnidadeResult } from "@/types/designacao-unidade"; 
import { ErrorResponse } from "@/types/generic";
import { cookies } from "next/headers";

export async function getDesignacaoUnidadeAction(codigo_ue:string): Promise<DesignacaoUnidadeResult> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
  
    try {
        const { data } = await axios.get<DesignacaoUnidadeResponse>(`${API_URL}/designacao/unidade`, {
            params: { codigo_ue },
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
        });
        return { success: true, data: data };

    } catch (err) {
        const error = err as AxiosError<ErrorResponse>;
    
        let message = "Erro na autenticação";
    
        if (error.response?.status === 500) {
          message = "Erro interno no servidor";
        } else if (error.response?.data?.detail) {
          message = error.response.data.detail;
        } else if (error.message) {
          message = error.message;
        }
    
        return { success: false, error: message };
    }
}

 