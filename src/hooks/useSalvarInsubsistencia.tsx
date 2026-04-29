import { useMutation } from "@tanstack/react-query";
import { formSchemaInsubsistenciaData } from "@/app/pages/insubsistencia/schema";
import { insubsistenciaAction } from "@/actions/insubsistencia-criar";
import { InsubsistenciaBody } from "@/types/insubsistencia";

export const useSalvarInsubsistencia = () => {
  return useMutation({
    mutationFn: async ({
      values,
      designacaoId,      
    }: {
      values: formSchemaInsubsistenciaData;
      designacaoId?: number;
      cessacaoId?: number;
    }) => {
      const payload = {
         numero_portaria: values.insubsistencia.numero_portaria,
         ano_vigente: values.insubsistencia.ano,
         sei_numero: values.insubsistencia.numero_sei,
         doc: values.insubsistencia.doc,
         observacoes: values.insubsistencia.observacoes,
         tipo_insubsistencia: values.insubsistencia.tipo_insubsistencia,
         designacao: designacaoId,
        } as InsubsistenciaBody;
      

      const response = await insubsistenciaAction(payload);

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};