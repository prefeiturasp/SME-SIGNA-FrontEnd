import { useQuery } from "@tanstack/react-query";
import { fetchApostilaByIdAction } from "@/actions/apostila";

 
export function useFetchApostilaById(id: number) {
    return useQuery({
        queryKey: ["get-apostila-by-id", id],
        queryFn: async () => {
            const response = await fetchApostilaByIdAction(id);
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