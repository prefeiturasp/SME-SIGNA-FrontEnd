"use server";

import {
  PortariasDOFiltros,
  ListagemPortariasResponse,
  AtosAdministrativosPaginada,
  AtosAdministrativosFiltros,
} from "@/types/designacao";
import { ApostilaDetailRead } from "@/types/apostila";
import {
  DesignacaoHistorico,
  HistoricoDeDesignacoesFiltros,
} from "@/types/historico-designacoes";
import { fetchWithClient } from "./http";
import { CargoVigente } from "@/types/cargos";

export const fetchCargosVigentes = async (ue: string) => {
  return fetchWithClient<CargoVigente[]>(
    "/designacao/designacoes/cargos-vigentes/",
    { ue },
    "Erro ao buscar os cargos vigentes"
  );
};

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


export const fetchHistoricoDeDesignacoes = async (
  codigoUe: string,
  filtros: HistoricoDeDesignacoesFiltros = {}
): Promise<
  | { success: true; data: DesignacaoHistorico[] }
  | { success: false; error: string }
> => {
  return fetchWithClient<DesignacaoHistorico[]>(
    `/designacao/historico-de-designacoes/${encodeURIComponent(codigoUe)}/`,
    filtros,
    "Erro ao buscar o histórico de designações da unidade"
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


