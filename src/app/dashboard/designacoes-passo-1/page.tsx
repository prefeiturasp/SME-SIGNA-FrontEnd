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
import ResumoDesignacao, { DesignacaoResumoValues } from "@/components/dashboard/Designacao/ResumoDesignacao";
import FormularioBuscaDesignacao from "@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";

export default function DesignacoesPasso1() {

  const data: DesignacaoResumoValues = {
    servidor: "Jussara Mara Ramos Pires",
    rf: "00-000000",
    vinculo: "2",
    lotacao: "00-000000",
    cargo_base: "Prof. xxxxxxxxxxxxxxxx",
    aulas_atribuidas: "xxxxxxxxxxxxxxxxxxxxxxxxx ",
    funcao: "xxxxxxxxxxxxxxxxxxxxxxxxx",
    cargo_sobreposto: "xxxxxxxxxxxxxxxxxxxxxxxxx",
    cursos_titulos: "xxxxxxxxxxxxxxxxxxxxxxxxx",
    estagio_probatorio: "xxxxxxxxxx",
    aprovado_em_concurso: "xxxxxxxxxx",
    laudo_medico: "xxxxxxxxxx",
  };
  const onBuscaDesignacao = (values: BuscaDesignacaoRequest) => {
    console.log("Dados da designação", values);
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


      {
        data?.servidor  && (
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
