"use server";

import { ICargoType } from "@/types/cargos";

import { fetchWithClient } from "./http";
import { postWithAuth, patchWithAuth } from "@/lib/serverRequest";
import { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import { CargosBaseResponse } from "@/types/gestao";
 

export async function criarCargosBaseAction(payload: createFormSchemaCargosBaseData) {
  return postWithAuth(
    "/gestao/cargos-base/",
    payload,
    "Erro ao criar cargo base"
  );
}

export async function editarCargosBaseAction(id: number, payload: createFormSchemaCargosBaseData) {
  return patchWithAuth(
    `/gestao/cargos-base/${id}/`,
    payload,
    "Erro ao editar cargo base"
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

export async function fetchCargosBaseActionByIdAction(id: number) {
  return fetchWithClient<CargosBaseResponse>(
    `/gestao/cargos-base/${id}/`,
    {},
    "Erro ao buscar o cargo base"
  );
}