"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { IConcursoType } from "@/types/cursos-e-titulos";
import { toAxiosError } from "@/lib/axios-error";

type MeResult =
  | { success: true; data: IConcursoType }
  | { success: false; error: string };

export async function getCursosETitulosAction(): Promise<MeResult> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;


  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) {
    return {
      success: false,
      error: "Usuário não autenticado. Token não encontrado.",
    };
  }
  try {
    const { data } = await axios.get<IConcursoType>(`${API_URL}/cursos-e-titulos`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return { success: true, data };
  } catch (err) {
    const error = toAxiosError<{ code?: string; detail?: string }>(err);
    const data = error.response?.data;
    const status = error.response?.status;

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

    if (error.message) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao buscar os cursos e títulos",
    };
  }

}
