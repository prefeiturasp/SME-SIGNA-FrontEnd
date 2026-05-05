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
  console.log("payload", payload);

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

    const response = await axios.post(`${API_URL}${url}`, payload, {
      headers,
    });

    return { success: true, data: response.data };
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;

    let message = defaultErrorMessage;

    if (error.response?.status === 500) {
      message = "Erro interno no servidor";
    } else if (error.response?.data?.detail?.includes("string")) {
      const regex = /string='(.*?)'/;
      const match = regex.exec(error.response.data.detail);
      message = match?.[1] ?? "";
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      error: message,
      field: error.response?.data?.field,
    };
  }
}