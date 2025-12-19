import { useMutation } from "@tanstack/react-query";
import { cadastroAction } from "@/actions/cadastro";
import type { CadastroRequest } from "@/types/cadastro";

export default function useCadastro() {
    return useMutation({
        mutationFn: (data: CadastroRequest) => cadastroAction(data),
        onSuccess: (response) => {
            return response;
        },
    });
}
