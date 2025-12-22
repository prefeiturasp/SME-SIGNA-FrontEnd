import { useMutation } from "@tanstack/react-query";
import { esqueciSenhaAction } from "@/actions/esqueci-senha";

const useSolicitarRedefinicaoSenha = () => {
    return useMutation({
        mutationFn: esqueciSenhaAction,
    });
};

export default useSolicitarRedefinicaoSenha;
