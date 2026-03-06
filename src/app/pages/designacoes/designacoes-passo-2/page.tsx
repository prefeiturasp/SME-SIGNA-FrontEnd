"use client";
import { useState } from "react";
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
import { useDesignacaoContext } from "../DesignacaoContext";
import Designacao from "@/assets/icons/Designacao";
import Historico from "@/assets/icons/Historico";
import useServidorDesignacao from "@/hooks/useServidorDesignacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";

// Schema
import formSchemaDesignacaoPasso2, {
  formSchemaDesignacaoPasso2Data
} from "./schema";
import { TitularData } from "@/types/designacao-servidor-titular";
import ModalUltimaDesignacao from "@/components/dashboard/Designacao/ModalHistoricoUltimaDesignacao/ModalHistoricoUltimaDesignacao";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DesignacoesPasso2() {

  const { formDesignacaoData } = useDesignacaoContext();
  const { mutateAsync } = useServidorDesignacao();
  const router = useRouter();
  const [dadosTitular, setDadosTitular] = useState<TitularData | null>(null);
  const [errorBusca, setErrorBusca] = useState<string | null>(null);

  const form = useForm<formSchemaDesignacaoPasso2Data>({
    resolver: zodResolver(formSchemaDesignacaoPasso2),
    defaultValues: {
      portaria_designacao: "",
      numero_sei: "",
      a_partir_de: new Date(),
      designacao_data_final: undefined,
      ano: new Date().getFullYear().toString(),
      doc: "",
      motivo_cancelamento: "",
      impedimento_substituicao: "",
      com_afastamento: "nao",
      motivo_afastamento: "",
      tipo_cargo: "vago",
      rf_titular: "",
      cargo_vago_selecionado: "",
    },
    mode: "onChange",
  });

  const tipoCargo = form.watch("tipo_cargo");
  const cargoVago = form.watch("cargo_vago_selecionado");
  const rfTitular = form.watch("rf_titular");
  const onBuscaTitular = async (values: BuscaDesignacaoRequest) => {
    const response = await mutateAsync(values);
    if (response.success) {
      const titularFormatado: TitularData = {
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

  // Validação para o botão Próximo
  const canAdvance =
    form.formState.isValid &&
    (tipoCargo === "vago" ? !!cargoVago : (!!dadosTitular && !!rfTitular));

  // to-do: corrigir quando houver passo 3
  const onSubmitDesignacao = (values: formSchemaDesignacaoPasso2Data) => {
    console.log("Submit Passo 2", values);
  };

  const [modalHistoricoUltimaDesignacaoOpen, setModalHistoricoUltimaDesignacaoOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Designação"
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designação" }]}
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
                        formDesignacaoData?.codigo_estrutura_hierarquica ?? "",
                    }}
                    isLoading={false} />
                </CustomAccordionItem>
                <CustomAccordionItem
                  title="Portarias de designação"
                  color="purple"
                  value="portarias-designacao"
                >
                  <PortariaDesigacaoFields
                    isLoading={false}
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
                  />
                </CustomAccordionItem>
              </Accordion>
            )}
            {/* to-do: arrumar nome */}
            <SelecaoServidorIndicado
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
                router.push(
                  `/pages/designacoes/designacoes-passo-1`
                );
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