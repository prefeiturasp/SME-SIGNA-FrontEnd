"use client";


import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { useHistoricoDeDesignacoes } from "@/hooks/useHistoricoDeDesignacoes";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import { AtosAdministrativosFiltros } from "@/types/designacao";
import FiltroDeHistoricoDeAtosAdministrativos from "@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/FiltroDeHistoricoDeAtosAdministrativos";
import ListagemDeDesignacaoDaUnidade from "@/components/dashboard/Designacao/ListagemDeDesignacaoDaUnidade/ListagemDeDesignacaoDaUnidade";
import { mapearHistoricoParaAtosPrincipais } from "./mappers";

const UE_PADRAO = "014591";

export default function AtosAdministrativos() {

  const searchParams = useSearchParams();

  const codigoUe = searchParams.get("ue") ?? UE_PADRAO;

  const defaultValues: AtosAdministrativosFiltros = {
    tipo: "TODOS",
    portaria: "",
    numero_sei: "",
    nome_titular_e_indicado: "",
    status_publicacao: "",
    periodo_before: "",
    rf: "",
    observacao: "",
  };

  const {
    isPending,
    tabelaKey,
    resultado,
    filterForm,
    onSubmitFilterForm,
    handleClear,
  } = useHistoricoDeDesignacoes(codigoUe, defaultValues);

  const atosPrincipais = useMemo(
    () => mapearHistoricoParaAtosPrincipais(resultado ?? []),
    [resultado]
  );

  const nomeUnidade = resultado?.[0]?.unidade_proponente?.trim();

  const router = useRouter();

  return (
    <>
      <PageHeader
        showBackButton={true}
        title={
          `Histórico da unidade proponente`
        }
        breadcrumbs={[
          { title: "Início", href: "/" },
          {
            title: `Detalhes designação`,
            href: "#",
            onClick: (event) => {
              event.preventDefault();
              router.back();
            },
          },
          { title: "Histórico" },
        ]}
      />



      <FundoBranco className="mb-4 mt-8">
        <FormProvider {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
            <FiltroDeHistoricoDeAtosAdministrativos onClear={handleClear} />
          </form>
        </FormProvider>
      </ FundoBranco>


        <FundoBranco >

        <div className="mt-4">
          <ListagemDeDesignacaoDaUnidade
            ue={nomeUnidade}
            titulo={`Histórico`}
            subtitulo={`Consulte as designações e os atos administrativos relacionados a esta unidade educacional.`}
            key={tabelaKey}
            data={atosPrincipais}
            isLoading={isPending}
          />
        </div>
      </ FundoBranco>
    </>
  );
}
