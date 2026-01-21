import { useMutation } from "@tanstack/react-query";
import { atualizarEmailAction } from "@/actions/atualizar-email";

const useAtualizarEmail = () => {
    return useMutation({
        mutationFn: atualizarEmailAction,
    });
};

export default useAtualizarEmail;
