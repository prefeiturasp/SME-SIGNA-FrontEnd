import { useQuery } from "@tanstack/react-query";
import { fetchCessacaoByIdAction } from "@/actions/cessacao";

 
export function useFetchCessacaoById(id: number) {
    return useQuery({
        queryKey: ["get-cessacao-by-id", id],
        queryFn: async () => {
            const response = await fetchCessacaoByIdAction(id);
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