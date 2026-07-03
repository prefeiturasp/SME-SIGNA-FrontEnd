import { useQuery } from "@tanstack/react-query";
import { fetchInsubsistenciasByIdAction } from "@/actions/insubsistencia-criar";

 
export function useFetchInsubsistenciasById(id: number) {
    return useQuery({
        queryKey: ["get-insubsistencias-by-id", id],
        queryFn: async () => {
            const response = await fetchInsubsistenciasByIdAction(id);
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