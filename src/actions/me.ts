"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { User } from "@/stores/useUserStore";

type MeResult =
  | { success: true; data: User }
  | { success: false; error: string };

export async function getMeAction(): Promise<MeResult> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // cookies() agora é async
  const cookieStore = await cookies();

  try {
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return {
        success: false,
        error: "Usuário não autenticado. Token não encontrado.",
      };
    }

    const { data } = await axios.get<User>(`${API_URL}/usuario/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return { success: true, data };
  } catch (err) {
  if (axios.isAxiosError(err)) {
    console.error("AXIOS ERROR");
    console.error("STATUS:", err.response?.status);
    console.error("URL:", err.config?.url);
    console.error("RESPONSE:", err.response?.data);
  } else {
    console.error("ERRO DESCONHECIDO:", err);
  }

  return {
    success: false,
    error: "Erro ao buscar os dados do usuário",
  };
  }
}
