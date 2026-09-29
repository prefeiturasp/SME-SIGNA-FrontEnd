"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useFetchInsubsistenciasById } from "@/hooks/useVisualizarInsubsistencia";
import { useSalvarInsubsistencias } from "@/hooks/useSalvarInsubsistencias";
import AnularApostilaForm, {
  AnularApostilaExtras,
} from "@/components/dashboard/apostila/AnularApostilaForm";
import { formSchemaAnularApostilaTornarSemEfeitoData } from "../schema";
import { InsubsistenciaRead } from "@/types/insubsistencia";

export const gerarFormValuesAnularApostila = (
  insubsistencia: InsubsistenciaRead
) => ({
  portaria: insubsistencia?.numero_portaria?.toString() ?? "",
  ano: insubsistencia?.ano_vigente ?? "",
  numero_sei: insubsistencia?.sei_numero ?? "",
  doc: insubsistencia?.doc
    ? new Date(insubsistencia.doc.replaceAll("-", "/"))
    : new Date(),
  observacao: insubsistencia?.observacoes ?? "",
  texto_para_apostila: insubsistencia?.texto_apostila ?? "",
});

export default function EditarAnularApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const atoPaiParam = searchParams.get("atoPai");
  const salvarInsubsistencias = useSalvarInsubsistencias();

  const { data: insubsistencia, isLoading } = useFetchInsubsistenciasById(Number(id));

  const valoresIniciais = useMemo(
    () => (insubsistencia ? gerarFormValuesAnularApostila(insubsistencia) : null),
    [insubsistencia]
  );

  const onSalvar = async (
    values: formSchemaAnularApostilaTornarSemEfeitoData,
    { textoSei, modeloPortaria }: AnularApostilaExtras
  ) =>
    salvarInsubsistencias.mutateAsync({
      values,
      atoPai: Number(atoPaiParam) || insubsistencia?.ato_pai_id || 0,
      id: insubsistencia?.id,
      textoSei,
      modeloPortaria: modeloPortaria ?? insubsistencia?.modelo_portaria,
    });

  return (
    <AnularApostilaForm
      ato={insubsistencia}
      isLoading={isLoading}
      titulo="Editar Anular Apostila"
      mensagemSucesso="Anulação de apostila editada com sucesso!"
      valoresIniciais={valoresIniciais}
      textoSeiSalvo={insubsistencia?.texto_sei}
      onSalvar={onSalvar}
    />
  );
}
