"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import {
  LoginRequest,
  LoginSuccessResponse,
  LoginErrorResponse,
} from "@/types/login";

type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction({
  seu_rf,
  senha,
}: LoginRequest): Promise<LoginResult> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  try {
    const { data } = await axios.post<LoginSuccessResponse>(
      `${API_URL}/usuario/login`,
      {
        username: seu_rf,
        password: senha,
      }
    );
    
    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
    });
    
    return { success: true };

   } catch (err) {
    const error = err as AxiosError<LoginErrorResponse>;

    let message = "Erro na autenticação";

    if (error.response?.status === 500) {
      message = "Erro interno no servidor";
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.message) {
      message = error.message;
    }

    return { success: false, error: message };
  }
}


