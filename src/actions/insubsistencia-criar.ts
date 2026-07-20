"use server";

import { InsubsistenciaBody } from "@/types/insubsistencia";
import { postWithAuth } from "@/lib/serverRequest";
import { InsubsistenciaDetailRead } from "@/types/apostila";
import { fetchWithClient } from "./http";

export async function insubsistenciaAction(payload: InsubsistenciaBody) {
  return postWithAuth(
    "/designacao/insubsistencias/",
    payload,
    "Erro ao salvar insubsistência"
  );
}


export const fetchInsubsistenciasByIdAction = async (
  id: number
): Promise<
  | { success: true; data: InsubsistenciaDetailRead }
  | { success: false; error: string }
> => {
  return fetchWithClient<InsubsistenciaDetailRead>(
    `/designacao/insubsistencias/${id}/`,
    {},
    "Erro ao buscar as insubsistencias"
  );
};
