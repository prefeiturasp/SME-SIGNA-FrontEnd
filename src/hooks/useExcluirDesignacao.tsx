import { useMutation } from "@tanstack/react-query";
import { excluirDesignacao } from "@/actions/designacoes";

export const useExcluirDesignacao = () => {
 
    return useMutation({
        mutationFn: (id: number) => excluirDesignacao(id),
    });
};
