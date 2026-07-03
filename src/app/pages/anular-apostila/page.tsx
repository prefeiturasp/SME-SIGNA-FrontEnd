"use client";

import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, message } from "antd";
import { Loader2 } from "lucide-react";

import { getDadosPortaria } from "@/utils/designacao/getDadosPortaria";
import { getDadosPortariaCessacao } from "@/utils/cessacao/getDadosPortaria";
import { getDadosIndicado } from "@/utils/ServidorIndicado/getDadosIndicado"


import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import EditorSEI, { gerarHtmlPortaria } from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import BlocosDesignacao from "@/components/dashboard/Designacao/ResumoDesignacao/BlocosDesignacao";


import { useRouter, useSearchParams } from "next/navigation";
import { Servidor } from "@/types/designacao-unidade";
import formSchemaAnularApostila, { formSchemaAnularApostilaData } from "./schema";
import { useFetchApostilasById } from "@/hooks/useVisualizarApostilas";
import PortariaAnularApostilaFields from "@/components/dashboard/apostila/PortariaApostilaFields/PortariaAnularApostilaFields";
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

  const form = useForm<formSchemaAnularApostilaData>({
    resolver: zodResolver(formSchemaAnularApostila),
    defaultValues: {
      apostila: defaultValues,
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

  const gerarDados = (values: formSchemaAnularApostilaData) => {
      const isCessacao = tipo_portaria === "cessacao";
      
      const fonteDados = isCessacao ? apostila?.cessacao : apostila?.designacao;

      const nome_indicado =
      apostila?.designacao?.indicado_nome_civil?.trim()
          ? apostila?.designacao?.indicado_nome_civil
          : apostila?.designacao?.indicado_nome_servidor;

      return {

        portaria: values.apostila.portaria,
        ano: values.apostila.ano,
        numero_sei: values.apostila.numero_sei,


        portaria_apostilada: fonteDados?.portaria ?? "-",
        ano_apostilado: fonteDados?.ano_vigente ?? "-",
        doc_apostilado: fonteDados?.doc ?? "-",
        sei_apostilado: fonteDados?.numero_sei ?? "-",


        nome_indicado: nome_indicado?.toUpperCase() ?? "-",
        rf: formatarRF(apostila?.designacao?.indicado_rf ?? "-"),      
        dre: apostila?.designacao?.dre_nome ?? "-",
        vinculo: apostila?.designacao?.indicado_vinculo ?? "-",

        texto_para_apostila: values.apostila.texto_para_apostila,
        
        
      
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

  const onSubmit = async (values: formSchemaAnularApostilaData) => {    
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

  console.log('dadosPortariaCessacao', apostila);
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
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mt-4"
              title={
                <div className="flex justify-between items-center">
                  <span className="text-[#333]">{tipo_portaria=="designacao" ? "Designação" : "Cessação"}</span>
                </div>
              }
            >
              <Accordion
                type="multiple"
                defaultValue={[
                  "servidor-indicado",
                  "portaria-designacao",
                  "portarias-cessacao",
                  "portaria-apostila",
                ]}
              >
                <BlocosDesignacao
                  dadosIndicado={dadosIndicado}
                  dadosPortaria={dadosPortaria}
                  dadosPortariaCessacao={dadosPortariaCessacao}
                  onSubmitEditarServidor={() => { }}
                  showExtraFields
                  showCursosTitulos
                  showLotacao
                  showCategoria={false}
                  showCessacao={dadosPortariaCessacao}
                  showCessacaoExtraFields={true}
                />

                <CustomAccordionItem title="Dados da portaria de anulação" value="portaria-apostila" color="blue">
                  <PortariaAnularApostilaFields
                    tipo_portaria={tipo_portaria}
                  />
                  <div className="w-full flex justify-end pt-[2rem]">
                    <div className="w-[200px]">
                      <Button
                        type="button"
                        size="lg"
                        className="w-full flex items-center justify-center gap-6"
                        variant="destructive"
                        onClick={async () => {
                          const isValid = await form.trigger("apostila");
                          if (!isValid) return;
                          handleGerarPortaria();
                        }}>
                        Gerar texto SEI
                      </Button>
                    </div>
                  </div>
                </CustomAccordionItem>
              </Accordion>

              {mostrarEditor && (
                <EditorSEI
                  html={htmlPortaria}
                  titulo="TEXTO"
                  labelBotao="Salvar"
                  tipoBotao="submit"
                  testId="botao-proximo"
                />
              )}
            </Card>
          </form>
        </FormProvider>
      )}
    </>
  );
}