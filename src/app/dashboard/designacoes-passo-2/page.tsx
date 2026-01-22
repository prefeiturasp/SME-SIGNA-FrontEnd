"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Divider } from "antd";

import FormularioUEDesignacao from "@/components/dashboard/Designacao/BuscaUE/FormularioUEDesignacao";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";

import Designacao from "@/assets/icons/Designacao";

import {
  BuscaServidorDesignacaoBody,
} from "@/types/busca-servidor-designacao";

import {
  FormDesignacaoData,
} from "@/components/dashboard/Designacao/BuscaUE/schema";

type SelecaoUEDesignacaoBody = {
  dre: string;
  ue: string;
};

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

  const onSubmitDesignacao = (values: FormDesignacaoData) => {
    console.log("Dados do formulário", values);

    const payload: SelecaoUEDesignacaoBody = {
      dre: values.dre,
      ue: values.ue,
    };

    console.log("Payload etapa UE", payload);
    console.log("Servidor selecionado", servidorSelecionado);

  };

  return (
    <>
      <PageHeader
        title="Designação"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Designação" },
        ]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />

      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col self-stretch">
          <FundoBranco className="md:h-[80vh]">
            <h1 className="text-[#42474a] text-[18px] font-bold m-0">
              Pesquisa de unidade
            </h1>

            <Divider className="mt-2" />

            <FormularioUEDesignacao
              onSubmitDesignacao={onSubmitDesignacao}
            />
          </FundoBranco>
        </div>

        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col self-stretch h-auto md:h-[100vh]">
          <FundoBranco className="md:h-[85vh]">
            <StepperDesignacao />
          </FundoBranco>
        </div>
      </div>
    </>
  );
}
