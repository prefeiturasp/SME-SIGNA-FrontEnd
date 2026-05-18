"use client";
import { useEffect, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "antd";

// UI Components
import { Accordion } from "@/components/ui/accordion";

// Custom Components
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import PortariaDesigacaoFields from "@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields";
import ResumoPesquisaDaUnidade from "@/components/dashboard/Designacao/ResumoPesquisaDaUnidade";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import SelecaoServidorIndicado from "@/components/dashboard/Designacao/SelecaoServidorIndicado/SelecaoServidorIndicado";

// Context, Icons & Hooks
import { FormDesignacaoEServidorIndicado, useDesignacaoContext } from "../DesignacaoContext";
import Designacao from "@/assets/icons/Designacao";
import Historico from "@/assets/icons/Historico";
import useServidorDesignacao from "@/hooks/useServidorDesignacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";

// Schema
import formSchemaDesignacaoPasso2, {
  formSchemaDesignacaoPasso2Data
} from "./schema";
import ModalUltimaDesignacao from "@/components/dashboard/Designacao/ModalHistoricoUltimaDesignacao/ModalHistoricoUltimaDesignacao";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEditarServidorData } from "@/components/dashboard/Designacao/ModalEditarServidor/schema";
import { Servidor } from "@/types/designacao-unidade";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";

