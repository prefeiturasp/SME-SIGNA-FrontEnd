"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

type CessacaoErrorResponse = {
  detail?: string;
  field?: string;
  [key: string]: string | string[] | undefined;
};

type CessacaoResult =
  | { success: true; data: unknown }
  | { success: false; error: string; field?: string };

function extractErrorMessage(error: AxiosError<CessacaoErrorResponse>): string {
  if (error.response?.status === 500) return "Erro interno no servidor";

  const data = error.response?.data;
  if (data?.detail) return data.detail;

  if (data) {
    const firstValue = Object.values(data).find(Boolean);
    if (firstValue) {
      return Array.isArray(firstValue) ? firstValue[0] : String(firstValue);
    }
  }

  return error.message || "Erro ao salvar cessação";
}

export async function cessacaoAction(
  payload: any,
  id: string | null
): Promise<CessacaoResult> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  try {
    const request = id
      ? axios.patch(`${API_URL}/designacao/v2/cessacoes/${id}/`, payload, { headers })
      : axios.post(`${API_URL}/designacao/v2/cessacoes/`, payload, { headers });

    const { data } = await request;
    return { success: true, data };
  } catch (err) {
    const error = err as AxiosError<CessacaoErrorResponse>;

    console.log("Status:", error.response?.status);
    console.log("Response data:", JSON.stringify(error.response?.data, null, 2));

    return { success: false, error: extractErrorMessage(error), field: error.response?.data?.field };
  }
}