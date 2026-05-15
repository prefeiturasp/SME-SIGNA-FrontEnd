import { useMutation } from "@tanstack/react-query";
import { formSchemaApostilaData } from "@/app/pages/apostila/schema";
import { ApostilaAction } from "@/actions/apostila-criar";
import { ApostilaBody } from "@/types/apostila";

export const useSalvarApostila = () => {
  return useMutation({
    mutationFn: async ({
      values,
      designacaoId,
      cessacaoId,
    }: {
      values: formSchemaApostilaData;
      designacaoId?: number;
      cessacaoId?: number;
    }) => {
      const atoPai =
        values.apostila.ato_apostilado === "cessacao" && cessacaoId
          ? cessacaoId
          : (designacaoId as number);

      const payload: ApostilaBody = {
        ato_pai: atoPai,
        sei_numero: values.apostila.numero_sei,
        doc: values.apostila.doc || undefined,
        observacao: values.apostila.observacao,
      };

      const response = await ApostilaAction(payload);

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};
