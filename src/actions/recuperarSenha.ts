"use server";

import axios from "axios";

import { EsqueciSenhaPayload, RecuperarSenhaPayload } from "@/types/recuperarSenha";

export async function useRecuperarSenhaAction(payload: EsqueciSenhaPayload) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.exemplo.com";

  try {
    const resp = await axios.post(
      `${API_URL}/usuarios/esqueci-senha`,
      payload
    );

    if (resp.status !== 200) {
      return { success: false, error: resp.data.detail };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: "Erro ao fazer login. Verifique suas credenciais.",
    };
  }
}
