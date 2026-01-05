"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { User } from "@/stores/useUserStore";

type MeResult =
  | { success: true; data: User }
  | { success: false; error: string };

export async function getMeAction(): Promise<MeResult> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  try {
    const cookieStore = await cookies();
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
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const data = err.response?.data as {
        code?: string;
        detail?: string;
      };

      if (status === 401 || data?.code === "token_not_valid") {
        const cookieStore = await cookies();
        cookieStore.delete("auth_token");
      }

      if (status === 500) {
        return {
          success: false,
          error: "Erro interno no servidor",
        };
      }

      if (data?.detail) {
        return {
          success: false,
          error: data.detail,
        };
      }

      if (err.message) {
        return {
          success: false,
          error: err.message,
        };
      }
    }

    return {
      success: false,
      error: "Erro ao buscar os dados do usuário",
    };
  }

}
