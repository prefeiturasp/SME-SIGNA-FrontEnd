"use client";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Divider } from "antd";
import Designacao from "@/assets/icons/Designacao";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ResumoDesignacao from "@/components/dashboard/Designacao/ResumoDesignacao";
import FormularioBuscaDesignacao from "@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import useServidorDesignacao from "@/hooks/useServidorDesignacao";
import { useState } from "react";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import { useRouter } from "next/navigation";


export default function DesignacoesPasso1() {
  const router = useRouter();
  const { mutateAsync } = useServidorDesignacao();
  const [data, setData] = useState<BuscaServidorDesignacaoBody | null>(null);
  
  const onBuscaDesignacao = async (values: BuscaDesignacaoRequest) => {
    const response = await mutateAsync(values);
    if (response.success) {
      setData(response.data);
    }
    if (!response.success) {
      console.error(response.error);
    }
  };

  const onProximo = () => {
    if (!data) return;

    const query = new URLSearchParams({
      payload: JSON.stringify(data),
    }).toString();

    router.push(`/dashboard/designacoes-passo-2?${query}`);
  };
  return (
    <>
      <PageHeader
        title="Designação"
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designação" }]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />
      <FormularioBuscaDesignacao onBuscaDesignacao={onBuscaDesignacao} />

      {data?.servidor && (
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          <div className="w-full lg:w-3/4 flex flex-col self-stretch">
            <FundoBranco className="lg:h-[80vh]">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-1"
              >
                <h1 className="text-[#42474a] text-[18px] font-bold m-0">
                  Validar dados
                </h1>
                <Divider className="mt-2" />
                <AccordionItem value="item-1">
                  <AccordionTrigger>Substituto</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance pl-5">
                    <ResumoDesignacao defaultValues={data} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>




              <BotoesDeNavegacao
                disableAnterior={true}
                disableProximo={!data}
                onProximo={onProximo}
                onAnterior={() => {}}
              />


            </FundoBranco>
          </div>

          <div className="w-full  lg:w-1/4 flex flex-col self-stretch h-auto ">
            <FundoBranco className="lg:h-[80vh]">
              <StepperDesignacao current={0} />
            </FundoBranco>
          </div>
        </div>
      )}
    </>
  );
}
