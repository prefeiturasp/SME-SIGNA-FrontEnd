import { useQuery } from "@tanstack/react-query";
import { getDesignacaoByIdAction } from "@/actions/designacoes";

 
export function useFetchDesignacoesById(id: number) {
    return useQuery({
        queryKey: ["get-designacao-by-id", id],
        queryFn: async () => {
            const response = await getDesignacaoByIdAction(id);
            if (!response.success) {
                throw new Error(response.error);
            }
            return response.data;
        },
        enabled: !!id,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
    });
}