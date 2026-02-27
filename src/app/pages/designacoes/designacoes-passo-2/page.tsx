
"use client";
import {
  Accordion
} from "@/components/ui/accordion"

import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Card } from "antd";
import Designacao from "@/assets/icons/Designacao";

import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";

import { useDesignacaoContext } from "../DesignacaoContext";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import formSchemaDesignacaoPasso2, { formSchemaDesignacaoPasso2Data } from "./schema";
import Historico from "@/assets/icons/Historico";
import PortariaDesigacaoFields from "@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields";
import { useState } from "react";
import ResumoPesquisaDaUnidade from "@/components/dashboard/Designacao/ResumoPesquisaDaUnidade";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";







export default function DesignacoesPasso2() {
  const [disableProximo, setDisableProximo] = useState(true);
  const { formDesignacaoData } = useDesignacaoContext();




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
      motivo_afastamento: ""
    },
    mode: "onChange",
  });

  const onSubmitDesignacao = (values: formSchemaDesignacaoPasso2Data) => {
    console.log("Dados do formulário", values);
  };

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

          <FundoBranco >
            <StepperDesignacao current={1} />
          </FundoBranco>





          <Card
            title={
              <div className="flex justify-between items-center">
                <span className="text-[#333]">Designação</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#B22B2A]">Histórico</span>
                  <Historico width={20} height={20} color="white" />
                </div>
              </div>

            }

            className=" mt-4 m-0 ">

            {formDesignacaoData?.servidorIndicado && (

              <Accordion
                type="multiple"
                defaultValue={["portarias-designacao"]}
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
                  title="Dados do servidor indicado"

                  value="servidor-indicado"
                  color="gold"
                >
                  <ResumoDesignacaoServidorIndicado
                    isLoading={false}
                    defaultValues={formDesignacaoData?.servidorIndicado}
                    showCursosTitulos={false}
                    showEditar={true}
                    showCamposExtras

                  />
                </CustomAccordionItem>


                <CustomAccordionItem
                  title="Portarias de designação"
                  color="purple"
                  value="portarias-designacao"
                >
                  <PortariaDesigacaoFields
                    isLoading={false}
                    setDisableProximo={() => setDisableProximo(false)}
                  />
                </CustomAccordionItem>
              </Accordion>



            )}

          </Card>




          <div className="w-full flex flex-col ">
            <BotoesDeNavegacao
              disableAnterior={true}
              disableProximo={disableProximo}
              onProximo={() => console.log("Proximo")}
              showAnterior={false}
              onAnterior={() => { }}
            />
          </div>
        </form>
      </FormProvider>

    </>
  );
}
