"use client";


import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { useAtosAdministrativos } from "@/hooks/useAtosAdministrativos";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import { AtosAdministrativosFiltros } from "@/types/designacao";
import FiltroDeHistoricoDeAtosAdministrativos from "@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/FiltroDeHistoricoDeAtosAdministrativos";
import ListagemDeDesignacaoDaUnidade from "@/components/dashboard/Designacao/ListagemDeDesignacaoDaUnidade/ListagemDeDesignacaoDaUnidade";


export default function AtosAdministrativos() {

  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const ue = searchParams.get("ue") ?? "Alipio Correa Neto, Prof.";
  const servidor_indicado = searchParams.get("servidor_indicado") ?? "";
            
  const defaultValues: AtosAdministrativosFiltros = {
    tipo: "TODOS",
    portaria: "",
    numero_sei: "",
    nome_titular_e_indicado: "",
    status_publicacao: "",
    periodo_before: "",
    rf: "",
    ato_id: id ?  Number.parseInt(id) : undefined,
    observacao: "",
  };

  const {
    isPending,
    tabelaKey,
    resultado,
    onPageChange,
    page,
    filterForm,
    onSubmitFilterForm,
    handleClear,
  } = useAtosAdministrativos(defaultValues);



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



      {/* <FundoBranco className="mb-4 mt-8">
        <FormProvider {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
            <FiltroDeHistoricoDeAtosAdministrativos onClear={handleClear} />
          </form>
        </FormProvider>
        </ FundoBranco> */}


        <FundoBranco >

        <div className="mt-4">
          <ListagemDeDesignacaoDaUnidade
            ue={ue}
            titulo={`Histórico`}
            subtitulo={`Consulte as designações e os atos administrativos relacionados a esta unidade educacional.`}
            key={tabelaKey}
            data={resultado?.results ?? []}
            isLoading={isPending}
          />
        </div>
      </ FundoBranco>
    </>
  );
}
