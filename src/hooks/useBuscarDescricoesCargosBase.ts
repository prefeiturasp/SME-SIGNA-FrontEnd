import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCargosBase } from "@/actions/gestao";
import {
    type CodigoCargo,
    type DescricoesCargosBase,
    normalizarCodigoCargo,
} from "@/utils/portarias/cargoIndicado";

export const CHAVE_DESCRICAO_CARGO_BASE = "descricao-cargo-base";

const CINCO_MINUTOS = 5 * 60 * 1000;

export const MENSAGEM_ERRO_DESCRICOES_CARGOS =
    "Não foi possível consultar os cargos em Gestão de cargos base. A portaria não foi gerada.";

// `null` quando o código não está cadastrado. Falha da consulta lança erro:
// "não cadastrado" e "não foi possível consultar" não podem se confundir.
async function buscarDescricaoCargoBase(codigo: string): Promise<string | null> {
    const response = await fetchCargosBase({ codigo_cargo: codigo });
    if (!response.success) throw new Error(response.error);

    const { results } = response.data;
    const cargo = results.find((item) => normalizarCodigoCargo(item.codigo_cargo) === codigo);
    // Resultado sem o código pedido: o filtro não foi aplicado, então não dá para afirmar nada.
    if (!cargo && results.length > 0) {
        throw new Error(`A busca do cargo ${codigo} retornou outros cargos.`);
    }
    return cargo?.descricao_completa ?? null;
}

/**
 * Busca a `descricao_completa` dos códigos informados, em paralelo e sem
 * repetir códigos, com cache por código. Lança erro se alguma consulta falhar.
 */
export function useBuscarDescricoesCargosBase() {
    const queryClient = useQueryClient();

    return useCallback(
        async (codigos: CodigoCargo[]): Promise<DescricoesCargosBase> => {
            const unicos = [
                ...new Set(codigos.map(normalizarCodigoCargo).filter((codigo) => codigo !== null)),
            ];

            const pares = await Promise.all(
                unicos.map(
                    async (codigo) =>
                        [
                            codigo,
                            await queryClient.fetchQuery({
                                queryKey: [CHAVE_DESCRICAO_CARGO_BASE, codigo],
                                queryFn: () => buscarDescricaoCargoBase(codigo),
                                staleTime: CINCO_MINUTOS,
                                retry: false,
                            }),
                        ] as const
                )
            );

            return Object.fromEntries(pares);
        },
        [queryClient]
    );
}
