import { useQuery } from "@tanstack/react-query";
import { fetchCargosBaseAction } from "@/actions/cargos-base";

 

export function useBuscarCargosBase() {
    return useQuery({
        queryKey: ["get-cargos-base"],
        queryFn: async () => {
            const response = await fetchCargosBaseAction();
            if (!response.success) {
                throw new Error(response.error);
            }
            if (response.data[0]?.codigoCargo===0) {
                return [];
            }
            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
    });
}


