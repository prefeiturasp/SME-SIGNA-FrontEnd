"use client";

import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Card } from "antd";
import Designacao from "@/assets/icons/Designacao";
import FormularioBuscaDesignacao from "@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import useServidorDesignacao from "@/hooks/useServidorDesignacao";
import { useEffect, useRef, useState } from "react";
import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import FormularioPesquisaUnidade, {
  FormularioPesquisaUnidadeRef,
} from "@/components/dashboard/Designacao/PesquisaUnidade/FormularioPesquisaUnidade";
import { useDesignacaoContext } from "../DesignacaoContext";
import { useRouter, useSearchParams } from "next/navigation";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import { Accordion } from "@/components/ui/accordion";
import { FormEditarServidorData } from "@/components/dashboard/Designacao/ModalEditarServidor/schema";

export default function DesignacoesPasso1() {
  const searchParams = useSearchParams();
  const rf = searchParams.get("rf");

  const { mutateAsync, isPending } = useServidorDesignacao();
  const [error, setError] = useState<string | null>(null);
  
  const formularioPesquisaUnidadeRef =
    useRef<FormularioPesquisaUnidadeRef | null>(null);

  const { formDesignacaoData, setFormDesignacaoData, clearFormDesignacaoData } =
    useDesignacaoContext();
  const [disableProximo, setDisableProximo] = useState(formDesignacaoData?.designacaoUnidade?false:true);

  const router = useRouter();

  const onBuscaDesignacao = async (values: BuscaDesignacaoRequest) => {
    const response = await mutateAsync(values);
 
    if (response.success) {
      setFormDesignacaoData({
        ...formDesignacaoData,
        servidorIndicado: {
          ...response.data,
        },
      });

      setError(null);
    } else {
      setError(response.error);
    }
  };

  function onSubmitEditarServidor(data: FormEditarServidorData) {
    const servidorIndicado = formDesignacaoData!.servidorIndicado!;
    setFormDesignacaoData({
      ...formDesignacaoData,
      servidorIndicado: {
        ...servidorIndicado,
        nome_servidor: data.nome_servidor,
        nome_civil: data.nome_civil,
      },
    });
  }

  const onProximo = () => {
    const valoresFormulario =
      formularioPesquisaUnidadeRef.current?.getValues();

    if (!valoresFormulario || !formDesignacaoData?.servidorIndicado) {
      return;
    }
     
    setFormDesignacaoData({
      ...formDesignacaoData,
      ...valoresFormulario,
    });

    
    router.push(
      `/pages/designacoes/designacoes-passo-2`
    );
  };
 
  useEffect(() => {
    if (!rf) {
      clearFormDesignacaoData();
    }
  }, []);
  
  
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

      <FundoBranco>
        <StepperDesignacao current={0} />
      </FundoBranco>

      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-[#333]">
              Servidor indicado
            </span>
          </div>
        }
        className="mt-4 m-0"
      >
        <Accordion
          type="multiple"
          defaultValue={["unidade-proponente"]}   
          onValueChange={(values) => {
            if (!values.includes("unidade-proponente")) {
              const vals = formularioPesquisaUnidadeRef.current?.getValues();
              if (vals) {
                setFormDesignacaoData({ ...formDesignacaoData, ...vals });
              }
            }
          }}
        >
          <div className="pt-4 pb-6">
            <FormularioBuscaDesignacao
              onBuscaDesignacao={onBuscaDesignacao}
              defaultValues={formDesignacaoData?.servidorIndicado ?? { rf: "" }}
            />
          </div>

          {error && (
            <div className="text-red-500">{error}</div>
          )}

          {formDesignacaoData?.servidorIndicado && (
            <CustomAccordionItem
              title="Dados do servidor indicado"
              value="servidor-indicado"
              color="gold"
            >
              <ResumoDesignacaoServidorIndicado
                isLoading={isPending}
                defaultValues={
                  formDesignacaoData.servidorIndicado
                }
                showCursosTitulos={true}
                showEditar={true}
                showLotacao={true}  
                onSubmitEditarServidor={onSubmitEditarServidor}
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
               setDisableProximo={setDisableProximo}
               defaultValues={formDesignacaoData ?? {}}
            />
          </CustomAccordionItem>
        </Accordion>
      </Card>

      <div className="w-full flex flex-col">
        <BotoesDeNavegacao
          disableAnterior={true}
          disableProximo={
            disableProximo ||
            !formDesignacaoData?.servidorIndicado
          }
          onProximo={onProximo}
          showAnterior={false}
         />
      </div>
    </>
  );
}