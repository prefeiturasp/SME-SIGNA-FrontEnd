"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, FieldValues, UseFormReturn, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "antd";
import { Loader2 } from "lucide-react";
import { nameToCamelCase, formatarRF } from "@/utils/portarias/formatadores";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { useSearchParams, useRouter } from "next/navigation";
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
import { SelectField, EnumCheckbox, InputField } from "@/components/ui/FieldsForm";
import { FormLabel, FormItem, FormControl, FormField, FormMessage } from "@/components/ui/form";
import { SimpleEditor } from "@/components/ui/tiptap-templates/simple/simple-editor";
import PortariaCessacaoFields from "@/components/dashboard/Cessacao/PortariaCessacaoFields/PortariaCessacaoFields";
import { useSalvarApostila } from "@/hooks/useSalvarApostila";
import { ApostilaAlteracoes, ApostilaBody, ApostilaDetailRead } from "@/types/apostila";
import PortariaApostilaFields from "@/components/dashboard/apostila/PortariaApostilaFields/PortariaApostilaFields";
import { gerarFormValuesCessacao } from "../cessacao/page";
import { useFetchApostilaById } from "@/hooks/useVisualizarApostila";


const defaultValues = {

  apostila: {
    numero_sei: "",
    doc: "",
    observacao: "",
    numero_portaria: "",
  },

  dre: "",
  dre_nome: "",
  ue: "",
  ue_nome: "",
  codigo_hierarquico: "",

  informacoes_adicionais: "",
  detalhe_para_quadro_de_historico_por_ano: true,

  portaria_designacao: "",
  ano: new Date().getFullYear().toString(),
  numero_sei: "",
  doc: "",
  a_partir_de: new Date(),
  designacao_data_final: null,
  carater_excepcional: EnumCheckbox.NAO,
  impedimento_substituicao: "",
  impedimento_label: "",
  com_afastamento: EnumCheckbox.NAO,
  motivo_afastamento: "",
  possui_pendencia: EnumCheckbox.NAO,
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
  titular_cargo_sobreposto: "",


  cessacao: {
    numero_portaria: "",
    ano: new Date().getFullYear().toString(),
    numero_sei: "",
    a_pedido: EnumCheckbox.NAO,
    data_inicio: new Date(),
    remocao: EnumCheckbox.NAO,
    aposentadoria: EnumCheckbox.NAO,
    doc: "",
  },

};

const normalizarDetalheParaQuadroDeHistoricoPorAno = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";

  return true;
};

function BotaoGerarTextoSei({
  form,
  onClick,
}: Readonly<{
  form: UseFormReturn<formSchemaApostilaData>;
  onClick: () => Promise<void>;
}>) {
  const { errors } = useFormState({ control: form.control });

  
  return (
    <Button
      type="button"
      size="lg"
      className="w-full flex items-center justify-center gap-6"
      variant="destructive"
      disabled={Object.keys(errors).length > 0}
      onClick={onClick}
    >
      Gerar texto SEI
    </Button>
  );
}

function BotaoSalvarPortariaApostila({
  form,
}: Readonly<{
  form: UseFormReturn<formSchemaApostilaData>;
}>) {
  const { isValid } = useFormState({ control: form.control });

  return (
    <Button
      type="submit"
      size="lg"
      className="w-full flex items-center justify-center px-6"
      variant="destructive"
      data-testid="button-salvar-portaria-apostila"
      disabled={!isValid}
    >
      <p className="text-[16px] font-bold">Salvar</p>
    </Button>
  );
}



