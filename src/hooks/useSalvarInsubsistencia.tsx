import { useMutation } from "@tanstack/react-query";
import { formSchemaInsubsistenciaData } from "@/app/pages/insubsistencia/schema";
import { insubsistenciaAction } from "@/actions/insubsistencia-criar";
import { InsubsistenciaBody } from "@/types/insubsistencia";

export const useSalvarInsubsistencia = () => {
  return useMutation({
    mutationFn: async ({
      values,
      designacaoId,
      cessacaoId,
    }: {
      values: formSchemaInsubsistenciaData;
      designacaoId?: number;
      cessacaoId?: number;
    }) => {
      const atoPai =
        values.insubsistencia.tipo_insubsistencia === "cessacao" && cessacaoId
          ? cessacaoId
          : (designacaoId as number);

      const payload: InsubsistenciaBody = {
        ato_pai: atoPai,
        numero_portaria: values.insubsistencia.numero_portaria,
        ano_vigente: values.insubsistencia.ano,
        sei_numero: values.insubsistencia.numero_sei,
        doc: values.insubsistencia.doc !== "" ? values.insubsistencia.doc : undefined,
        observacoes: values.insubsistencia.observacoes,
      };

      const response = await insubsistenciaAction(payload);

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};
