"use client";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button, Card } from "antd";
import Designacao from "@/assets/icons/Designacao";
import ResumoDesignacao from "@/components/dashboard/Designacao/ResumoDesignacao";
import FormularioBuscaDesignacao from "@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import useServidorDesignacao from "@/hooks/useServidorDesignacao";
import { useRef, useState } from "react";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import { FormDesignacaoData } from "@/components/dashboard/Designacao/PesquisaUnidade/schema";
import FormularioPesquisaUnidade, {
  FormularioPesquisaUnidadeRef,
} from "@/components/dashboard/Designacao/PesquisaUnidade/FormularioPesquisaUnidade";
import { useDesignacaoContext } from "../DesignacaoContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Edit from "@/assets/icons/Edit";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import formSchemaDesignacaoPasso2, { formSchemaDesignacaoPasso2Data } from "./schema";
import PortariaDesigacaoFields from "@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields";


export default function DesignacoesPasso1() {
  const [disableProximo, setDisableProximo] = useState(true);
  const formularioPesquisaUnidadeRef = useRef<FormularioPesquisaUnidadeRef | null>(null);
  const { setFormDesignacaoData, formDesignacaoData } = useDesignacaoContext();
  const router = useRouter();



  
  const onProximo = (data: BuscaServidorDesignacaoBody) => {
    const valoresFormulario = formularioPesquisaUnidadeRef.current?.getValues();
    if (!valoresFormulario) {
      return;
    }
    console.log("Dados da unidade selecionada", valoresFormulario);
    // setFormDesignacaoData(valoresFormulario);
    router.push(`/pages/designacoes/designacoes-passo-2?${data.rf}`);
  };


  const form = useForm<formSchemaDesignacaoPasso2Data>({
    resolver: zodResolver(formSchemaDesignacaoPasso2),
    defaultValues: {
      portaria_designacao: "",
      numero_sei: "",
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




        {/* {error && <div className="text-red-500">{error}</div>} */}

        {/* {isPending && <div className="flex items-center justify-center">
        <Loader2 data-testid="loader" className="w-20 h-20 animate-spin text-primary " />
      </div>} */}


        <Card
          title={<span className="text-[#6058A2]">Designação</span>}
          className=" mt-4 m-0 ">

          {formDesignacaoData?.servidorIndicado && (
            <>
              <Card
                title={
                  <div className="flex justify-between items-center">
                    <span className="text-[#E09326]">Dados do servidor indicado</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#B22B2A]">Editar</span>
                      <Edit width={20} height={20} color="white" />
                    </div>
                  </div>

                }
                className=" mt-0 m-0 border-l-4  border-l-[#EBB466] bg-[#F9F9F9]">
                <ResumoDesignacao isLoading={false} defaultValues={formDesignacaoData?.servidorIndicado} showCursosTitulos={false} />
              </Card>



              <Card title={<span className="text-[#A936AF]">Portarias de designação</span>}
                className=" mt-4 m-0 border-l-4  border-l-[#A936AF] bg-[#F9F9F9]">

                <PortariaDesigacaoFields  setDisableProximo={setDisableProximo} isLoading={false} />
              </Card>
            </>
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
