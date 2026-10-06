"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { toAxiosError } from "@/lib/axios-error";

type ErrorResponse = {
  detail?: string;
  field?: string;
  [key: string]: string | string[] | undefined;
};

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string };

function primeiraMensagem(valor: unknown): string | undefined {
  if (typeof valor === "string") return valor || undefined;
  if (Array.isArray(valor)) {
    for (const item of valor) {
      const msg = primeiraMensagem(item);
      if (msg) return msg;
    }
    return undefined;
  }
  if (valor && typeof valor === "object") {
    return primeiraMensagem(Object.values(valor));
  }
  return undefined;
}

function extractErrorMessage(
  error: AxiosError<ErrorResponse>,
  defaultMessage: string
): Extract<ActionResult, { success: false }> {
  if (error.response?.status === 500) {
    return { success: false, error: "Erro interno no servidor" };
  }

  const data = error.response?.data;
  if (data?.detail) return { success: false, error: data.detail, field: data.field };

  if (data) {
    const msg = primeiraMensagem(data);
    if (msg) return { success: false, error: msg };
  }

  return { success: false, error: error.message || defaultMessage };
}

export async function postWithAuth<TPayload, TResponse = unknown>(
  url: string,
  payload: TPayload,
  defaultErrorMessage = "Erro ao salvar"
): Promise<ActionResult<TResponse>> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  try {
    const response = await axios.post<TResponse>(`${API_URL}${url}`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    return { success: true, data: response.data };
  } catch (err) {
    const error = toAxiosError<ErrorResponse>(err);
    return extractErrorMessage(error, defaultErrorMessage);
  }
}
export async function patchWithAuth<TPayload, TResponse = unknown>(
  url: string,
  payload: TPayload,
  defaultErrorMessage = "Erro ao salvar"
): Promise<ActionResult<TResponse>> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  try {
    const response = await axios.patch<TResponse>(`${API_URL}${url}`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    return { success: true, data: response.data };
  } catch (err) {
    const error = toAxiosError<ErrorResponse>(err);
    return extractErrorMessage(error, defaultErrorMessage);
  }
}
