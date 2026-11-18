"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Steps } from "antd";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from "@/components/ui/button";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import FormCargosBasePrincipal from "@/components/dashboard/Gestao/FormCargosBase/FormCargosBasePrincipal";
import { useCriarEditarCargosBase } from "@/hooks/useCriarEditarCargosBase";
import FormCargosBasePasso2 from "@/components/dashboard/Gestao/FormCargosBase/FormCargosBasePasso2";

const ROTA_LISTAGEM_CARGOS_BASE = "/pages/gestao/cargos-base";

const ETAPAS = [
  { title: "Informações do cargo" },
  { title: "Utilização do cargo" },
  { title: "Módulo do cargo" },
];

export default function CadastrarCargoBase() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const codigoCargoSelecionado = searchParams.get("codigo_cargo");

  const router = useRouter();
  const [etapaAtual, setEtapaAtual] = useState(0);

  const { form, isLoadingCargosBase, isLoadingEditarCargosBase, CargosBaseOpcoes, onSubmitForm } =
    useCriarEditarCargosBase(
      id ? Number(id) : null,
      codigoCargoSelecionado ? { codigo_cargo: codigoCargoSelecionado } : undefined
    );

  const codigoCargo = form.watch("codigo_cargo");
  const descricaoCompleta = form.watch("descricao_completa");
  const ultimaEtapa = etapaAtual === ETAPAS.length - 1;
  const isLoading = isLoadingCargosBase || isLoadingEditarCargosBase;

  const avancarEtapa = () => {
    if (!ultimaEtapa) {
      setEtapaAtual((etapa) => etapa + 1);
    }
  };
  const voltarEtapa = () => {
    if (etapaAtual > 0) {
      setEtapaAtual((etapa) => etapa - 1);
    }
  };

  const cancelar = () => router.push(ROTA_LISTAGEM_CARGOS_BASE);

  return (
    <FormProvider {...form}>
      <PageHeader
        showBackButton={false}
        title="Cadastrar cargo base"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: ROTA_LISTAGEM_CARGOS_BASE },
          { title: "Cargos base", href: ROTA_LISTAGEM_CARGOS_BASE },
          { title: "Cadastrar cargo base", href: "" },
        ]}
        createButton={
          <>
            <Button
              size="lg"
              type="button"
              variant="default"
              data-testid="btn-cancelar"
              onClick={cancelar}
            >
              <span className="font-bold">Cancelar</span>
            </Button>
            <Button
              size="lg"
              type="button"
              variant="default"
              data-testid="btn-anterior"
              onClick={voltarEtapa}
              disabled={etapaAtual === 0}
            >
              <span className="font-bold">Anterior</span>
            </Button>
            <Button
              size="lg"
              type="button"
              variant="destructive"
              data-testid="botao-proximo"
              onClick={avancarEtapa}
              disabled={ultimaEtapa}
            >
              <span className="font-bold">Próximo</span>
            </Button>
          </>
        }
      />
      <form onSubmit={form.handleSubmit(onSubmitForm)}>
        <FundoBranco className="my-4 p-6">
          <Steps
            titlePlacement="vertical"
            ellipsis
            current={etapaAtual}
            items={ETAPAS.map((etapa) => ({ title: etapa.title }))}
            className="pt-4"
          />
        </FundoBranco >

        <FundoBranco className="mb-4 mt-8">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="w-full ">

              {etapaAtual === 0 && (
                <FormCargosBasePrincipal
                  CargosBaseOpcoes={CargosBaseOpcoes}
                  isEditing={id !== null}
                  isLoading={isLoading}
                  codigoCargo={codigoCargo}
                  descricaoCompleta={descricaoCompleta}
                />
              )}
              {etapaAtual === 1 && (
                <FormCargosBasePasso2
                  codigoCargo={codigoCargo}
                  descricaoCompleta={descricaoCompleta}
                />
              )}
              {etapaAtual === 2 && (
                <div data-testid="etapa-modulo-do-cargo">
                  <p className="text-[20px] font-bold pt-1 pb-1">{ETAPAS[2].title}</p>
                  <p className="text-[14px] font-normal pt-1">Módulos em que este cargo poderá ser utilizado.</p>
                </div>
              )}
            </div>

            {/* <div className="w-full lg:w-[40%] pl-0 lg:pl-8">
              */}
          </div>

        </FundoBranco>
      </form>
    </FormProvider>
  );
}
