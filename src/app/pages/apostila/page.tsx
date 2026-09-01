"use client";

import { useState } from "react";
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
import Designacao from "@/assets/icons/Designacao";

import formSchemaApostila, { formSchemaApostilaData } from "./schema";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import InformacoesAdicionais from "@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais";

export default function ApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const origem = searchParams.get("origem");
  const atoApostiladoPadrao = origem === "cessacao" ? "cessacao" : "designacao";
  const router = useRouter();
  const notification = useAppNotification();

  const { data: designacao, isLoading } = useFetchDesignacoesById(Number(id));
  const form = useForm<formSchemaApostilaData>({
    resolver: zodResolver(formSchemaApostila),
    defaultValues: {
      numero_sei: "1",
      doc: "",
      observacao: "",
      ato_apostilado: atoApostiladoPadrao,
      informacoes_adicionais: "",
      detalhe_para_quadro_de_historico_por_ano: false,
    },
    mode: "onChange",
  });






  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [htmlPortaria, setHtmlPortaria] = useState("");

  const gerarDados = (values: formSchemaApostilaData) => {
    const isCessacao = values.ato_apostilado === "cessacao";

    const fonteDados = isCessacao ? designacao?.cessacao : designacao;

    return {
      sei: values.numero_sei,
      dre: designacao?.dre_nome ?? "-",
      eh: designacao?.codigo_hierarquico ?? "-",
      doc: values.doc,
      ato_apostilado: values.ato_apostilado,

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
      observacao: values.observacao ?? "",
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

  const title = (
    <span>
      Apostila - Servidor indicado -{" "}
      <span className="text-[#B22B2A] font-semibold">
        {designacao?.indicado_nome_servidor ?? "-"}
      </span>
    </span>
  );

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Atos Administrativos", href: "/pages/atos-administrativos" }, { title: "Apostila" }]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#B22B2A]" />
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>


            <Card
              
              className="mt-4 m-0"
            >
              <div className="card-designacao">
              <span className="text-[#333] text-[14px] font-bold pb-4">Informações adicionais</span>
                <InformacoesAdicionais
                  form={form as unknown as UseFormReturn<FieldValues>}
                  onChangeDescricao={
                    (value) => {
                      console.log(value);
                    }}
                  onValueChangeDetalheParaQuadroDeHistoricoPorAno={(value) => {
                    console.log(value);
                  }}
                  disableFields={true}
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
          </form>
        </FormProvider>
      )}
    </>
  );
}