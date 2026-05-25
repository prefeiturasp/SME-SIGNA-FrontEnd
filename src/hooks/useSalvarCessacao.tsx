import { useMutation } from "@tanstack/react-query";
import { cessacaoAction } from "@/actions/cessacao-criar";
import { mapearPayloadCessacao } from "@/utils/cessacao/mapearPayloadCessacao";

export const useSalvarCessacao = () => {
  return useMutation({
    mutationFn: async ({
      values,
      designacaoId,
      id,
    }: {
      values: any;
      designacaoId: number;
      id: string | null;
    }) => {
      const payload = mapearPayloadCessacao(values, designacaoId);
      console.log("PAYLOAD FINAL:", payload);

      const response = await cessacaoAction(payload, id);

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};