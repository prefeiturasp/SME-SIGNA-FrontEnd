"use client";

import { useRouter } from "next/navigation";
import Plus from "@/assets/icons/Plus";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from "@/components/ui/button";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import { useVisualizarCargosBase } from "@/hooks/useVisualizarCargosBase";
import FiltroDeCargosBase from "@/components/dashboard/Gestao/FiltroDeCargosBase/FiltroDeCargosBase";
import ListagemDeCargos from "@/components/dashboard/Gestao/ListagemDeCargos/ListagemDeCargos";



export default function CargosBase() {
  const { 
    isPending,    
    resultado,
    onPageChange,
    page,
    filterForm,
    onSubmitFilterForm,
    handleClear,
  } = useVisualizarCargosBase();
  const router = useRouter();

  return (
    <>
      <PageHeader
        showBackButton={false}
        title={
          "Gestão de cargos base"
        }
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/" },
          { title: "Cargos base", href: "" },
        ]}
        createButton={
          <Button
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            variant="destructive"
            data-testid="botao-proximo"
            onClick={() => router.push("/pages/gestao/criar-editar-cargo-base")}
          >Cadastrar novo cargo
            <Plus />
          </Button>
        }
      />


      <FundoBranco className="mb-4 mt-8">
        <FormProvider {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
            <FiltroDeCargosBase onClear={handleClear} />
          </form>
        </FormProvider>
      </FundoBranco>

      <FundoBranco className="mb-4">
        <ListagemDeCargos
          onPageChange={onPageChange}
          key={"lista-de-cargos-base"}
          data={resultado?.results ?? []}
          total={resultado?.count ?? 0}
          page={page}
          isLoading={isPending}
        />

      </ FundoBranco>
    </>
  );
}
