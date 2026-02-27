"use client";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Card } from "antd";
import Designacao from "@/assets/icons/Designacao";
import FormularioBuscaDesignacao from "@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import useServidorDesignacao from "@/hooks/useServidorDesignacao";
import { useRef, useState } from "react";
import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import { FormDesignacaoData } from "@/components/dashboard/Designacao/PesquisaUnidade/schema";
import FormularioPesquisaUnidade, {
  FormularioPesquisaUnidadeRef,
} from "@/components/dashboard/Designacao/PesquisaUnidade/FormularioPesquisaUnidade";
import { useDesignacaoContext } from "../DesignacaoContext";
import { useRouter } from "next/navigation";
import { Servidor } from "@/types/designacao-unidade";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import {
  Accordion
} from "@/components/ui/accordion"

export default function DesignacoesPasso1() {
  const { mutateAsync, isPending } = useServidorDesignacao();
  const [data, setData] = useState<Servidor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disableProximo, setDisableProximo] = useState(true);
  const formularioPesquisaUnidadeRef = useRef<FormularioPesquisaUnidadeRef | null>(null);
  const { setFormDesignacaoData } = useDesignacaoContext();
  const router = useRouter();
  console.log("data", data);

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

  const onProximo = (data: Servidor) => {
    const valoresFormulario = formularioPesquisaUnidadeRef.current?.getValues();
    if (!valoresFormulario) {
      return;
    }
    console.log("Dados da unidade selecionada", {...valoresFormulario, servidorIndicado: data});
    setFormDesignacaoData({...valoresFormulario, servidorIndicado: {...data, nome_servidor: data.nome, nome_civil: data.nome}});
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
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-[#333]">Servidor indicado</span>
          </div>
        }
        className=" mt-4 m-0 ">
        <Accordion
          type="multiple"
          defaultValue={["portarias-designacao"]}
        >
          <div className="pt-4 pb-6">
            <FormularioBuscaDesignacao onBuscaDesignacao={onBuscaDesignacao} />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {data && (
            <CustomAccordionItem
              title="Dados do servidor indicado"
              value="servidor-indicado"
              color="gold"
            >
              <ResumoDesignacaoServidorIndicado
                isLoading={isPending}
                defaultValues={data}
                showCursosTitulos={false}
                showEditar={true}
                 showCamposExtras
              />
            </CustomAccordionItem>
          )}
          <CustomAccordionItem
            title="Unidade Proponente"
            color="blue"
            value="unidade-proponente"
          >
            <FormularioPesquisaUnidade
              isLoading={isPending}
              ref={formularioPesquisaUnidadeRef}
              onSubmitDesignacao={onSubmitDesignacao}
              setDisableProximo={setDisableProximo}
            />
          </CustomAccordionItem>
        </Accordion>
      </Card>
      <div className="w-full flex flex-col ">
        <BotoesDeNavegacao
          disableAnterior={true}
          disableProximo={disableProximo}
          onProximo={() => data && onProximo(data)}
          showAnterior={false}
          onAnterior={() => { }}
        />
      </div>
    </>
  );
}
