"use client";


import { useRouter, useSearchParams } from "next/navigation";
import ListagemDeAtosAdministrativos from "@/components/dashboard/Designacao/ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { useAtosAdministrativos } from "@/hooks/useAtosAdministrativos";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import { AtosAdministrativosFiltros } from "@/types/designacao";
import FiltroDeHistoricoDeAtosAdministrativos from "@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/FiltroDeHistoricoDeAtosAdministrativos";


export default function AtosAdministrativos() {

  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const tipo = searchParams.get("tipo");
  const ato_raiz_id = searchParams.get("ato_raiz_id");
  const tipo_display = searchParams.get("tipo_display");
  console.log(tipo,ato_raiz_id);
  const numero_portaria = searchParams.get("numero_portaria") ?? "";
  const servidor_indicado = searchParams.get("servidor_indicado") ?? "";
            
  const defaultValues: AtosAdministrativosFiltros = {
    tipo: "",
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
          `Histórico da ${tipo_display}`
        }
        breadcrumbs={[
          { title: "Início", href: "/" },
          {
            title: `Detalhes ${tipo_display}`,
            href: "#",
            onClick: (event) => {
              event.preventDefault();
              router.back();
            },
          },
          { title: "Histórico" },
        ]}

      />



      <FundoBranco className="mb-4">
        <FormProvider {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
            <FiltroDeHistoricoDeAtosAdministrativos onClear={handleClear} />

          </form>
        </FormProvider>

        <div className="mt-4">
          <ListagemDeAtosAdministrativos
            portaria={numero_portaria}
            servidor_indicado={servidor_indicado}
            titulo={`Histórico da ${tipo_display}`}
            subtitulo={`Todos os atos administrativos têm origem em uma designação. Consulte abaixo o histórico completo de atos realizados a partir desta designação.`}
            onPageChange={onPageChange}
            key={tabelaKey}
            data={resultado?.results ?? []}
            total={resultado?.count ?? 0}
            page={page}
            isLoading={isPending}
            showCamposExtras={false}
          />
        </div>
      </ FundoBranco>
    </>
  );
}
