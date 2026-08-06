"use server";
import { fetchWithClient } from "./http";
import { CargosBaseFiltros, CargosBasePaginada } from "@/types/gestao";

  

export const fetchCargosBase = async (
  filtros: CargosBaseFiltros
): Promise<
  | { success: true; data: CargosBasePaginada }
  | { success: false; error: string }
> => {
  return fetchWithClient<CargosBasePaginada>(
    "/gestao/cargos-bases/",
    filtros,
    "Erro ao buscar os cargos base"
  );
};

