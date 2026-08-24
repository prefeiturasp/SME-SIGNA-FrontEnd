"use server";
import { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";
import { fetchWithClient } from "./http";
import { TextosDePortariasPaginada } from "@/types/gestao";

  

export const fetchTextosPortaria = async (
  filtros: filterFormSchemaTextosPortariaData,
  page?: number
): Promise<
  | { success: true; data: TextosDePortariasPaginada }
  | { success: false; error: string }
> => {
  return fetchWithClient<TextosDePortariasPaginada>(
    "/gestao/modelos-portaria/",
    { ...filtros, page: page ?? 1 },
    "Erro ao buscar os textos de portaria"
  );
};

