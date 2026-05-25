import { useQuery } from "@tanstack/react-query";
import { getCargosBaseBancoDeDados, getCargosSobrepostosBancoDeDados } from "@/actions/cargos-banco-de-dados";

export function useFetchCargosBase() {
    return useQuery({
        queryKey: ["get-cargos-banco-de-dados-base"],
        queryFn: () => getCargosBaseBancoDeDados(),        
        refetchOnWindowFocus: false,
    });
}

export function useFetchCargosSobrepostos() {
    return useQuery({
        queryKey: ["get-cargos-banco-de-dados-sobrepostos"],
        queryFn: () => getCargosSobrepostosBancoDeDados(),        
        refetchOnWindowFocus: false,
    });
}