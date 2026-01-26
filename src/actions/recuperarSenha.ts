"use server";

import axios from "axios";

import { EsqueciSenhaPayload } from "@/types/recuperarSenha";

export async function useRecuperarSenhaAction(payload: EsqueciSenhaPayload) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const resp = await axios.post(
      `${API_URL}/usuario/esqueci-senha`,
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
