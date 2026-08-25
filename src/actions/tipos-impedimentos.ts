"use server";

import axios from "axios";
import { toAxiosError } from "@/lib/axios-error";
import { cookies } from "next/headers";
import { Impedimento } from "@/types/impedimento";

export const getImpedimentosAction = async (): Promise<
  | { success: true; data: Impedimento[] }
  | { success: false; error: string }
> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!token) {
    return { success: false, error: "Usuário não autenticado" };
  }

  try {
    const { data } = await axios.get<Impedimento[]>(
      `${API_URL}/designacao/designacoes/impedimentos/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    

    return { success: true, data };
  } catch (err) {
    const error = toAxiosError<{ detail?: string }>(err);

    let message = "Erro ao buscar impedimentos";

    if (error.response?.status === 401) {
      message = "Não autorizado. Faça login novamente.";
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    }

    return { success: false, error: message };
  }
};