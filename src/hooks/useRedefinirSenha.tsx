import { useMutation } from "@tanstack/react-query";
import { redefinirSenhaAction } from "@/actions/redefinir-senha";
 
const useRedefinirSenha = () => {
    console.log("useRedefinirSenha");
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    console.log("redefinirSenhaAction API_URL",`${API_URL}/usuario/redefinir-senha`)

    return useMutation({
        mutationFn: redefinirSenhaAction,
     });
};

export default useRedefinirSenha;