export default function ApostilaPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const apostilaId = searchParams.get("apostila_id");
  const origem = searchParams.get("origem");
  const router = useRouter();
  const atoApostiladoDisplay = origem === "cessacao" ? "cessação" : "designação";
  const notification = useAppNotification();
  const salvarApostila = useSalvarApostila();
  const { data: apostilaData, isLoading: isLoadingApostila } = useFetchApostilaById(Number(apostilaId));

  const { data: designacaoData, isLoading: isLoadingDesignacao } = useFetchDesignacoesById(Number(id));
  const cessacao = apostilaData ? apostilaData.cessacao : designacaoData?.cessacao;
  const designacao = apostilaData ? apostilaData.designacao : designacaoData;


  const { data: cargosData = [] } = useFetchCargos();
  const cargos = useMemo(
    () =>
      cargosData.map(cargo => ({
        value: cargo.codigoCargo.toString(),
        label: cargo.nomeCargo,
      })),
    [cargosData]
  );



  const form = useForm<formSchemaApostilaData>({
    resolver: zodResolver(formSchemaApostila),
    defaultValues: {
      ...defaultValues, ato_apostilado: origem ?? "",
    },
    mode: "onChange",
  });





  const [mostrarEditor, setMostrarEditor] = useState(false);


  const handleClickGerarTextoSei = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    setMostrarEditor(true);
  }, [form]);

  const getCampoMapeadoCessacao = (field: string) => {
    const camposCessacao = {
      "ano": "ano_vigente",
      "numero_sei": "sei_numero",
      "data_inicio": "data_cessacao",
    }

    const campoMapeado = camposCessacao[field as keyof typeof camposCessacao];
    return campoMapeado || field;
  };


  const getCampoMapeadoDesignacao = (field: string) => {
    const camposDesignacao = {
      "portaria_designacao": "numero_portaria",
      "ano": "ano_vigente",


      "numero_sei": "sei_numero",
      "a_partir_de": "data_inicio",
      "designacao_data_final": "data_fim",

      "motivo_pendencia": "pendencias",
      "ue_nome": "unidade_proponente",
      "texto_portaria": "texto_sei",

      "cd_cargo_base": "cargo_vaga",

      "nome_civil": "indicado_nome_civil",
      "nome_servidor": "indicado_nome_servidor",
      "impedimento_substituicao": "impedimento_substituicao_id",


    }

    const campoMapeado = camposDesignacao[field as keyof typeof camposDesignacao];
    return campoMapeado || field;
  };
  const gerarAlteracoes = (formValues: formSchemaApostilaData) => {

    delete formValues.impedimento_label;
    const values = {
      ...formValues,
      "a_partir_de": formValues.a_partir_de.toISOString().split("T")[0],
      "detalhe_para_quadro_de_historico_por_ano": formValues.detalhe_para_quadro_de_historico_por_ano ? "True" : "False",
      "designacao_data_final": formValues.designacao_data_final ? formValues.designacao_data_final.toISOString().split("T")[0] : null,
      "carater_excepcional": formValues.carater_excepcional === EnumCheckbox.SIM ? "True" : "False",

      "com_afastamento": formValues.com_afastamento === EnumCheckbox.SIM ? "True" : "False",
      "possui_pendencia": formValues.possui_pendencia === EnumCheckbox.SIM ? "True" : "False",
      "cessacao": {
        ...formValues.cessacao,
        "a_pedido": formValues.cessacao.a_pedido === EnumCheckbox.SIM ? "True" : "False",
        "data_inicio": formValues.cessacao.data_inicio ? formValues.cessacao.data_inicio.toISOString().split("T")[0] : null,
        "remocao": formValues.cessacao.remocao === EnumCheckbox.SIM ? "True" : "False",
        "aposentadoria": formValues.cessacao.aposentadoria === EnumCheckbox.SIM ? "True" : "False",
      },
    };
    

    const alteracoes: ApostilaAlteracoes[] = [];    
    Object.keys(form.formState.dirtyFields).forEach(field => {

      const valorDoCampo = values[field as keyof formSchemaApostilaData];
      // remove campos da apostila
      if (valorDoCampo === undefined || field.includes("apostila") ) {
        return;
      }

      // campos da portaria de cessação
      if (field.includes("cessacao")) {

        return Object.keys(values['cessacao']).forEach(cessacaoField => {
          const valorDoCampoCessacao = values['cessacao'][cessacaoField];
          if (["", undefined, null].includes(valorDoCampoCessacao)) {
            return;
          }
          const campoMapeadoCessacao = getCampoMapeadoCessacao(cessacaoField);
          alteracoes.push({
            "campo_alterado": campoMapeadoCessacao,
            "valor_novo": valorDoCampoCessacao,
          });
        });
      }



      const campoMapeado = getCampoMapeadoDesignacao(field);

      // campos da portaria de designação na apostila de cessação
      if (origem === "cessacao" && !field.includes("cessacao")) {
        return alteracoes.push({
          "campo_alterado": campoMapeado,
          "valor_novo": values[field as keyof formSchemaApostilaData],
          "tipo_ato_alvo": "DESIGNACAO"
        });

      }



      // campos default
      alteracoes.push({
        "campo_alterado": campoMapeado,
        "valor_novo": values[field as keyof formSchemaApostilaData]
      });

    });

    return alteracoes;
  }
  const onSubmit = async (values: formSchemaApostilaData) => {
    try {
      let body: ApostilaBody;
      const alteracoes = gerarAlteracoes(values);
      if (apostilaId) {
        // edição somente dos campos de portaria de apostila e texto SEI

        body = {
          id: Number(apostilaId),
          sei_numero: values.apostila.numero_sei,
          numero_portaria: values.apostila.numero_portaria,
          doc: values.apostila.doc,
          observacao: values.apostila.observacao,
          texto_sei: values.texto_portaria,
          alteracoes: alteracoes,
        };
      } else {
        // criação de apostila é obrigatório ter ao menos uma alteração       
        if (alteracoes.length === 0) {
          notification.error({ title: "Não há alterações para salvar", description: "Adicione ao menos uma alteração para salvar a apostila" });
          return;
        }

        const ato_pai = origem === "designacao" ? Number(id) : designacao?.cessacao?.id ?? 0;

        body = {
          ato_pai: ato_pai,
          sei_numero: values.apostila.numero_sei,
          numero_portaria: values.apostila.numero_portaria,
          doc: values.apostila.doc,
          observacao: values.apostila.observacao,
          alteracoes: alteracoes,
          texto_sei: values.texto_portaria,
        };
      }


      await salvarApostila.mutateAsync({ body });
      notification.success({ title: "Apostila salva com sucesso!" });
      router.push("/pages/atos-administrativos");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      notification.error({ title: msg });
    }
  };


  const gerarFormValuesApostila = (apostila: ApostilaDetailRead | undefined) => {
    return {
      numero_portaria: apostila?.numero_portaria?.toString() ?? "",
      numero_sei: apostila?.sei_numero ?? "",
      doc: apostila?.doc ?? "",
      observacao: apostila?.observacao ?? "",
    };
  };

  useEffect(() => {
    if (designacao && !form.formState.isDirty) {


      const cessacaoFieldsValues = gerarFormValuesCessacao(cessacao ?? undefined);
      const apostilaFieldsValues = gerarFormValuesApostila(apostilaData);

      
      form.reset({
        ...defaultValues,

        ato_apostilado: origem ?? "",

        // campos portaria de designacao
        portaria_designacao: String(designacao?.numero_portaria ?? ""),
        ano: designacao?.ano_vigente,
        numero_sei: designacao?.sei_numero ?? "",
        doc: designacao?.doc ?? "",
        a_partir_de: designacao?.data_inicio ? new Date(designacao.data_inicio.replaceAll("-", '/')) : new Date(),
        designacao_data_final: designacao?.data_fim ? new Date(designacao.data_fim.replaceAll("-", '/')) : null,
        carater_excepcional: designacao?.carater_excepcional ? EnumCheckbox.SIM : EnumCheckbox.NAO,
        impedimento_substituicao: designacao?.impedimento_substituicao?.toString() ?? null,
        com_afastamento: designacao?.com_afastamento ? EnumCheckbox.SIM : EnumCheckbox.NAO,
        motivo_afastamento: designacao?.motivo_afastamento,
        possui_pendencia: designacao?.possui_pendencia ? EnumCheckbox.SIM : EnumCheckbox.NAO,
        motivo_pendencia: designacao?.pendencias,
        informacoes_adicionais: designacao?.informacoes_adicionais,
        detalhe_para_quadro_de_historico_por_ano: normalizarDetalheParaQuadroDeHistoricoPorAno(
          designacao.detalhe_para_quadro_de_historico_por_ano,
        ),
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

        // campos servidor titular
        titular_cargo_sobreposto: nameToCamelCase(designacao.titular_cargo_sobreposto ? designacao.titular_cargo_sobreposto : designacao.titular_cargo_base),


        // campos portaria de cessação
        cessacao: cessacaoFieldsValues,

        // campos apostila
        apostila: apostilaFieldsValues,
        texto_portaria: apostilaData?.texto_sei ?? "A presente portaria apostilada,",
      });
    }
  }, [designacao, cessacao, apostilaData, form, origem]);
 
  
  

  return (
    <>
      <PageHeader
        title={`Apostila de ${atoApostiladoDisplay}`}
        breadcrumbs={[{ title: "Início", href: "/" },
        { title: `Apostila de ${atoApostiladoDisplay}` }]}
        showBackButton={true}
      />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {isLoadingDesignacao || isLoadingApostila ? (
            <div className="flex justify-center items-center h-[60vh]">
              <Loader2 className="h-10 w-10 animate-spin text-[#B22B2A]" />
            </div>
          ) : (


            <Card
              className="mt-4 m-0"
              title={
                <div className="flex justify-between items-center">
                  <span className="text-[#333] text-[14px] font-bold">{nameToCamelCase(atoApostiladoDisplay)}</span>
                </div>
              }
            >
              <div className="card-designacao">

                <Accordion
                  type="multiple"
                  defaultValue={["portaria-apostila", "portarias-designacao", "unidade-proponente", "servidor-indicado", "cargo-disponivel", "cargo-vago", "portarias-cessacao"]}
                >

                  <CustomAccordionItem title="Portaria de Apostila" value="portaria-apostila" color="silver">
                    <PortariaApostilaFields />
                  </CustomAccordionItem>

                  <CustomAccordionItem
                    title="Portarias de designação"
                    color="purple"
                    value="portarias-designacao"
                  >
                    <PortariaDesigacaoFields
                      disabled={false}
                      isLoading={isLoadingDesignacao}
                    />
                  </CustomAccordionItem>

                  <CustomAccordionItem
                    title="Unidade Proponente"
                    color="blue"
                    value="unidade-proponente"
                  >
                    <CamposPesquisaUnidade disabled={false} />
                  </CustomAccordionItem>

                  <CustomAccordionItem
                    title="Servidor Indicado"
                    color="gold"
                    value="servidor-indicado"
                  >
                    <CamposEditarServidor
                      disabled={false}
                    />
                  </CustomAccordionItem>

                  {designacao?.tipo_vaga === "VAGO" && (
                    <CustomAccordionItem
                      title="Cargo vago"
                      color="green"
                      value="cargo-vago"
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
                  )}

                  {designacao?.tipo_vaga === "DISPONIVEL" && (
                    <CustomAccordionItem
                      title="Cargo disponível"
                      color="green"
                      value="cargo-disponivel"
                    >
                      <div className="grid grid-cols-4 " >
                        <InputField
                          register={form.register}
                          control={form.control}
                          name="titular_cargo_sobreposto"
                          label="Cargo"
                          data-testid="input-cargo-base"
                          disabled
                        />
                      </div>
                    </CustomAccordionItem>
                  )}


                  {origem === "cessacao" && (
                    <CustomAccordionItem title="Portaria de cessação" value="portarias-cessacao" color="silver">
                      <PortariaCessacaoFields disabled={false} />
                    </CustomAccordionItem>
                  )}

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

              <div className="w-full flex justify-end pt-8">
                <div className="w-50">
                  <BotaoGerarTextoSei form={form} onClick={handleClickGerarTextoSei} />
                </div>
              </div>


              {mostrarEditor && (
                <div className="mb-2 mt-4">
                  <FormField
                    control={form.control}
                    name="texto_portaria"
                    render={({ field, fieldState }) => (
                      <FormItem >
                        <div className="flex flex-col gap-2 mb-4 mt-4">
                          <FormLabel className="required text-[#313131] font-bold">
                            Texto SEI*
                          </FormLabel>
                          <FormLabel className="required font-normal">
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
                      <BotaoSalvarPortariaApostila form={form} />
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