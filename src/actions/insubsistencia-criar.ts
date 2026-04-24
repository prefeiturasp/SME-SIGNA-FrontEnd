"use server";

import { InsubsistenciaBody } from "@/types/insubsistencia";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

type InsubsistenciaErrorResponse = {
  detail?: string;
  field?: string;
};

type InsubsistenciaResult =
  | { success: true; data: unknown }
  | { success: false; error: string; field?: string };

export async function insubsistenciaAction(
  payload: InsubsistenciaBody,
): Promise<InsubsistenciaResult> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

      console.log('payload', payload);
      const response = await axios.post(
        `${API_URL}/designacao/insubsistencias/`,
        payload,
        { headers }
      );
      const data = response.data;
    

    return { success: true, data };
  } catch (err) {
    const error = err as AxiosError<InsubsistenciaErrorResponse>;
    let message = "Erro ao salvar insubsistência";    
 
    if (error.response?.status === 500) {
      message = "Erro interno no servidor";
    } else if (error?.response?.data?.detail?.includes("string")) {
      const regex = /string='(.*?)'/;
      const match = regex.exec(error?.response?.data?.detail);
      message = match?.[1] ?? '';
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.message) {
      message = error.message;
    }

    const field = error.response?.data?.field;

    return { success: false, error: message, field };
  }
}