"use server";

import { InsubsistenciaBody } from "@/types/insubsistencia";
import { postWithAuth } from "@/lib/serverRequest";
import { fetchWithClient } from "./http";
import {  CessacaoByIdResponse } from "@/types/designacao";

export async function insubsistenciaAction(payload: InsubsistenciaBody) {
  return postWithAuth(
    "/designacao/v2/cessacoes/",
    payload,
    "Erro ao salvar cessacão"
  );
}


export const fetchCessacaoByIdAction = async (
  id: number
): Promise<
  | { success: true; data: CessacaoByIdResponse }
  | { success: false; error: string }
> => {
  return fetchWithClient<CessacaoByIdResponse>(
    `/designacao/v2/cessacoes/${id}/`,
    {},
    "Erro ao buscar as cessacões"
  );
};
