"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "antd";
import { Loader2 } from "lucide-react";

import { TEMPLATE_APOSTILA } from "@/utils/portarias/templates";
import { nameToCamelCase, nameToCamelCaseUe, formatarRF, formatarDataPtBr } from "@/utils/portarias/formatadores";

import { Button } from "@/components/ui/button";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import EditorSEI, { gerarHtmlPortaria } from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";


import { useRouter, useSearchParams } from "next/navigation";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";

import formSchemaApostila, { formSchemaApostilaData } from "./schema";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import InformacoesAdicionais from "@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais";
import TextoPraApostila from "@/components/dashboard/Designacao/TextoPraApostila/TextoPraApostila";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import { Accordion } from "@/components/ui/accordion";
import PortariaDesigacaoFields from "@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields";

export default function ApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const origem = searchParams.get("origem");
  const atoApostiladoPadrao = origem === "cessacao" ? "cessação" : "designação";
  const router = useRouter();
  const notification = useAppNotification();

  const { data: designacao, isLoading } = useFetchDesignacoesById(Number(id));

  const form = useForm<formSchemaApostilaData>({
    resolver: zodResolver(formSchemaApostila),
    defaultValues: {
      informacoes_adicionais: "",
      detalhe_para_quadro_de_historico_por_ano: false,
      texto_para_apostila: "",
      ato_apostilado: atoApostiladoPadrao,


      portaria_designacao: "",
      ano: "",
      numero_sei: "",
      doc: "",
      a_partir_de: new Date(),
      designacao_data_final: null,
      carater_especial: "nao",
      impedimento_substituicao: "nao",
      com_afastamento: "nao",
      motivo_afastamento: "",
      com_pendencia: "nao",
      motivo_pendencia: "",
    },
    mode: "onChange",
  });



  useEffect(() => {
    if (designacao) {
      form.reset({

        portaria_designacao: designacao?.numero_portaria ?? "",
        ano: designacao?.ano_vigente,
        numero_sei: designacao?.sei_numero ?? "",

        doc: designacao?.doc ?? "",
        a_partir_de: designacao?.data_inicio ? new Date(designacao.data_inicio.replaceAll("-", '/')) : new Date(),
        designacao_data_final: designacao?.data_fim ? new Date(designacao.data_fim.replaceAll("-", '/')) : null,
        carater_especial: designacao?.carater_excepcional ? "sim" : "nao",
        impedimento_substituicao: designacao?.impedimento_substituicao ? "sim" : "nao",
        com_afastamento: designacao?.com_afastamento ? "sim" : "nao",
        motivo_afastamento: designacao?.motivo_afastamento,
        com_pendencia: designacao?.pendencias ? "sim" : "nao",
        motivo_pendencia: designacao?.pendencias,

      },);

    }
  }, [designacao, form]);



  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [htmlPortaria, setHtmlPortaria] = useState("");

  const gerarDados = (values: formSchemaApostilaData) => {
    const isCessacao = values.ato_apostilado === "cessação";

    const fonteDados = isCessacao ? designacao?.cessacao : designacao;

    return {
      sei: "",
      dre: designacao?.dre_nome ?? "-",
      eh: designacao?.codigo_hierarquico ?? "-",
      doc: "",
      ato_apostilado: "",

      portaria_designacao: fonteDados?.numero_portaria ?? "-",
      ano: fonteDados?.ano_vigente ?? "-",
      doc_designacao: formatarDataPtBr(fonteDados?.doc),
      sei_designacao: isCessacao ? designacao?.cessacao?.sei_numero : designacao?.sei_numero ?? "-",

      nome_indicado: designacao?.indicado_nome_servidor ?? "-",
      rf: formatarRF(designacao?.indicado_rf ?? "-"),
      vinculo: designacao?.indicado_vinculo ?? "-",
      cargo_base: nameToCamelCase(designacao?.indicado_cargo_base ?? "-"),
      cargo: nameToCamelCase(designacao?.indicado_cargo_sobreposto ?? "-"),
      ue: nameToCamelCaseUe(designacao?.indicado_local_exercicio ?? "-"),
      observacao: "",
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

  const onSubmit = async (values: formSchemaApostilaData) => {
    try {
      console.log(values);
      notification.success({ title: "Apostila salva com sucesso!" });
      router.push("/pages/atos-administrativos");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      notification.error({ title: msg });
    }
  };



  return (
    <>
      <PageHeader
        title={`Apostila de ${atoApostiladoPadrao}`}
        breadcrumbs={[{ title: "Início", href: "/" },
        { title: `Apostila de ${atoApostiladoPadrao}` }]}
        showBackButton={true}
      />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {isLoading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <Loader2 className="h-10 w-10 animate-spin text-[#B22B2A]" />
            </div>
          ) : (


            <Card
              className="mt-4 m-0"
              title={
                <div className="flex justify-between items-center">
                  <span className="text-[#333] text-[14px] font-bold">{nameToCamelCase(atoApostiladoPadrao)}</span>
                </div>
              }
            >
              <div className="card-designacao">

                <Accordion
                  type="multiple"
                  defaultValue={["portarias-designacao", "servidor-indicado"]}
                >




                  <CustomAccordionItem
                    title="Portarias de designação"
                    color="purple"
                    value="portarias-designacao"
                  >
                    <PortariaDesigacaoFields
                      isLoading={isLoading}
                    />
                  </CustomAccordionItem>

                </Accordion>



                <span className="text-[#333] text-[14px] font-bold">Texto para a apostila</span>
                <TextoPraApostila
                  form={form as unknown as UseFormReturn<FieldValues>}
                  disableFields={false}
                />

                <span className="text-[#333] text-[14px] font-bold">Informações adicionais</span>
                <InformacoesAdicionais
                  form={form as unknown as UseFormReturn<FieldValues>}
                  onChangeDescricao={
                    (value) => {
                      console.log(value);
                    }}
                  onValueChangeDetalheParaQuadroDeHistoricoPorAno={(value) => {
                    console.log(value);
                  }}
                  disableFields={false}
                />
              </div>

              <div className="w-full flex justify-end pt-[2rem]">
                <div className="w-[200px]">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full flex items-center justify-center gap-6"
                    variant="destructive"
                    onClick={async () => {
                      const isValid = await form.trigger();
                      if (!isValid) return;
                      handleGerarPortaria();
                    }}>
                    Gerar texto SEI
                  </Button>
                </div>
              </div>

              {mostrarEditor && (
                <EditorSEI
                  html={htmlPortaria}
                  titulo="PORTARIA"
                  labelBotao="Salvar"
                  tipoBotao="submit"
                  testId="botao-proximo"
                />
              )}
            </Card>

          )}
        </form>
      </FormProvider>
    </>
  );
}