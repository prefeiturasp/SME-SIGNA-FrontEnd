"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { message } from "antd";
import { Loader2 } from "lucide-react";

import { getDadosPortaria } from "@/utils/designacao/getDadosPortaria";
import { getDadosPortariaCessacao } from "@/utils/cessacao/getDadosPortaria";
import { getDadosIndicado } from "@/utils/ServidorIndicado/getDadosIndicado"


import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { gerarHtmlPortaria } from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";


import { useRouter, useSearchParams } from "next/navigation";
import { Servidor } from "@/types/designacao-unidade";
import formSchemaAnularApostilaTornarSemEfeito, { formSchemaAnularApostilaTornarSemEfeitoData } from "./schema";
import { useFetchApostilasById } from "@/hooks/useVisualizarApostilas";
import AnularApostilaTornarSemEfeitoFormCard from "@/components/dashboard/apostila/AnularApostilaTornarSemEfeitoFormCard";
import { TEMPLATE_ANULAR_APOSTILA } from "@/utils/portarias/templates";
import { formatarRF } from "@/utils/portarias/formatadores";
import { useSalvarInsubsistencias } from "@/hooks/useSalvarInsubsistencias";


const defaultValues = {
  portaria: "",
  ano: "",
  numero_sei: "",
  doc: new Date(),
  observacao: "",
  texto_para_apostila: "É a presente portaria apostilada",
};  

export default function AnularApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const salvarInsubsistencias = useSalvarInsubsistencias();

  const { data: apostila, isLoading } = useFetchApostilasById(Number(id));
  const tipo_portaria = apostila?.cessacao ? "cessacao" : "designacao";

  const form = useForm<formSchemaAnularApostilaTornarSemEfeitoData>({
    resolver: zodResolver(formSchemaAnularApostilaTornarSemEfeito),
    defaultValues: {
      apostila_insubsistencia: defaultValues,
    },
  });

  const dadosPortaria = useMemo(
    () => getDadosPortaria(apostila?.designacao),
    [apostila]
  );

  const dadosPortariaCessacao = useMemo(
    () => getDadosPortariaCessacao(apostila),
    [apostila]
  );

  const dadosIndicado: Servidor | null = useMemo(
    () => getDadosIndicado(apostila?.designacao),
    [apostila]
  );


  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [htmlPortaria, setHtmlPortaria] = useState("");

  const gerarDados = (values: formSchemaAnularApostilaTornarSemEfeitoData) => {
      const isCessacao = tipo_portaria === "cessacao";
      
      const fonteDados = isCessacao ? apostila?.cessacao : apostila?.designacao;

      const nome_indicado =
      apostila?.designacao?.indicado_nome_civil?.trim()
          ? apostila?.designacao?.indicado_nome_civil
          : apostila?.designacao?.indicado_nome_servidor;

      return {

        portaria: values.apostila_insubsistencia.portaria,
        ano: values.apostila_insubsistencia.ano,
        numero_sei: values.apostila_insubsistencia.numero_sei,


        portaria_apostilada: fonteDados?.portaria ?? "-",
        ano_apostilado: fonteDados?.ano_vigente ?? "-",
        doc_apostilado: fonteDados?.doc ?? "-",
        sei_apostilado: fonteDados?.numero_sei ?? "-",


        nome_indicado: nome_indicado?.toUpperCase() ?? "-",
        rf: formatarRF(apostila?.designacao?.indicado_rf ?? "-"),      
        dre: apostila?.designacao?.dre_nome ?? "-",
        vinculo: apostila?.designacao?.indicado_vinculo ?? "-",

        texto_para_apostila: values.apostila_insubsistencia.texto_para_apostila,
        
        
      
      };
    };

  const handleGerarPortaria = () => {
    const values = form.getValues();
    const dados = gerarDados(values);

    let texto = TEMPLATE_ANULAR_APOSTILA;

    Object.entries(dados).forEach(([key, value]) => {
      let val = String(value ?? "");
      if (["nome_indicado","dre"].includes(key)) {
        val = `<strong>${val}</strong>`;
      }
      texto = texto.replaceAll(`{{${key}}}`, val);
    });

    setHtmlPortaria(gerarHtmlPortaria(texto));
    setMostrarEditor(true);
  };

  const onSubmit = async (values: formSchemaAnularApostilaTornarSemEfeitoData) => {    
    const ato_pai = apostila?.id;
    try {
      
      await salvarInsubsistencias.mutateAsync({
        values,
        atoPai: ato_pai ?? 0,
      });

      message.success("Anulação de apostila salva com sucesso!");
      router.push("/pages/atos-administrativos");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      message.error(msg);
    }
  };

    
  const title = (
    <span>
      Anular Apostila
    </span>
  );

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Anular Apostila" }]}
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