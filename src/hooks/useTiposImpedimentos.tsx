import { useMutation } from "@tanstack/react-query";
import { getImpedimentosAction } from "@/actions/tipos-impedimentos";

export function useFetchImpedimentos() {
  return useMutation({
    mutationFn: async () => {
      const response = await getImpedimentosAction();

      if (!response.success) {
        throw new Error(
          response.error || "Erro ao buscar tipos de impedimento"
        );
      }

      return response.data;
    },
  });
}