"use server";

import {
  PortariasDOFiltros,
  ListagemPortariasResponse,
  AtosAdministrativosPaginada,
  AtosAdministrativosFiltros,
} from "@/types/designacao";
import { ApostilaDetailRead } from "@/types/apostila";
import { fetchWithClient } from "./http";

export const fetchPortariasDO = async (
  filtros: PortariasDOFiltros
): Promise<
  | { success: true; data: ListagemPortariasResponse[] }
  | { success: false; error: string }
> => {
  return fetchWithClient<ListagemPortariasResponse[]>(
    "/designacao/portarias/",
    filtros,
    "Erro ao buscar as dados para alterar a data do D.O"
  );
};


export const fetchAtosAdministrativos = async (
  filtros: AtosAdministrativosFiltros
): Promise<
  | { success: true; data: AtosAdministrativosPaginada }
  | { success: false; error: string }
> => {
  return fetchWithClient<AtosAdministrativosPaginada>(
    "/designacao/atos-administrativos/",
    filtros,
    "Erro ao buscar os atos administrativos"
  );
};


export const fetchApostilasByIdAction = async (
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




