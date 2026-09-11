import { useMutation } from "@tanstack/react-query";
import { cessacaoAction } from "@/actions/cessacao-criar";
import { mapearPayloadCessacao } from "@/utils/cessacao/mapearPayloadCessacao";
import { formSchemaCessacaoData } from "@/app/pages/cessacao/schema";

export const useSalvarCessacao = () => {
  return useMutation({
    mutationFn: async ({
      values,
      designacaoId,
      id,
      textoSei,
      modeloPortaria,
    }: {
      values: formSchemaCessacaoData;
      designacaoId: number;
      id: string | null;
      textoSei?: string;
      modeloPortaria?: number | null;
    }) => {
      const payload = mapearPayloadCessacao(
        values,
        designacaoId,
        textoSei,
        modeloPortaria
      );
      const response = await cessacaoAction(payload, id);

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};