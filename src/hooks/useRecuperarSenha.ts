import { useRecuperarSenhaAction } from "@/actions/recuperarSenha";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const useRecuperarSenha = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: useRecuperarSenhaAction,
    onSuccess: (response) => {
      if (!response.success) return;

      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });
};

export default useRecuperarSenha;
