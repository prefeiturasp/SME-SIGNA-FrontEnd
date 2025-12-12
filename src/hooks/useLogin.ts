import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type LoginPayload = {
  rf_ou_cpf: string;
  senha: string;
};

const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rf_ou_cpf, senha }: LoginPayload) => {
      const resp = await fetch(
        "https://qa-signa.sme.prefeitura.sp.gov.br/api/usuario/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: rf_ou_cpf,
            password: senha,
          }),
        }
      );

      if (resp.status !== 200) {
        let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";

          const json = await resp.json();
          if (json?.detail) {
            errorMessage = json.detail;
          }      
          return { success: false, error: errorMessage };        
        }

        
        return { success: true };
     },

    onSuccess: (response) => {
      if (!response.success) return;
      
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/home");
    },
  });
};

export default useLogin;
