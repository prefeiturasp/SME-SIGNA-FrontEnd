import { useQuery } from "@tanstack/react-query";
import { getDesignacaoByIdAction } from "@/actions/designacoes";
import { DesignacaoResponse } from "@/types/designacao";

 
export function useFetchDesignacoesById(id: number) {
    return useQuery<DesignacaoResponse>({
        queryKey: ["get-designacao-by-id", id],
        queryFn: () => getDesignacaoByIdAction(id),
        enabled: !!id,
        refetchOnWindowFocus: false,
    });
}