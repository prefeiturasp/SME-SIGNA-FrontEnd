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
import { BuscaDesignacaoRequest, DesignacaoResponse } from "@/types/designacao";

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
  const rf = searchParams.get("rf");


  const { data: designacao, isLoading: isLoadingDesignacao } = useFetchDesignacoesById(
    Number(id)
  );
  const { formDesignacaoData, setFormDesignacaoData, clearFormDesignacaoData } =
    useDesignacaoContext();
  const [isPopulateScreen, setIsPopulateScreen] = useState(false);
  const hasPopulatedFromApi = useRef(false);
  const [dadosTitular, setDadosTitular] = useState<Servidor | null>(formDesignacaoData?.dadosTitular ?? null);

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

  const popularCamposFormulario = (d: DesignacaoResponse) => {
    form.setValue("tipo_cargo", d.tipo_vaga.toLowerCase() as "vago" | "disponivel");
    form.setValue("cargo_vago_selecionado", { id: d.cargo_vaga, label: d.cargo_vaga_display });
    form.setValue("portaria_designacao", d.numero_portaria);
    form.setValue("numero_sei", d.sei_numero);
    form.setValue("a_partir_de", new Date(d.data_inicio.replace(/-/g, '/')));
    form.setValue("designacao_data_final", d.data_fim ? new Date(d.data_fim.replace(/-/g, '/')) : null);
    form.setValue("ano", d.ano_vigente, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue("doc", d.doc ?? "");
    form.setValue("impedimento_substituicao", d.impedimento_substituicao);
    form.setValue("carater_especial", d.carater_excepcional ? "sim" : "nao");
    form.setValue("com_afastamento", d.com_afastamento ? "sim" : "nao");
    form.setValue("motivo_afastamento", d.motivo_afastamento);
    form.setValue("com_pendencia", d.possui_pendencia ? "sim" : "nao");
    form.setValue("motivo_pendencia", d.pendencias);
    form.setValue("rf_titular", d.titular_rf, { shouldValidate: true, shouldTouch: true });
    setDadosTitular({
      rf: d.titular_rf,
      nome_servidor: d.titular_nome_servidor,
      nome_civil: d.titular_nome_civil,
      vinculo: d.titular_vinculo,
      lotacao: d.titular_lotacao,
      cargo_base: d.titular_cargo_base,
      cd_cargo_base: d.titular_codigo_cargo_base,
      cd_cargo_sobreposto_funcao_atividade: d.titular_codigo_cargo_sobreposto,
      cargo_sobreposto_funcao_atividade: d.titular_cargo_sobreposto,
      cursos_titulos: '-', codigo_hierarquia: '-', lotacao_cargo_base: '-', laudo_medico: '-',
      local_de_servico: d.titular_local_servico,
      local_de_exercicio: d.titular_local_exercicio,
    });
  };

  const popularDadosContexto = (d: DesignacaoResponse) => {
    setFormDesignacaoData({
      servidorIndicado: formDesignacaoData?.servidorIndicado?.nome_servidor
        ? formDesignacaoData?.servidorIndicado
        : {
          nome_servidor: d.indicado_nome_servidor,
          nome_civil: d.indicado_nome_civil,
          rf: d.indicado_rf,
          vinculo: d.indicado_vinculo,
          cargo_base: d.indicado_cargo_base,
          lotacao: d.indicado_lotacao,
          cargo_sobreposto_funcao_atividade: d.indicado_cargo_sobreposto,
          local_de_exercicio: d.indicado_local_exercicio,
          laudo_medico: "Indisponível",
          local_de_servico: d.indicado_local_servico,
        },
      dre: d.dre ?? '-',
      dre_nome: formDesignacaoData?.dre_nome ?? d.dre_nome,
      ue: d.ue ?? '-',
      ue_nome: formDesignacaoData?.ue_nome ?? d.unidade_proponente,
      funcionarios_da_unidade: d.funcionarios_da_unidade ?? "-",
      quantidade_turmas: formDesignacaoData?.quantidade_turmas ?? "-",
      codigo_hierarquico: formDesignacaoData?.codigo_hierarquico ?? d.codigo_hierarquico,
      cargo_sobreposto: formDesignacaoData?.cargo_sobreposto ?? d.titular_cargo_sobreposto,
      modulos: formDesignacaoData?.modulos ?? 1,
      portaria_designacao: d.numero_portaria,
      numero_sei: d.sei_numero,
      ano: d.ano_vigente,
      a_partir_de: d.data_inicio ? new Date(d.data_inicio.replace(/-/g, '/')) : new Date(),
      designacao_data_final: d.data_fim ? new Date(d.data_fim.replace(/-/g, '/')) : null,
      com_afastamento: d.com_afastamento,
      motivo_afastamento: d.motivo_afastamento,
      com_pendencia: d.possui_pendencia,
      motivo_pendencia: d.pendencias,
      tipo_cargo: d.tipo_vaga.toLowerCase(),
      rf_titular: d.titular_rf,
      cargo_vago_selecionado: { id: d.cargo_vaga, label: d.cargo_vaga_display },
      dadosTitular: null,
      informacoes_adicionais: d.informacoes_adicionais ?? "",
      detalhe_para_quadro_de_historico_por_ano: d.detalhe_para_quadro_de_historico_por_ano ?? true,
    } as unknown as FormDesignacaoEServidorIndicado);
  };

  useEffect(() => {
    if (designacao && !hasPopulatedFromApi.current) {
      hasPopulatedFromApi.current = true;

      // Ao navegar de volta do passo-3, rf está na URL e o contexto já tem os
      // dados editados pelo usuário. Evita sobrescrever com os dados originais da API.
      if (rf && formDesignacaoData?.portaria_designacao) {
        setIsPopulateScreen(false);
        return;
      }

      setIsPopulateScreen(true);
      popularCamposFormulario(designacao);
      popularDadosContexto(designacao);
      form.clearErrors();
      setIsPopulateScreen(false);
    }
  }, [designacao]);

  const { mutateAsync } = useServidorDesignacao();
  const router = useRouter();
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
        `/pages/designacoes/designacoes-passo-3?id=${id}&rf=${formDesignacaoData?.servidorIndicado?.rf}`
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

  useEffect(() => {
    if (!rf && id) {
      clearFormDesignacaoData();
    }
  }, []);
  
  return (
    <>
      <PageHeader
        title= {id ? "Editar Designação" : "Designação"}
        breadcrumbs={[
          { title: "Início", href: "/" }, 
          { title: "Listagem de Designações", href: "/pages/listagem-designacoes" },  
          { title: "Designação" }, ]}
          icon={<Designacao width={24} height={24} color="#660C0B" />}
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
            <div className="card-designacao">
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
            </div>
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