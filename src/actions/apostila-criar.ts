"use server";

import { ApostilaBody } from "@/types/apostila";
import { postWithAuth } from "@/lib/serverRequest";

export async function ApostilaAction(payload: ApostilaBody) {
  return postWithAuth(
    "/designacao/apostilas/",
    payload,
    "Erro ao salvar apostila"
  );
}