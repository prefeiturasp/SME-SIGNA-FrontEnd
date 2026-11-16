"use server";

import type { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";
import type { FormSchemaCriarTextosPortariaData } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import type { TipoCargo } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormCriarTextosPortaria";
import type { ActionResult } from "@/lib/serverRequest";
import { postWithAuth } from "@/lib/serverRequest";
import type { TextosDePortariasPaginada, TextosDePortariasResponse, Variavel } from "@/types/gestao";
import { fetchWithClient } from "./http";

type ResultadoDaBusca<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const MENSAGEM_ERRO_BUSCA_TEXTO = "Erro ao buscar os textos de portaria";

export const fetchTextosPortaria = async (
  filtros: filterFormSchemaTextosPortariaData,
  page?: number
): Promise<ResultadoDaBusca<TextosDePortariasPaginada>> =>
  fetchWithClient<TextosDePortariasPaginada>(
    "/gestao/modelos-portaria/",
    { ...filtros, page: page ?? 1 },
    MENSAGEM_ERRO_BUSCA_TEXTO
  );

export const cadastrarTextosPortariaAction = async (
  payload: FormSchemaCriarTextosPortariaData
): Promise<ActionResult> =>
  postWithAuth<FormSchemaCriarTextosPortariaData>(
    "/gestao/modelos-portaria/",
    payload,
    "Erro ao cadastrar o texto de portaria"
  );

export const fetchVariavelAction = async (
  tipoCargo: TipoCargo
): Promise<ResultadoDaBusca<Variavel[]>> =>
  fetchWithClient<Variavel[]>(
    "/gestao/modelos-portaria/variaveis/",
    { tipo_cargo: tipoCargo },
    "Erro ao buscar as variáveis"
  );

export const fetchTextoPortariaByIdAction = async (
  id: number
): Promise<ResultadoDaBusca<TextosDePortariasResponse>> =>
  fetchWithClient<TextosDePortariasResponse>(
    `/gestao/modelos-portaria/${id}/`,
    {},
    "Erro ao buscar o texto de portaria"
  );
