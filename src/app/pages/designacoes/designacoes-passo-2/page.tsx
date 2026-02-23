
"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Card } from "antd";
import Designacao from "@/assets/icons/Designacao";
import ResumoDesignacao from "@/components/dashboard/Designacao/ResumoDesignacao";

 import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";

import { useDesignacaoContext } from "../DesignacaoContext";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import formSchemaDesignacaoPasso2, { formSchemaDesignacaoPasso2Data } from "./schema";
import Historico from "@/assets/icons/Historico";


type ColorVariant = "gold" | "purple" | "green";

type CustomAccordionItemProps = {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly value: string;
  readonly color?: ColorVariant;
};
const colorVariants: Record<
  ColorVariant,
  {
    border: string;
    text: string;
  }
> = {
  gold: {
    border: "border-l-[#EBB466]",
    text: "text-[#E09326]",
    
  },
  purple: {    
    border: "border-l-[#D89DDB]",
    text: "text-[#A936AF]",    
  },
  green: {
    border: "border-l-green-500",
    text: "text-green-600",
  },
};function CustomAccordionItem({
  title,
  children,
  value,
  color = "gold",
}: CustomAccordionItemProps) {
  const variant = colorVariants[color];

  return (
    <AccordionItem value={value} className="border-b-0 mb-5">
      <AccordionTrigger
        className={`mb-0 pr-4 bg-[#F9F9F9] rounded-md border-l-4 ${variant.border}`}
      >
        <div className="flex items-center justify-between w-full">
          <span className={`pl-4 text-lg ${variant.text}`}>
            {title}
          </span>
          <span className="mr-2 text-[16px] text-muted-foreground">
            Ver
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="mt-0 m-0">
        <Card
          className={`m-0 border-l-4 bg-[#F9F9F9] ${variant.border}`}
        >
          {children}
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}





export default function DesignacoesPasso2() {
  const disableProximo=true;
  const { formDesignacaoData } = useDesignacaoContext();




  const form = useForm<formSchemaDesignacaoPasso2Data>({
    resolver: zodResolver(formSchemaDesignacaoPasso2),
    defaultValues: {
      portaria_designacao: "",
      numero_sei: "",
      a_partir_de: new Date(),
      designacao_data_final: new Date(),
      ano: new Date().getFullYear().toString(),
      doc: "",
      motivo_cancelamento: "",
      impedimento_substituicao: "",
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
                  defaultValue={["servidor-indicado", "portarias-designacao"]}
                >
                  <CustomAccordionItem
                    title="Dados do servidor indicado"
                    
                    value="servidor-indicado"
                    color="gold"
                  >
                    <ResumoDesignacao
                      isLoading={false}
                      defaultValues={formDesignacaoData?.servidorIndicado}
                      showCursosTitulos={false}
                      showEditar={true}
                      onClickEditar={() => {}}
                      showCamposExtras
                    />
                  </CustomAccordionItem>


                  <CustomAccordionItem
                    title="Portarias de designação"
                    color="purple"
                    value="portarias-designacao"
                  >
                    teste
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
