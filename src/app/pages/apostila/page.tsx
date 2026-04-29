"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, message, Tooltip } from "antd";
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
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { Servidor } from "@/types/designacao-unidade";
import Designacao from "@/assets/icons/Designacao";
import PortariaApostilaFields from "@/components/dashboard/apostila/PortariaApostilaFields/PortariaApostilaFields";
import { FormControl, FormField, FormLabel, FormItem } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import formSchemaApostila, { formSchemaApostilaData } from "./schema";
import { useSalvarApostila } from "@/hooks/useSalvarApostila";

export default function ApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const salvarApostila = useSalvarApostila();
  const router = useRouter();

  const { data: designacao, isLoading } = useFetchDesignacoesById(Number(id));

  const form = useForm<formSchemaApostilaData>({
    resolver: zodResolver(formSchemaApostila),
    defaultValues: {
      apostila: {
        numero_sei: "",
        doc: "",
        observacoes: "",
        tipo_apostila: "designacao",
      },
    },
  });

  const dadosPortaria = useMemo(
    () => getDadosPortaria(designacao),
    [designacao]
  );

  const dadosPortariaCessacao = useMemo(
    () => getDadosPortariaCessacao(designacao),
    [designacao]
  );

  const dadosIndicado: Servidor | null = useMemo(
    () => getDadosIndicado(designacao),
    [designacao]
  );

  const desabilita_radio = !!designacao?.cessacao?.apostila || !dadosPortariaCessacao;

  useEffect(() => {
    if (!designacao) return;
    form.reset({
      apostila: {
        numero_sei: "",
        doc: "",
        tipo_apostila: "designacao",
        observacoes: "",
      },
    });
  }, [designacao, form]);

  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [htmlPortaria, setHtmlPortaria] = useState("");

  const gerarDados = (values: formSchemaApostilaData) => {
      const isCessacao = values.apostila.tipo_apostila === "cessacao";
      
      const fonteDados = isCessacao ? designacao?.cessacao : designacao;

      return {
        sei: values.apostila.numero_sei,
        dre: designacao?.dre_nome ?? "-",
        eh: designacao?.codigo_hierarquico ?? "-",
        doc: values.apostila.doc,
        tipo_apostila: values.apostila.tipo_apostila,
        
        portaria_designacao: fonteDados?.numero_portaria ?? "-",
        ano: fonteDados?.ano_vigente ?? "-",
        doc_designacao: fonteDados?.doc ?? "-",
        sei_designacao: isCessacao ? designacao?.cessacao?.sei_numero : designacao?.sei_numero ?? "-",
        
        nome_indicado: designacao?.indicado_nome_servidor ?? "-",
        rf: formatarRF(designacao?.indicado_rf ?? "-"),
        vinculo: designacao?.indicado_vinculo ?? "-",
        cargo_base: nameToCamelCase(designacao?.indicado_cargo_base ?? "-"),
        cargo: nameToCamelCase(designacao?.indicado_cargo_sobreposto ?? "-"),
        ue: nameToCamelCaseUe(designacao?.indicado_local_exercicio ?? "-"),
        observacoes: values.apostila.observacoes ?? "",
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
      const designacaoId = Number(id);
      await salvarApostila.mutateAsync({
        values,
        designacaoId: designacaoId
      });
      message.success("Apostila salva com sucesso!");
      router.push("/pages/listagem-designacoes");
    } catch (error: unknown) {
      message.error("Erro ao salvar: " + error);
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
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Apostila" }]}
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
            <Card className="mt-4">
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
                  onSubmitEditarServidor={() => {}}
                />

                <div className="p-4 pt-4 border-t mt-4 mb-8">
                  <div className="flex flex-col gap-6">
                    <FormField
                      control={form.control}
                      name="apostila.tipo_apostila"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="font-bold text-[#42474a] text-lg">
                            Selecione o tipo de Apostila:
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-row gap-8"
                              disabled={desabilita_radio}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="designacao" id="designacao" />
                                <Label htmlFor="designacao" className="font-normal cursor-pointer">
                                  Designação
                                </Label>
                              </div>
                              <Tooltip 
                                placement="topLeft"
                                title={desabilita_radio ? 'A cessação já possui uma apostila Ativa ou não foi encontrada.' : ''}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cessacao" id="cessacao" />
                                  <Label htmlFor="cessacao" className="font-normal cursor-pointer">
                                    Cessação
                                  </Label>
                                </div>
                              </Tooltip>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <CustomAccordionItem title="Portaria de Apostila" value="portaria-apostila" color="purple">
                  <PortariaApostilaFields />
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
                        Trechos para o SEI
                      </Button>
                    </div>
                  </div>
                </CustomAccordionItem>
              </Accordion>

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