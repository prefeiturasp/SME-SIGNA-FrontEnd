import { useMutation } from "@tanstack/react-query";
import { redefinirSenhaAction } from "@/actions/redefinir-senha";

const useRedefinirSenha = () => {
    return useMutation({
        mutationFn: redefinirSenhaAction,
    });
};

export default useRedefinirSenha;
