"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { getDadosPortaria } from "@/utils/designacao/getDadosPortaria";
import { getDadosPortariaCessacao } from "@/utils/cessacao/getDadosPortaria";
import { getDadosIndicado } from "@/utils/ServidorIndicado/getDadosIndicado"


import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { useSearchParams } from "next/navigation";
import { Servidor } from "@/types/designacao-unidade";
import formSchemaAnularApostila, { formSchemaAnularApostilaData } from "@/app/pages/anular-apostila/schema";

import { useFetchInsubsistenciasById } from "@/hooks/useVisualizarInsubsistencia";
import AnularApostilaTornarSemEfeitoFormCard from "@/components/dashboard/apostila/AnularApostilaTornarSemEfeitoFormCard";
import { useSalvarInsubsistencias } from "@/hooks/useSalvarInsubsistencias";
import { message } from "antd";
import { useRouter } from "next/navigation";


const defaultValues = {
  portaria: "",
  ano: "",
  numero_sei: "",
  doc: new Date(),
  observacao: ""
};

export default function AnularApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");


  const { data: insubsistencia, isLoading } = useFetchInsubsistenciasById(Number(id));

  const tipo_portaria = insubsistencia?.cessacao ? "cessacao" : "designacao";

  const form = useForm<formSchemaAnularApostilaData>({
    resolver: zodResolver(formSchemaAnularApostila),
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

  const gerarDados = (values: formSchemaAnularApostilaData) => {
    console.log('values', values);
  };
  const salvarInsubsistencias = useSalvarInsubsistencias();

  const router = useRouter();

  const handleGerarPortaria = () => {
    setMostrarEditor(true);

  };

  const onSubmit = async (values: formSchemaAnularApostilaData) => {    
    const ato_pai = insubsistencia?.id;
    try {
      
      await salvarInsubsistencias.mutateAsync({
        values,
        atoPai: ato_pai ?? 0,
      });

      message.success("Ato foi tornado sem efeito com sucesso!");
      router.push("/pages/atos-administrativos");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      message.error(msg);
    }
  };


  const tipo_portaria_text = tipo_portaria === "designacao" ? "designação" : "cessação";
  const title = (
    <span>
      Detalhes da insubsistência da {tipo_portaria_text}
    </span>
  );

  console.log('insubsistencia', insubsistencia);
  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Detalhes da "+tipo_portaria_text }]}
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
          showTextoParaApostila={false}
          tituloForm="Portaria do ato tornar sem efeito"
        />
      )}
    </>
  );
}