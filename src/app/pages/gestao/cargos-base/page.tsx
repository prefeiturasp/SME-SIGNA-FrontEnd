"use client";

import { useRouter } from "next/navigation";
import Plus from "@/assets/icons/Plus";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from "@/components/ui/button";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import { useCargosBase } from "@/hooks/useCargosBase";
import FiltroDeCargosBase from "@/components/dashboard/Gestao/FiltroDeCargosBase/FiltroDeCargosBase";



export default function CargosBase() {
  const {
    filterForm,
    onSubmitFilterForm,
    handleClear,
  } = useCargosBase();
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
          { title: "Cargo base", href: "" },
        ]}
        createButton={
          <Button
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            variant="destructive"
            data-testid="botao-proximo"
            onClick={() => router.push("/pages/gestao/cadastrar-cargo-base")}
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
        <>listagem de cargos base</>

      </ FundoBranco>
    </>
  );
}
