"use server";

import { ICargoType } from "@/types/cargos";

import { fetchWithClient } from "./http";
import { postWithAuth } from "@/lib/serverRequest";
import { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
 

export async function criarCargosBaseAction(payload: createFormSchemaCargosBaseData) {
  return postWithAuth(
    "/gestao/cargos-base/",
    payload,
    "Erro ao criar cargo base"
  );
}

export const fetchCargosBaseAction = async (
): Promise<
  | { success: true; data: ICargoType[] }
  | { success: false; error: string }
> => {
  return fetchWithClient<ICargoType[]>(
    `/gestao/cargos-eol/`,
    {},
    "Erro ao buscar as insubsistencias"
  );
};
