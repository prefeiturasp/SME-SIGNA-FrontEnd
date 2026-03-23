import { useQuery } from "@tanstack/react-query";
import { getCargos } from "@/actions/cargos";


export function useFetchCargos() {
    return useQuery({
        queryKey: ["get-cargos"],
        queryFn: () => getCargos(),        
        refetchOnWindowFocus: false,
    });
}