import { useQuery } from "@tanstack/react-query";
import { fetchApostilasByIdAction } from "@/actions/designacao";

 
export function useFetchApostilasById(id: number) {
    return useQuery({
        queryKey: ["get-apostilas-by-id", id],
        queryFn: async () => {
            const response = await fetchApostilasByIdAction(id);
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