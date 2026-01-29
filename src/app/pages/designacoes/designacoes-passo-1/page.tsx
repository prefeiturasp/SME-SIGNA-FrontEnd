"use client";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Card } from "antd";
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


export default function DesignacoesPasso1() {
  const { mutateAsync, isPending } = useServidorDesignacao();
  const [data, setData] = useState<BuscaServidorDesignacaoBody | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disableProximo, setDisableProximo] = useState(true);
  const formularioPesquisaUnidadeRef = useRef<FormularioPesquisaUnidadeRef | null>(null);
  const { setFormDesignacaoData } = useDesignacaoContext();
  const router = useRouter();

  const onBuscaDesignacao = async (values: BuscaDesignacaoRequest) => {
    const response = await mutateAsync(values);
    if (response.success) {
      setData(response.data);
      setError(null);

    }
    if (!response.success) {
      setError(response.error);
      setData(null);
    }
  };

  const onSubmitDesignacao = (values: FormDesignacaoData) => {
    console.log("Dados do formulário", values);
  };
  const onProximo = (data: BuscaServidorDesignacaoBody) => {
    const valoresFormulario = formularioPesquisaUnidadeRef.current?.getValues();
    if (!valoresFormulario) {
      return;
    }
    console.log("Dados da unidade selecionada", valoresFormulario);
    setFormDesignacaoData(valoresFormulario);
    router.push(`/pages/designacoes/designacoes-passo-2?${data.rf}`);
  };
  return (
    <>
      <PageHeader
        title="Designação"
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designação" }]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />



      <FundoBranco >
        <StepperDesignacao current={0} />
      </FundoBranco>

      <Card title={<span className="text-[#6058A2]">Servidor indicado</span>} className="text-[#6058A2] mt-4 m-0 ">
        <FormularioBuscaDesignacao onBuscaDesignacao={onBuscaDesignacao} />
      </Card>


      {error && <div className="text-red-500">{error}</div>}
      {data?.nome && (
        <div className="flex flex-col  items-stretch">

          <Card title="Dados do servidor indicado" className=" mt-4 m-0 ">
            <ResumoDesignacao isLoading={isPending} defaultValues={data} />
          </Card>


          <Card title={<span className="text-[#6058A2]">Pesquisa da unidade</span>}
            className=" mt-4 m-0 ">
            <FormularioPesquisaUnidade
              ref={formularioPesquisaUnidadeRef}
              onSubmitDesignacao={onSubmitDesignacao}
              setDisableProximo={setDisableProximo}
            />
          </Card>



          <div className="w-full flex flex-col ">
            <BotoesDeNavegacao
              disableAnterior={true}
              disableProximo={disableProximo}
              onProximo={() => onProximo(data)}
              onAnterior={() => { }}
            />
          </div>


        </div>
      )}
    </>
  );
}
