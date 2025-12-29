import { useMutation } from "@tanstack/react-query";
import { atualizarSenhaAction } from "@/actions/atualizar-senha";

const useAtualizarSenha = () => {
    return useMutation({
        mutationFn: atualizarSenhaAction,
    });
};

export default useAtualizarSenha;
