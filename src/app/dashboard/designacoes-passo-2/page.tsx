"use client";
import FormularioDesignacao from "@/components/dashboard/Designacao/FormularioDesignacao";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Divider } from "antd";
import Designacao from "@/assets/icons/Designacao";
import { BuscaServidorDesignacaoBody, ResumoDesignacaoBody } from "@/types/busca-servidor-designacao";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function Designacoes() {
  const searchParams = useSearchParams();

  const servidorSelecionado = useMemo(() => {
    const payload = searchParams.get("payload");
    if (!payload) return null;

    try {
      return JSON.parse(payload) as BuscaServidorDesignacaoBody;
    } catch (error) {
      console.error("Falha ao ler dados do passo anterior", error);
      return null;
    }
  }, [searchParams]);

  const onSubmitDesignacao = (values: ResumoDesignacaoBody) => {
    console.log("Dados da designação", values);
    console.log("Servidor selecionado no passo 1", servidorSelecionado);
  };
  return (
    <>
      <PageHeader
        title="Designação"
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designação" }]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />

      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col self-stretch">
          <FundoBranco className="md:h-[85vh]">

            <h1 className="text-[#42474a] text-[18px] font-bold m-0">
              Pesquisa de unidade
            </h1>
            <Divider className="mt-2" />

            <FormularioDesignacao onSubmitDesignacao={onSubmitDesignacao} />
          </FundoBranco>
        </div>

        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col self-stretch h-auto md:h-[100vh]">
          <FundoBranco className="md:h-[85vh]">
            <StepperDesignacao  />
          </FundoBranco>
        </div>
      </div>
    </>
  );
}
