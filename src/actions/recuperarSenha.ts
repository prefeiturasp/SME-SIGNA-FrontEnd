"use server";

import axios from "axios";
import { toAxiosError } from "@/lib/axios-error";

import { EsqueciSenhaPayload } from "@/types/recuperarSenha";
import { ErrorResponse } from "@/types/generic";

export async function useRecuperarSenhaAction(payload: EsqueciSenhaPayload) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL??'';

  try {
    const resp = await axios.post(
      `${API_URL}/usuario/esqueci-senha`,
      payload
    );

    if (resp.status !== 200) {
      return { success: false, error: resp.data.detail };
    }

    return { success: true, message: resp.data.detail };
  } catch (err  ) {
    const error = toAxiosError<ErrorResponse>(err);
    let message = "";
    
    if (error.response?.data?.detail) {
        message = error.response.data.detail;
    }
   
    return {
      success: false,
      error: message,
    };
  }
}
