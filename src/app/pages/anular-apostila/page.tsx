"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, message } from "antd";
import { Loader2 } from "lucide-react";

import { TEMPLATE_APOSTILA } from "@/utils/portarias/templates";
import { nameToCamelCase, nameToCamelCaseUe, formatarRF } from "@/utils/portarias/formatadores";
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

export default function AnularApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const { data: apostila, isLoading } = useFetchApostilasById(Number(id));
  const tipo_portaria = apostila?.cessacao ? "cessacao" : "designacao";

  const form = useForm<formSchemaAnularApostilaData>({
    resolver: zodResolver(formSchemaAnularApostila),
    defaultValues: {
      apostila: {
        portaria: undefined,
        ano: undefined,
        numero_sei: "",
        doc: "",
        observacao: "",
        texto_para_apostila: "",
      },
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



  useEffect(() => {
    if (!apostila) return;
    form.reset({
      apostila: {
        portaria: undefined,
        ano: undefined,
        numero_sei: "",
        doc: "",
        texto_para_apostila: "",
        observacao: "",
      },
    });
  }, [apostila, form]);

  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [htmlPortaria, setHtmlPortaria] = useState("");

  const gerarDados = (values: formSchemaAnularApostilaData) => {
    const isCessacao = apostila?.cessacao;

    const fonteDados = isCessacao ? apostila?.designacao?.cessacao : apostila?.designacao;

    return {
      sei: values.apostila.numero_sei,
      dre: apostila?.designacao?.dre_nome ?? "-",
      eh: apostila?.designacao?.codigo_hierarquico ?? "-",
      doc: values.apostila.doc,
      ato_apostilado: isCessacao ? "cessacao" : "designacao",

      portaria_designacao: fonteDados?.numero_portaria ?? "-",
      ano: fonteDados?.ano_vigente ?? "-",
      doc_designacao: fonteDados?.doc ?? "-",
      sei_designacao: isCessacao ? apostila?.designacao?.cessacao?.sei_numero : apostila?.designacao?.sei_numero ?? "-",

      nome_indicado: apostila?.designacao?.indicado_nome_servidor ?? "-",
      rf: formatarRF(apostila?.designacao?.indicado_rf ?? "-"),
      vinculo: apostila?.designacao?.indicado_vinculo ?? "-",
      cargo_base: nameToCamelCase(apostila?.designacao?.indicado_cargo_base ?? "-"),
      cargo: nameToCamelCase(apostila?.designacao?.indicado_cargo_sobreposto ?? "-"),
      ue: nameToCamelCaseUe(apostila?.designacao?.indicado_local_exercicio ?? "-"),
      observacao: values.apostila.observacao ?? "",
    };
  };

  const handleGerarPortaria = () => {
    const values = form.getValues();
    const dados = gerarDados(values);

    let texto = TEMPLATE_APOSTILA;

    Object.entries(dados).forEach(([key, value]) => {
      let val = String(value ?? "");
      if (["nome_indicado"].includes(key)) {
        val = `<strong>${val}</strong>`;
      }
      texto = texto.replaceAll(`{{${key}}}`, val);
    });

    setHtmlPortaria(gerarHtmlPortaria(texto));
    setMostrarEditor(true);
  };

  const onSubmit = async (values: formSchemaAnularApostilaData) => {
    console.log('values', values);
    try {

      message.success("Apostila salva com sucesso!");
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
                  showCessacao={false}
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