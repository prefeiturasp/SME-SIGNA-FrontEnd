import { useMutation } from "@tanstack/react-query";
import {  ApostilaInsubsistenciasBody   } from "@/types/apostila";
import { formSchemaAnularApostilaData } from "@/app/pages/anular-apostila/schema";
import { ApostilaInsubsistenciaAction } from "@/actions/apostila-insubsistencia-criar";
import { format } from "date-fns";

export const useSalvarInsubsistencias = () => {
  return useMutation({
    mutationFn: async ({
      values,
      atoPai,
    }: {
      values: formSchemaAnularApostilaData;
      atoPai: number;
    }) => {

      
      const payload: ApostilaInsubsistenciasBody = {
        ato_pai: atoPai,
        numero_portaria: values.apostila.portaria,
        ano_vigente: values.apostila.ano,
        sei_numero: values.apostila.numero_sei,
        doc: values.apostila.doc ? format(values.apostila.doc, "yyyy-MM-dd") : undefined,
        observacoes: values.apostila.observacao,
        texto_apostila: values.apostila.texto_para_apostila        
      };
      const response = await ApostilaInsubsistenciaAction(payload);

      if (!response.success) {
        console.log(response.error);
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};
