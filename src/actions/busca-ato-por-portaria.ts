"use server";

import { Cessacao, DesignacaoResponse } from "@/types/designacao";
import { InsubsistenciaRead } from "@/types/insubsistencia";
import { fetchWithClient } from "./http";

export interface BuscaPorPortariaRequest {
  portaria: string;
}

export const buscarDesignacaoPorPortariaAction = async (
  filtros: BuscaPorPortariaRequest
): Promise<
  | { success: true; data: DesignacaoResponse }
  | { success: false; error: string }
> => {
  return fetchWithClient<DesignacaoResponse>(
    "/designacao/v2/designacoes/buscar-por-portaria/",
    filtros,
    "Erro ao buscar a designação"
  );
};

export const buscarCessacaoPorPortariaAction = async (
  filtros: BuscaPorPortariaRequest
): Promise<
  | { success: true; data: Cessacao }
  | { success: false; error: string }
> => {
  return fetchWithClient<Cessacao>(
    "/designacao/v2/cessacoes/buscar-por-portaria/",
    filtros,
    "Erro ao buscar a cessação"
  );
};

export const buscarInsubsistenciaPorPortariaAction = async (
  filtros: BuscaPorPortariaRequest
): Promise<
  | { success: true; data: InsubsistenciaRead }
  | { success: false; error: string }
> => {
  return fetchWithClient<InsubsistenciaRead>(
    "/designacao/v2/insubsistencias/buscar-por-portaria/",
    filtros,
    "Erro ao buscar a insubsistência"
  );
};
