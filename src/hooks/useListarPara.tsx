import { useQuery } from "@tanstack/react-query";
import { listarParaAction } from "@/actions/listar-para";


export function useListarPara() {
    return useQuery({
        queryKey: ["get-listar-para"],
        queryFn: () => listarParaAction(),        
        refetchOnWindowFocus: false,
    });
}