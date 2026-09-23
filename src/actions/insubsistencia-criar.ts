"use server";

import { InsubsistenciaBody, InsubsistenciaRead } from "@/types/insubsistencia";
import { patchWithAuth, postWithAuth } from "@/lib/serverRequest";

import { fetchWithClient } from "./http";

export async function insubsistenciaAction(
  payload: InsubsistenciaBody,
  id?: number | null
) {
  if (id) {
    return patchWithAuth(
      `/designacao/insubsistencias/${id}/`,
      payload,
      "Erro ao salvar insubsistência"
    );
  }

  return postWithAuth(
    "/designacao/insubsistencias/",
    payload,
    "Erro ao salvar insubsistência"
  );
}


export const fetchInsubsistenciasByIdAction = async (
  id: number
): Promise<
  | { success: true; data: InsubsistenciaRead }
  | { success: false; error: string }
> => {
  return fetchWithClient<InsubsistenciaRead>(
    `/designacao/insubsistencias/${id}/`,
    {},
    "Erro ao buscar as insubsistencias"
  );
};
