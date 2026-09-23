"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { getDadosPortaria } from "@/utils/designacao/getDadosPortaria";
import { getDadosPortariaCessacao } from "@/utils/cessacao/getDadosPortaria";
import { getDadosIndicado } from "@/utils/ServidorIndicado/getDadosIndicado";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { gerarHtmlPortaria } from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";

import { useRouter, useSearchParams } from "next/navigation";
import { Servidor } from "@/types/designacao-unidade";
import formSchemaAnularApostilaTornarSemEfeito, {
  formSchemaAnularApostilaTornarSemEfeitoData,
} from "../schema";
import { useFetchInsubsistenciasById } from "@/hooks/useVisualizarInsubsistencia";
import AnularApostilaTornarSemEfeitoFormCard from "@/components/dashboard/apostila/AnularApostilaTornarSemEfeitoFormCard";
import { TEMPLATE_ANULAR_APOSTILA } from "@/utils/portarias/templates";
import { formatarRF } from "@/utils/portarias/formatadores";
import { useSalvarInsubsistencias } from "@/hooks/useSalvarInsubsistencias";
import { formatarData } from "@/lib/utils";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import { InsubsistenciaRead } from "@/types/insubsistencia";

const defaultValues = {
  portaria: "",
  ano: "",
  numero_sei: "",
  doc: new Date(),
  observacao: "",
  texto_para_apostila: "",
};

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
  const router = useRouter();
  const salvarInsubsistencias = useSalvarInsubsistencias();
  const notification = useAppNotification();

  const { data: insubsistencia, isLoading } = useFetchInsubsistenciasById(Number(id));
  const tipo_portaria = insubsistencia?.cessacao ? "cessacao" : "designacao";

  const form = useForm<formSchemaAnularApostilaTornarSemEfeitoData>({
    resolver: zodResolver(formSchemaAnularApostilaTornarSemEfeito),
    defaultValues: {
      apostila_insubsistencia: defaultValues,
    },
  });

  const dadosPortaria = useMemo(
    () => getDadosPortaria(insubsistencia?.designacao),
    [insubsistencia]
  );

  const dadosPortariaCessacao = useMemo(
    () => getDadosPortariaCessacao(insubsistencia),
    [insubsistencia]
  );

  const dadosIndicado: Servidor | null = useMemo(
    () => getDadosIndicado(insubsistencia?.designacao),
    [insubsistencia]
  );

  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [htmlPortaria, setHtmlPortaria] = useState("");

  useEffect(() => {
    if (!insubsistencia) return;

    form.reset({
      apostila_insubsistencia: gerarFormValuesAnularApostila(insubsistencia),
    });
  }, [insubsistencia, form]);

  const gerarDados = (values: formSchemaAnularApostilaTornarSemEfeitoData) => {
    const isCessacao = tipo_portaria === "cessacao";

    const fonteDados = isCessacao ? insubsistencia?.cessacao : insubsistencia?.designacao;

    const nome_indicado = insubsistencia?.designacao?.indicado_nome_civil?.trim()
      ? insubsistencia?.designacao?.indicado_nome_civil
      : insubsistencia?.designacao?.indicado_nome_servidor;

    return {
      portaria: values.apostila_insubsistencia.portaria,
      ano: values.apostila_insubsistencia.ano,
      sei: values.apostila_insubsistencia.numero_sei,

      portaria_apostilada: fonteDados?.portaria ?? "-",
      ano_apostilado: fonteDados?.ano_vigente ?? "-",
      doc_apostilado: fonteDados?.doc ? formatarData(fonteDados?.doc) : "-",
      sei_apostilado: fonteDados?.sei_numero ?? "-",

      nome_indicado: nome_indicado?.toUpperCase() ?? "-",
      rf: formatarRF(insubsistencia?.designacao?.indicado_rf ?? "-"),
      dre: insubsistencia?.designacao?.dre_nome ?? "-",
      vinculo: insubsistencia?.designacao?.indicado_vinculo ?? "-",

      texto_para_apostila: values.apostila_insubsistencia.texto_para_apostila,
    };
  };

  const handleGerarPortaria = () => {
    const values = form.getValues();
    const dados = gerarDados(values);

    let texto = TEMPLATE_ANULAR_APOSTILA;

    Object.entries(dados).forEach(([key, value]) => {
      let val = String(value ?? "");
      if (["nome_indicado", "dre"].includes(key)) {
        val = `<strong>${val}</strong>`;
      }
      texto = texto.replaceAll(`{{${key}}}`, val);
    });

    setHtmlPortaria(gerarHtmlPortaria(texto));
    setMostrarEditor(true);
  };

  const onSubmit = async (values: formSchemaAnularApostilaTornarSemEfeitoData) => {
    const ato_pai = Number(atoPaiParam) || insubsistencia?.ato_pai_id;
    try {
      await salvarInsubsistencias.mutateAsync({
        values,
        atoPai: ato_pai ?? 0,
        id: insubsistencia?.id,
      });

      notification.success({ title: "Anulação de apostila editada com sucesso!" });
      router.push("/pages/atos-administrativos");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      notification.error({ title: msg });
    }
  };

  const title = <span>Editar Anular Apostila</span>;

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Editar Anular Apostila" },
        ]}
        showBackButton={false}
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#B22B2A]" />
        </div>
      ) : (
        <AnularApostilaTornarSemEfeitoFormCard
          form={form}
          onSubmit={onSubmit}
          tipoPortaria={tipo_portaria}
          dadosIndicado={dadosIndicado}
          dadosPortaria={dadosPortaria}
          dadosPortariaCessacao={dadosPortariaCessacao}
          triggerField="apostila_insubsistencia"
          onGerarPortaria={handleGerarPortaria}
          mostrarEditor={mostrarEditor}
          htmlPortaria={htmlPortaria}
          showTextoParaApostila
          tituloForm="Dados da portaria de anulação"
        />
      )}
    </>
  );
}
