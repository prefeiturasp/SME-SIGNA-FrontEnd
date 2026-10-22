import { useQuery } from "@tanstack/react-query";
import { getUnidadesCadastradasAction } from "@/actions/unidades-cadastradas";

export function useUnidadesCadastradas() {
    return useQuery({
        queryKey: ["get-unidades-cadastradas"],
        queryFn: async () => {
            const response = await getUnidadesCadastradasAction();
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
}
