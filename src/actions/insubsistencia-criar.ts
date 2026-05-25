"use server";

import { InsubsistenciaBody } from "@/types/insubsistencia";
import { postWithAuth } from "@/lib/serverRequest";

export async function insubsistenciaAction(payload: InsubsistenciaBody) {
  return postWithAuth(
    "/designacao/v2/insubsistencias/",
    payload,
    "Erro ao salvar insubsistência"
  );
}