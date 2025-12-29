import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type RecuperarSenhaPayload = {
  username: string;
};

const useRecuperarSenha = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  return useMutation({
    mutationFn: async ({ username }: RecuperarSenhaPayload) => {
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
      try {
      const resp = await fetch(
        `${API_URL}/usuarios/esqueci-senha`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            'username':username
          }),
        }
      );

      if (resp.status !== 200) {
        

          const json = await resp.json();
          if (json?.detail) {
            errorMessage = json.detail;
          }      
          return { success: false, error: errorMessage };        
        }
    } catch (err) {
      return { success: false, error: errorMessage };        

    }
        

     

        
        return { success: true };
     },

    onSuccess: (response) => {
      if (!response.success) return;
      
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });
};

export default useRecuperarSenha;
