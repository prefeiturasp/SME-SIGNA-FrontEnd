import { useMutation } from "@tanstack/react-query";
import { formSchemaApostilaData } from "@/app/pages/apostila/schema";
import { ApostilaAction } from "@/actions/apostila-criar";
import { ApostilaBody } from "@/types/apostila";

export const useSalvarApostila = () => {
  return useMutation({
    mutationFn: async ({
      values,
      designacaoId,      
    }: {
      values: formSchemaApostilaData;
      designacaoId?: number;
      cessacaoId?: number;
    }) => {
      const payload = {
         sei_numero: values.apostila.numero_sei,
         doc: values.apostila.doc,
         observacao: values.apostila.observacao,
         ato_apostilado: values.apostila.ato_apostilado,
         designacao: designacaoId,
         tipo: "APOSTILA"
        } as ApostilaBody;
      

      const response = await ApostilaAction(payload);

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};