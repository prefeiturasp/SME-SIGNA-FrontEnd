import { useMutation } from "@tanstack/react-query";
import { redefinirSenhaAction } from "@/actions/redefinir-senha";

const useRedefinirSenha = () => {
    return useMutation({
        mutationFn: (variables) => redefinirSenhaAction(variables),
    });
};

export default useRedefinirSenha;
