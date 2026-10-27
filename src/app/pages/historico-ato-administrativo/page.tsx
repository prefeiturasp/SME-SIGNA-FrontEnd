"use client";


import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { useHistoricoDeDesignacoes } from "@/hooks/useHistoricoDeDesignacoes";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import FiltroDeHistoricoDeAtosAdministrativos from "@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/FiltroDeHistoricoDeAtosAdministrativos";
import ListagemDeDesignacaoDaUnidade from "@/components/dashboard/Designacao/ListagemDeDesignacaoDaUnidade/ListagemDeDesignacaoDaUnidade";
import { mapearHistoricoParaAtosPrincipais } from "./mappers";


export default function AtosAdministrativos() {

  const searchParams = useSearchParams();

  const codigoUe = searchParams.get("ue")?.trim() ?? "";

  const {
    isPending,
    tabelaKey,
    resultado,
    filterForm,
    onSubmitFilterForm,
    handleClear,
  } = useHistoricoDeDesignacoes(codigoUe);

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
            <FiltroDeHistoricoDeAtosAdministrativos codigoUe={codigoUe} onClear={handleClear} />
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
