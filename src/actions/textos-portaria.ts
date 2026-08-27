"use server";
import { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";
import { fetchWithClient } from "./http";
import { TextosDePortariasPaginada, TextosDePortariasResponse, Variavel } from "@/types/gestao";
import { FormSchemaCriarTextosPortariaData } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { postWithAuth } from "@/lib/serverRequest";

  



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


export const cadastrarTextosPortariaAction = async (payload: FormSchemaCriarTextosPortariaData) => {
  return postWithAuth(
    "/gestao/modelos-portaria/",
    payload,
    "Erro ao cadastrar o texto de portaria"
  );
};



export const fetchVariavelAction = async (
): Promise<
  | { success: true; data: Variavel[] }
  | { success: false; error: string }
> => {
  return fetchWithClient<Variavel[]>(
    "/gestao/modelos-portaria/variaveis/",
    {},
    "Erro ao buscar as variáveis"
  );
};



export async function fetchTextoPortariaByIdAction(id: number) {
  return fetchWithClient<TextosDePortariasResponse>(
    `/gestao/modelos-portaria/${id}/`,
    {},
    "Erro ao buscar o cargo base"
  );
}
