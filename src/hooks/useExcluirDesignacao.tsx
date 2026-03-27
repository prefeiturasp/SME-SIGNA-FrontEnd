import { useMutation, useQueryClient } from "@tanstack/react-query";
import { excluirDesignacao } from "@/actions/designacoes";

export const useExcluirDesignacao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => excluirDesignacao(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["designacoes"] });
        },
    });
};
