"use server";

import { ApostilaBody } from "@/types/apostila";
import { patchWithAuth, postWithAuth } from "@/lib/serverRequest";

export async function ApostilaAction(payload: ApostilaBody) {
  if(payload.id) {
    return patchWithAuth(
      `/designacao/apostilas/${payload.id}/`,
      payload,
      "Erro ao salvar apostila"
    );
  }
  return postWithAuth(
    "/designacao/apostilas/",
    payload,
    "Erro ao salvar apostila"
  );
}