import { useRecuperarSenhaAction } from "@/actions/recuperarSenha";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRecuperarSenha = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: useRecuperarSenhaAction,
    onSuccess: (response) => {
      if (!response.success) return;

      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

export default useRecuperarSenha;
