"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

type ErrorResponse = {
  detail?: string;
  field?: string;
};

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string };

export async function postWithAuth<TPayload, TResponse = unknown>(
  url: string,
  payload: TPayload,
  defaultErrorMessage = "Erro ao salvar"
): Promise<ActionResult<TResponse>> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  try {
    const response = await axios.post(`${API_URL}${url}`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    return { success: true, data: response.data };
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    
    if (error.response?.data?.detail) {
      return {
        success: false,
        error: error.response.data.detail,
        field: error.response.data.field,
      };
    }

    if (error.response?.status === 500) {
      return { success: false, error: "Erro interno no servidor" };
    }

    return {
      success: false,
      error: error.message || defaultErrorMessage,
    };
  }
}