export default function DesignacoesPasso2() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");


  const { data: designacao, isLoading: isLoadingDesignacao } = useFetchDesignacoesById(
    Number(id)
  );
  const { formDesignacaoData, setFormDesignacaoData } =
    useDesignacaoContext();
  const [isPopulateScreen, setIsPopulateScreen] = useState(false);
  const hasPopulatedFromApi = useRef(false);

  const form = useForm<formSchemaDesignacaoPasso2Data>({
    resolver: zodResolver(formSchemaDesignacaoPasso2),
    defaultValues: {
      portaria_designacao: formDesignacaoData?.portaria_designacao ?? "",
      numero_sei: formDesignacaoData?.numero_sei ?? "",
      a_partir_de: formDesignacaoData?.a_partir_de ?? new Date(),
      designacao_data_final: formDesignacaoData?.designacao_data_final ?? null,
      ano: formDesignacaoData?.ano ?? new Date().getFullYear().toString(),
      doc: formDesignacaoData?.doc ?? "",
      impedimento_substituicao: formDesignacaoData?.impedimento_substituicao ?? null,
      carater_especial: formDesignacaoData?.carater_especial ?? "nao",
      com_afastamento: formDesignacaoData?.com_afastamento ?? "nao",
      motivo_afastamento: formDesignacaoData?.motivo_afastamento ?? "",
      com_pendencia: formDesignacaoData?.com_pendencia ?? "nao",
      motivo_pendencia: formDesignacaoData?.motivo_pendencia ?? "",
      tipo_cargo: formDesignacaoData?.tipo_cargo ?? "disponivel",
      rf_titular: formDesignacaoData?.rf_titular ?? "",
      cargo_vago_selecionado: formDesignacaoData?.cargo_vago_selecionado ?? null,
    },
    mode: "onChange",

  });

  useEffect(() => {
    if (designacao && !hasPopulatedFromApi.current) {
      hasPopulatedFromApi.current = true;
      setIsPopulateScreen(true);

      form.setValue("tipo_cargo", designacao.tipo_vaga.toLowerCase() as "vago" | "disponivel");
      form.setValue("cargo_vago_selecionado", { id: designacao.cargo_vaga, label: designacao.cargo_vaga_display });
      form.setValue("portaria_designacao", designacao.numero_portaria);
      form.setValue("numero_sei", designacao.sei_numero);
      form.setValue("a_partir_de", new Date(designacao.data_inicio.replace(/-/g, '/')));
      form.setValue("designacao_data_final", designacao.data_fim ? new Date(designacao.data_fim.replace(/-/g, '/')) : null);
      form.setValue("ano", designacao.ano_vigente, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      form.setValue("doc", designacao.doc);
      form.setValue("impedimento_substituicao", designacao.impedimento_substituicao);
      form.setValue("carater_especial", designacao.carater_excepcional ? "sim" : "nao");
      form.setValue("com_afastamento", designacao.com_afastamento ? "sim" : "nao");
      form.setValue("motivo_afastamento", designacao.motivo_afastamento);
      form.setValue("com_pendencia", designacao.possui_pendencia ? "sim" : "nao");
      form.setValue("motivo_pendencia", designacao.pendencias);
      form.setValue("rf_titular", designacao.titular_rf, { shouldValidate: true, shouldTouch: true });

      setDadosTitular({
        rf: designacao.titular_rf,
        nome_servidor: designacao.titular_nome_servidor,
        nome_civil: designacao.titular_nome_civil,
        vinculo: designacao.titular_vinculo,
        lotacao: designacao.titular_lotacao,
        cargo_base: designacao.titular_cargo_base,
        cd_cargo_base: designacao.titular_codigo_cargo_base,
        cd_cargo_sobreposto_funcao_atividade: designacao.titular_codigo_cargo_sobreposto,
        cargo_sobreposto_funcao_atividade: designacao.titular_cargo_sobreposto,
        cursos_titulos: '-', codigo_hierarquia: '-', lotacao_cargo_base: '-', laudo_medico: '-',
        local_de_servico: designacao.titular_local_servico,
        local_de_exercicio: designacao.titular_local_exercicio,
      });

      setFormDesignacaoData({
        // Preserva servidorIndicado do context (pode ter sido editado no Passo 1)
        servidorIndicado: designacao.indicado_nome_servidor ? {
          nome_servidor: designacao.indicado_nome_servidor,
          nome_civil: designacao.indicado_nome_civil,
          rf: designacao.indicado_rf,
          vinculo: designacao.indicado_vinculo,
          cargo_base: designacao.indicado_cargo_base,
          lotacao: designacao.indicado_lotacao,
          cargo_sobreposto_funcao_atividade: designacao.indicado_cargo_sobreposto,
          local_de_exercicio: designacao.indicado_local_exercicio,
          laudo_medico: "Indisponível",
          local_de_servico: designacao.indicado_local_servico,
        }:formDesignacaoData?.servidorIndicado,
        dre: designacao?.dre ?? '-',
        dre_nome: formDesignacaoData?.dre_nome ?? designacao.dre_nome,
        ue: designacao?.ue ?? '-',
        ue_nome: formDesignacaoData?.ue_nome ?? designacao.unidade_proponente,
        funcionarios_da_unidade: designacao.funcionarios_da_unidade ?? "-",
        quantidade_turmas: formDesignacaoData?.quantidade_turmas ?? "-",
        codigo_hierarquico: formDesignacaoData?.codigo_hierarquico ?? designacao.codigo_hierarquico,
        cargo_sobreposto: formDesignacaoData?.cargo_sobreposto ?? designacao.titular_cargo_sobreposto,
        modulos: formDesignacaoData?.modulos ?? 1,
        portaria_designacao: designacao.numero_portaria,
        numero_sei: designacao.sei_numero,
        a_partir_de: designacao.data_inicio,
        designacao_data_final: designacao.data_fim,
        com_afastamento: designacao.com_afastamento,
        motivo_afastamento: designacao.motivo_afastamento,
        com_pendencia: designacao.possui_pendencia,
        motivo_pendencia: designacao.pendencias,
        tipo_cargo: designacao.tipo_vaga.toLowerCase(),
        rf_titular: designacao.titular_rf,
        cargo_vago_selecionado: { id: designacao.cargo_vaga, label: designacao.cargo_vaga_display },
        dadosTitular: null,
        informacoes_adicionais: designacao?.informacoes_adicionais ?? "",
        detalhe_para_quadro_de_historico_por_ano: designacao?.detalhe_para_quadro_de_historico_por_ano ?? true,
      } as unknown as FormDesignacaoEServidorIndicado);

      form.clearErrors();
      setIsPopulateScreen(false);
    }
  }, [designacao]);

  const { mutateAsync } = useServidorDesignacao();
  const router = useRouter();
  const [dadosTitular, setDadosTitular] = useState<Servidor | null>(formDesignacaoData?.dadosTitular ?? null);
  const [errorBusca, setErrorBusca] = useState<string | null>(null);

  const tipoCargo = form.watch("tipo_cargo");
  const cargoVago = form.watch("cargo_vago_selecionado");
  const rfTitular = form.watch("rf_titular");
  const onBuscaTitular = async (values: BuscaDesignacaoRequest) => {
    const response = await mutateAsync(values);
    if (response.success) {
      const titularFormatado: Servidor = {
        ...response.data,
      };

      setDadosTitular(titularFormatado);
      setErrorBusca(null);
      form.setValue("rf_titular", values.rf, { shouldValidate: true });
    } else {
      setErrorBusca(response.error);
      setDadosTitular(null);
      form.setValue("rf_titular", "");
    }
  };

  const canAdvance =
    Object.keys(form.formState.errors).length === 0 &&
    (tipoCargo === "vago"
      ? !!cargoVago?.id
      : (!!dadosTitular && !!rfTitular));

  const onSubmitDesignacao = (values: formSchemaDesignacaoPasso2Data) => {
    if (values.tipo_cargo.toLowerCase() === "vago") {
      setFormDesignacaoData({
        ...formDesignacaoData,
        ...values,
        dadosTitular: {
          rf: "",
          nome_servidor: "",
          nome_civil: "",
          vinculo: 0,
          lotacao: "",
          cargo_base: "",
          cd_cargo_base: 0,
          cd_cargo_sobreposto_funcao_atividade: 0,
          cargo_sobreposto_funcao_atividade: "",
          cursos_titulos: "",
          codigo_hierarquia: "",
          lotacao_cargo_base: "",
          laudo_medico: "",
          local_de_servico: "",
          local_de_exercicio: "",
        }

      });
    } else {
      setFormDesignacaoData({
        ...formDesignacaoData,
        ...values,
        dadosTitular: dadosTitular,
      });
    }


    if (id) {
      router.push(
        `/pages/designacoes/designacoes-passo-3?id=${id}`
      );
    } else {
      router.push("/pages/designacoes/designacoes-passo-3");
    }
  };

  const [modalHistoricoUltimaDesignacaoOpen, setModalHistoricoUltimaDesignacaoOpen] = useState(false);

  useEffect(() => {
    if (tipoCargo === "disponivel") {
      form.setValue("cargo_vago_selecionado", null);
      form.clearErrors("cargo_vago_selecionado");
    }
  }, [tipoCargo]);

  function onSubmitEditarServidor(data: FormEditarServidorData) {
    setFormDesignacaoData({
      ...formDesignacaoData!,
      servidorIndicado: {
        ...formDesignacaoData!.servidorIndicado!,
        nome_servidor: data.nome_servidor,
        nome_civil: data.nome_civil,
      },
    });
  }
  return (
    <>
      <PageHeader
        title= {id ? "Editar Designação" : "Designação"}
        breadcrumbs={[
          { title: "Início", href: "/" }, 
          { title: "Listagem de Designações", href: "/pages/listagem-designacoes" },  
          { title: "Designação" }, ]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmitDesignacao)}>
          <FundoBranco>
            <StepperDesignacao current={1} />
          </FundoBranco>
          <Card

            title={
              <div className="flex justify-between items-center">
                <span className="text-[#333]">Designação</span>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setModalHistoricoUltimaDesignacaoOpen(true)}
                  className="flex items-center gap-2 h-auto p-0 hover:bg-transparent group"
                  aria-label="Ver histórico da última designação"
                >
                  <span className="text-[#B22B2A] font-medium group-hover:underline">
                    Histórico
                  </span>
                  <Historico
                    width={20}
                    height={20}
                    className="text-[#B22B2A]"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            }
            className="mt-4 m-0"
          >
            {formDesignacaoData?.servidorIndicado && (
              <Accordion
                type="multiple"
                defaultValue={["portarias-designacao", "servidor-indicado"]}
              >
                <CustomAccordionItem
                  title="Unidade Proponente"
                  color="blue"
                  value="unidade-proponente"
                >
                  <ResumoPesquisaDaUnidade
                    defaultValues={{
                      lotacao: formDesignacaoData?.ue_nome ?? "",
                      dre: formDesignacaoData?.dre_nome ?? "",
                      estrutura_hierarquica:
                        formDesignacaoData?.codigo_hierarquico ?? "",
                    }}
                    isLoading={false} />
                </CustomAccordionItem>
                <CustomAccordionItem
                  title="Portarias de designação"
                  color="purple"
                  value="portarias-designacao"
                >
                  <PortariaDesigacaoFields
                    isLoading={isPopulateScreen || isLoadingDesignacao}
                  />
                </CustomAccordionItem>
                <CustomAccordionItem
                  title="Dados do servidor indicado"
                  value="servidor-indicado"
                  color="gold"
                >
                  <ResumoDesignacaoServidorIndicado
                    isLoading={false}
                    defaultValues={formDesignacaoData?.servidorIndicado}
                    showCursosTitulos={true}
                    showEditar={true}
                    showLotacao={true}
                    onSubmitEditarServidor={onSubmitEditarServidor}
                  />
                </CustomAccordionItem>
              </Accordion>
            )}
            {/* to-do: arrumar nome */}
            <SelecaoServidorIndicado
              rf_default={rfTitular ?? ""}
              isLoading={isPopulateScreen || isLoadingDesignacao}
              form={form}
              tipoCargo={tipoCargo}
              dadosTitular={dadosTitular}
              errorBusca={errorBusca}
              onBuscaTitular={onBuscaTitular}
              setDadosTitular={setDadosTitular}
              setErrorBusca={setErrorBusca}
            />
          </Card>
          <div className="w-full flex flex-col mt-6">
            <BotoesDeNavegacao
              disableAnterior={false}
              disableProximo={!canAdvance}
              onProximo={form.handleSubmit(onSubmitDesignacao)}
              showAnterior={true}
              onAnterior={() => {
                onSubmitDesignacao(form.getValues());
                if (id) {
                  router.push(`/pages/designacoes/designacoes-passo-1?id=${id}&rf=${formDesignacaoData?.servidorIndicado?.rf}`);
                } else {
                  router.push(`/pages/designacoes/designacoes-passo-1?rf=${formDesignacaoData?.servidorIndicado?.rf}`);
                }               
              }}
            />
          </div>
        </form>
      </FormProvider>
      <ModalUltimaDesignacao
        isLoading={false}
        open={modalHistoricoUltimaDesignacaoOpen}
        onOpenChange={setModalHistoricoUltimaDesignacaoOpen}
        // to-do: quando houver api com os dados trazer dados corretamente do ultimo servidor
        ultimoServidor={formDesignacaoData?.servidorIndicado ?? null}
        // to-do: quando houver api com os dados remover mock
        portariaCessacao={{
          numero_portaria: "000123",
          ano: "2026",
          numero_sei: "0012345",
          doc: "0098765",
          designacao_a_partir_de: "01/01/2024",
          ate: "31/12/2024",
          carater_excepcional: "nao",
          motivo_cancelamento: "Encerramento do período de designação",
          impedimento_substituicao: "Nenhum impedimento registrado",
        }}
      />
    </>
  );
}