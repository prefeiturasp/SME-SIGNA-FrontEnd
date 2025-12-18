import { useMutation } from "@tanstack/react-query";
import { useRecuperarSenhaAction } from "@/actions/recuperarSenha";

const useRedefinirSenha = () => {
    return useMutation({
        mutationFn: useRecuperarSenhaAction,
    });
};

export default useRedefinirSenha;
