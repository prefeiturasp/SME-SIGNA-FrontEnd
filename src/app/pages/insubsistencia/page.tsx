"use client";

import { useEffect, useMemo, useState} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, message, Tooltip } from "antd";
import { Loader2 } from "lucide-react";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";


import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import ResumoPortariaDesigacao from "@/components/dashboard/Designacao/ResumoPortariaDesigacao";

import { useRouter, useSearchParams } from "next/navigation";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { Servidor } from "@/types/designacao-unidade";
import Designacao from "@/assets/icons/Designacao";
import ResumoPortariaCessacao from "@/components/dashboard/Designacao/ResumoPortariaCessacao";
import PortariaInsubsistenciaFields from "@/components/dashboard/Insubsistencia/PortariaInsubsistenciaFields/PortariaInsubsistenciaFields";
import { FormControl, FormField, FormLabel, FormItem } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import formSchemaInsubsistencia, { formSchemaInsubsistenciaData } from "./schema";
import { useSalvarInsubsistencia } from "@/hooks/useSalvarInsubsistencia";





export default function InsubsistenciaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const salvarInsubsistencia = useSalvarInsubsistencia();
  const router = useRouter();


  const { data: designacao, isLoading } =
    useFetchDesignacoesById(Number(id));

  const form = useForm<formSchemaInsubsistenciaData>({
    resolver: zodResolver(formSchemaInsubsistencia),
    defaultValues: {
      insubsistencia: {
        numero_portaria: "",
        ano: new Date().getFullYear().toString(),
        numero_sei: "",
        doc: "",
        observacoes: "",
        tipo_insubsistencia: "designacao",
      },
    },
  });

  const dadosPortaria = useMemo(() => {
    if (!designacao) return null;

    return {
      numero_portaria: designacao.numero_portaria,
      ano_vigente: designacao.ano_vigente,
      sei_numero: designacao.sei_numero,
      doc: designacao.doc,
      data_inicio: designacao.data_inicio,
      data_fim: designacao.data_fim,
      carater_excepcional: designacao.carater_excepcional,
      impedimento_substituicao: designacao.impedimento_substituicao,
      motivo_afastamento: designacao.motivo_afastamento,
      pendencias: designacao.pendencias,
    };
  }, [designacao]);

  const dadosPortariaCessacao = useMemo(() => {
    if (!designacao?.cessacao) return null;

    return designacao.cessacao;
  }, [designacao]);

  const dadosIndicado: Servidor | null = useMemo(() => {
    if (!designacao) return null;

    return {
      rf: designacao.indicado_rf,
      nome_servidor: designacao.indicado_nome_servidor,
      nome_civil: designacao.indicado_nome_civil,
      vinculo: designacao.indicado_vinculo,
      cargo_base: designacao.indicado_cargo_base,
      lotacao: designacao.indicado_lotacao,
      cargo_sobreposto_funcao_atividade:
        designacao.indicado_cargo_sobreposto,
      local_de_exercicio: designacao.indicado_local_exercicio,
      local_de_servico: designacao.indicado_local_servico,
    } as Servidor;
  }, [designacao]);
  const desabilita_radio = !!designacao?.cessacao?.insubsistencia || !dadosPortariaCessacao;

  useEffect(() => {
    if (!designacao) return;

    form.reset({
      insubsistencia: {
        numero_portaria: "",
        numero_sei: "",
        ano: new Date().getFullYear().toString(),
        doc: "",
        tipo_insubsistencia: "designacao",
        observacoes: "",
      },
    });
  }, [designacao, form]);

  const [mostrarEditor, setMostrarEditor] = useState(false);

  const handleGerarPortaria = () => {

    setMostrarEditor(true);
  };



  const onSubmit = async (values: formSchemaInsubsistenciaData) => {
    try {
      const designacaoId = Number(id);

      await salvarInsubsistencia.mutateAsync({
        values,
        designacaoId: designacaoId
      });

      message.success("Insubsistência salva com sucesso!");

      router.push("/pages/listagem-designacoes");

    } catch (error: unknown) {
      const duracao_em_segundos = 3;
      message.error("Erro ao salvar: " + error, duracao_em_segundos);
    }
  };

  const title = (
    <span>
      Tornar Insubsistente - Servidor indicado -{" "}
      <span className="text-[#B22B2A] font-semibold">
        {designacao?.indicado_nome_servidor ?? "-"}
      </span>
    </span>
  );

 
  return (
    <>
   
      <PageHeader
        title={title}
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designação", href: "/pages/listagem-designacoes" }, { title: "Tornar Insubsistente" }]}
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
                "portaria-insubsistencia",
              ]}
            >
              <CustomAccordionItem title="Servidor indicado" value="servidor-indicado" color="gold">
                {dadosIndicado && (
                  <ResumoDesignacaoServidorIndicado defaultValues={dadosIndicado} onSubmitEditarServidor={() => { }} />
                )}
              </CustomAccordionItem>
              <CustomAccordionItem title="Portaria de designação" value="portaria-designacao" color="purple">
                {dadosPortaria && (
                  <ResumoPortariaDesigacao defaultValues={dadosPortaria} showExtraFields={false} />
                )}
              </CustomAccordionItem>



              <CustomAccordionItem title="Portarias de Cessação" value="portarias-cessacao" color="green">
                {dadosPortariaCessacao ? (
                  <ResumoPortariaCessacao defaultValues={dadosPortariaCessacao} />
                ) : (
                  <div className="text-center text-[#777] p-4">
                    Não há portaria de cessão
                  </div>
                )}
              </CustomAccordionItem>
              <div className="p-4 pt-4 border-t mt-4 mb-8">

                <div className="flex flex-col gap-6">
                  <FormField
                    control={form.control}
                    name="insubsistencia.tipo_insubsistencia"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-bold text-[#42474a] text-lg">
                          Selecione o tipo de insubsistência:
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val) => {
                              field.onChange(val);

                            }}
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
                            <Tooltip placement="topLeft"
                              title={
                                desabilita_radio ?
                                  'A cessação já possui insubsistência ou não foi encontrada.'
                                  : ''}>
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
              <CustomAccordionItem title="Portaria de Insubsistência" value="portaria-insubsistencia" color="purple">
                <PortariaInsubsistenciaFields />
                <div className="w-full flex justify-end pt-[2rem]">
                  <div className="w-[200px]">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full flex items-center justify-center gap-6"
                      variant="destructive"
                      onClick={async () => {
                        const isValid = await form.trigger("insubsistencia");

                        if (!isValid) return;

                        handleGerarPortaria();
                      }}>
                      Trechos para o SEI
                    </Button>
                  </div>
                </div>
              </CustomAccordionItem>
            </Accordion>

            {/* BOTÃO */}

            {/* EDITOR */}
            {mostrarEditor && (
              <div className="flex flex-col gap-4 mt-4">



                {/* 🔹 Botão salvar só aparece depois */}
                <div className="w-full flex justify-end pt-[2rem]">
                  <div className="w-[200px]">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full flex items-center justify-center gap-6"
                      variant="destructive"
                      data-testid="botao-proximo"
                    >
                      <p className="text-[16px] font-bold">Salvar</p>
                    </Button>
                  </div>
                </div>

              </div>
            )}

          </Card>
        </form>
      </FormProvider>)}
    </>
  );
}