"use server";

import { ApostilaBody, ApostilaDetailRead } from "@/types/apostila";
import { postWithAuth } from "@/lib/serverRequest";
import { fetchWithClient } from "./http";

export async function ApostilaAction(payload: ApostilaBody) {
  return postWithAuth(
    "/designacao/apostilas/",
    payload,
    "Erro ao salvar apostila"
  );
}

export const fetchApostilaByIdAction = async (
  id: number
): Promise<
  | { success: true; data: ApostilaDetailRead }
  | { success: false; error: string }
> => {
  return fetchWithClient<ApostilaDetailRead>(
    `/designacao/apostilas/${id}/`,
    {},
    "Erro ao buscar as apostilas"
  );
};
