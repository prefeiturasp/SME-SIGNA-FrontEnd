"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "antd";
import { Loader2 } from "lucide-react";
import { nameToCamelCase, formatarRF } from "@/utils/portarias/formatadores";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import formSchemaApostila, { formSchemaApostilaData } from "./schema";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import InformacoesAdicionais from "@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import { Accordion } from "@/components/ui/accordion";
import PortariaDesigacaoFields from "@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields";
import CamposPesquisaUnidade from "@/components/dashboard/Designacao/PesquisaUnidade/CamposPesquisaUnidade";
import CamposEditarServidor from "@/components/dashboard/Designacao/ModalEditarServidor/CamposEditarServidor";
import { useFetchCargos } from "@/hooks/useCargos";
import { SelectField } from "@/components/ui/FieldsForm";
import { FormLabel, FormItem, FormControl, FormField, FormMessage } from "@/components/ui/form";
import { SimpleEditor } from "@/components/ui/tiptap-templates/simple/simple-editor";

export default function ApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const origem = searchParams.get("origem");
  const atoApostiladoPadrao = origem === "cessacao" ? "cessação" : "designação";
  const router = useRouter();
  const notification = useAppNotification();

  const { data: designacao, isLoading } = useFetchDesignacoesById(Number(id));
  const { data: cargosData = [] } = useFetchCargos();
  const cargos = cargosData.map(cargo => ({
    value: cargo.codigoCargo.toString(),
    label: cargo.nomeCargo,
  }));



  const form = useForm<formSchemaApostilaData>({
    resolver: zodResolver(formSchemaApostila),
    defaultValues: {
      dre: "",
      dre_nome: "",
      ue: "",
      ue_nome: "",
      codigo_hierarquico: "",

      informacoes_adicionais: "",
      detalhe_para_quadro_de_historico_por_ano: false,
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

      // campos cargo disponível
      nome_civil: "",
      nome_servidor: "",
      rf: "",
      vinculo: 0,
      cargo_base: "",
      cargo_sobreposto_funcao_atividade: "",
      local_de_exercicio: "",
      lotacao: "",
      categoria: "",
      cursos_titulos: "",
      laudo_medico: "",
      cd_cargo_base: "",
    },
    mode: "onChange",
  });



  useEffect(() => {
    if (designacao && !form.formState.isDirty) {

      form.reset({
        texto_portaria: "A presente portaria apostilada,",
        ato_apostilado: atoApostiladoPadrao,

        // campos portaria de designacao
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

        // campos unidade proponente
        dre: designacao?.dre ?? '-',
        dre_nome: designacao?.dre_nome,
        ue: designacao?.ue ?? '-',
        ue_nome: designacao?.unidade_proponente,
        codigo_hierarquico: designacao?.codigo_hierarquico,


        // campos servidor indicado
        nome_civil: designacao?.indicado_nome_civil ?? "",
        nome_servidor: designacao?.indicado_nome_servidor ?? "-",
        rf: formatarRF(designacao?.indicado_rf ?? "-"),
        vinculo: designacao?.indicado_vinculo ?? "-",
        cargo_base: nameToCamelCase(designacao?.indicado_cargo_base ?? "-"),

        cd_cargo_base: designacao?.cargo_vaga?.toString() ?? "",
        cargo_sobreposto_funcao_atividade: nameToCamelCase(designacao?.indicado_cargo_sobreposto ?? "-"),
        local_de_exercicio: nameToCamelCase(designacao?.indicado_local_exercicio ?? "-"),
        lotacao: nameToCamelCase(designacao?.indicado_lotacao ?? "-"),
        categoria: designacao?.indicado_categoria ?? "-",
        cursos_titulos: "-",
        laudo_medico: "Indisponível",
      },);

    }
  }, [designacao, form]);



  const [mostrarEditor, setMostrarEditor] = useState(false);


  const handleGerarPortaria = () => {
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
                  defaultValue={["portarias-designacao", "unidade-proponente", "servidor-indicado", "cargo-disponivel"]}
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

                  <CustomAccordionItem
                    title="Unidade Proponente"
                    color="blue"
                    value="unidade-proponente"
                  >
                    <CamposPesquisaUnidade
                    />
                  </CustomAccordionItem>

                  <CustomAccordionItem
                    title="Servidor Indicado"
                    color="gold"
                    value="servidor-indicado"
                  >
                    <CamposEditarServidor
                    />
                  </CustomAccordionItem>



                  <CustomAccordionItem
                    title="Cargo disponível"
                    color="green"
                    value="cargo-disponivel"
                  >
                    <div className="grid grid-cols-4 " >
                      <SelectField
                        register={form.register}
                        control={form.control}
                        name="cd_cargo_base"
                        label="Cargo"
                        placeholder="Selecione"
                        data-testid="select-codigo-cargo-eol"
                        options={cargos}
                        showBlankSpace={false}
                        disabled={false}
                      />
                    </div>
                  </CustomAccordionItem>
                </Accordion>

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
                    disabled={!form.formState.isValid}
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
                <div className="mb-2 mt-4">
                  <FormField
                    {...form.register('texto_portaria')}
                    control={form.control}
                    name="texto_portaria"
                    render={({ field, fieldState }) => (
                      <FormItem >
                        <div className="flex flex-col gap-2 mb-4 mt-4">
                          <FormLabel className="required text-[#313131] font-bold">
                            Texto SEI*
                          </FormLabel>
                          <FormLabel className="required font-[400]">
                            Digite o texto SEI que será publicado no Diário Oficial (D.O).
                          </FormLabel>
                        </div>
                        <FormControl>
                          <SimpleEditor
                            hasError={!!fieldState.error}
                            onChange={field.onChange}
                            content={field.value}
                          />
                        </FormControl>
                        <FormMessage showBlankSpace />
                      </FormItem>
                    )}
                  />
                  <div className="w-full flex justify-end pt-8">
                    <div >
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full flex items-center justify-center px-6"
                        variant="destructive"
                        data-testid="button-salvar-portaria-apostila"
                        disabled={!form.formState.isValid}
                        
                      >
                        <p className="text-[16px] font-bold">Salvar</p>
                      </Button>
                    </div>
                  </div>
                </div>
              )}


            </Card>
          )}

        </form>
      </FormProvider>
    </>
  );
}