"use server";

import { InsubsistenciaBody } from "@/types/insubsistencia";
import { postWithAuth } from "@/lib/serverRequest";
import { ApostilaDetailRead } from "@/types/apostila";
import { fetchWithClient } from "./designacao";

export async function insubsistenciaAction(payload: InsubsistenciaBody) {
  return postWithAuth(
    "/designacao/v2/insubsistencias/",
    payload,
    "Erro ao salvar insubsistência"
  );
}


export const fetchInsubsistenciasByIdAction = async (
  id: number
): Promise<
  | { success: true; data: ApostilaDetailRead }
  | { success: false; error: string }
> => {
  return fetchWithClient<ApostilaDetailRead>(
    `/designacao/v2/insubsistencias/${id}/`,
    {},
    "Erro ao buscar as insubsistencias"
  );
};
