import { useMutation } from "@tanstack/react-query";
import { formSchemaAnularApostilaTornarSemEfeitoData } from "@/app/pages/anular-apostila/schema";
import { format } from "date-fns";
import { insubsistenciaAction } from "@/actions/insubsistencia-criar";
import { InsubsistenciaBody } from "@/types/insubsistencia";

export const useSalvarInsubsistencias = () => {
  return useMutation({
    mutationFn: async ({
      values,
      atoPai,
    }: {
      values: formSchemaAnularApostilaTornarSemEfeitoData;
      atoPai: number;
    }) => {

      
      const payload: InsubsistenciaBody = {
        ato_pai: atoPai,
        numero_portaria: values.apostila_insubsistencia.portaria,
        ano_vigente: values.apostila_insubsistencia.ano,
        sei_numero: values.apostila_insubsistencia.numero_sei,
        doc: values.apostila_insubsistencia.doc ? format(values.apostila_insubsistencia.doc, "yyyy-MM-dd") : undefined,
        observacoes: values.apostila_insubsistencia.observacao,
        texto_apostila: values.apostila_insubsistencia.texto_para_apostila        
      };
      const response = await insubsistenciaAction(payload);      

      if (!response.success) {
        console.log(response.error);
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};
