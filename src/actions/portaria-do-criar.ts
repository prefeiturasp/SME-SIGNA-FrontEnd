"use server";

import { postWithAuth } from "@/lib/serverRequest";
import { PortariasDOBody } from "@/types/designacao";

export async function PortariaDOAction(payload: PortariasDOBody) {
  return postWithAuth(
    "/designacao/v2/portarias/atualizar-data-publicacao/",
    payload,
    "Erro ao salvar portaria D.O"
  );
}