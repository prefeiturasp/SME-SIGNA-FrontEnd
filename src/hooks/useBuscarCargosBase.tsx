import { useQuery } from "@tanstack/react-query";
import { fetchCargosBaseAction, fetchCargosBaseActionByIdAction } from "@/actions/cargos-base";
import { fetchCargosBase } from "@/actions/gestao";

// Limite máximo de página aceito por CargoBasePagination no backend.
const PAGE_SIZE_TODOS_CARGOS_CADASTRADOS = 100;

export function useBuscarCargosBase() {
    return useQuery({
        queryKey: ["get-cargos-base"],
        queryFn: async () => {
            const [cargosEol, cargosCadastrados] = await Promise.all([
                fetchCargosBaseAction(),
                fetchCargosBase({ page_size: PAGE_SIZE_TODOS_CARGOS_CADASTRADOS }),
            ]);

            if (!cargosEol.success) {
                throw new Error(cargosEol.error);
            }
            if (cargosEol.data[0]?.codigoCargo===0) {
                return [];
            }

            if (!cargosCadastrados.success) {
                return cargosEol.data;
            }

            const codigosJaCadastrados = new Set(
                cargosCadastrados.data.results.map((cargo) => cargo.codigo_cargo)
            );

            return cargosEol.data.filter(
                (cargo) => !codigosJaCadastrados.has(String(cargo.codigoCargo))
            );
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
    });
}






export function useBuscarCargosBaseById(id: number) {
    return useQuery({
        queryKey: ["get-cargos-base-by-id", id],
        queryFn: async () => {
            const response = await fetchCargosBaseActionByIdAction(id);
            if (!response.success) {
                throw new Error(response.error);
            }
           
            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
        enabled: !!id,
    });
}   