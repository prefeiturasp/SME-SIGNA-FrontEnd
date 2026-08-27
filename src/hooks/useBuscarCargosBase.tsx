import { useQuery } from "@tanstack/react-query";
import { fetchCargosBaseAction, fetchCargosBaseActionByIdAction } from "@/actions/cargos-base";
import { fetchTextoPortariaByIdAction } from "@/actions/textos-portaria";


 

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