"use server";

import axios, { AxiosError } from "axios";
import {
    EsqueciSenhaRequest,
    EsqueciSenhaErrorResponse,
    EsqueciSenhaSuccessResponse,
} from "@/types/esqueci-senha";

export type EsqueciSenhaResult =
    | {
          success: true;
          message: string;
      }
    | {
          success: false;
          error: string;
      };

export async function esqueciSenhaAction(
    username: EsqueciSenhaRequest
): Promise<EsqueciSenhaResult> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    try {
        const { data } = await axios.post<EsqueciSenhaSuccessResponse>(
            `${API_URL}/users/esqueci-senha`,
            username
        );
        return { success: true, message: data.detail };
    } catch (err) {
        const error = err as AxiosError<EsqueciSenhaErrorResponse>;
        let message = "Erro ao recuperar senha";
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
