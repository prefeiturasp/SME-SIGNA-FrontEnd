"use client";

import { useSearchParams } from "next/navigation";

import { useFetchApostilasById } from "@/hooks/useVisualizarApostilas";
import { useSalvarInsubsistencias } from "@/hooks/useSalvarInsubsistencias";
import AnularApostilaForm, {
  AnularApostilaExtras,
} from "@/components/dashboard/apostila/AnularApostilaForm";
import { formSchemaAnularApostilaTornarSemEfeitoData } from "./schema";

export default function AnularApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const salvarInsubsistencias = useSalvarInsubsistencias();

  const { data: apostila, isLoading } = useFetchApostilasById(Number(id));

  const onSalvar = async (
    values: formSchemaAnularApostilaTornarSemEfeitoData,
    { textoSei, modeloPortaria }: AnularApostilaExtras
  ) =>
    salvarInsubsistencias.mutateAsync({
      values,
      atoPai: apostila?.id ?? 0,
      textoSei,
      modeloPortaria,
    });

  return (
    <AnularApostilaForm
      ato={apostila}
      isLoading={isLoading}
      titulo="Anular Apostila"
      mensagemSucesso="Anulação de apostila salva com sucesso!"
      onSalvar={onSalvar}
    />
  );
}
