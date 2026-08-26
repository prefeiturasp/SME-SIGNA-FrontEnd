"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from "@/components/ui/button";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import FormCargosBasePrincipal from "@/components/dashboard/Gestao/FormCargosBase/FormCargosBasePrincipal";
import FormCargosBaseSecundario from "@/components/dashboard/Gestao/FormCargosBase/FormCargosBaseSecundario";
import { useCriarEditarCargosBase } from "@/hooks/useCriarEditarCargosBase";



export default function CriarEditarCargoBase() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");


  const {
    form,
    onSubmitForm,    
    CargosBaseOpcoes,
    isLoadingEditarCargosBase,
    isLoadingCargosBase,
  } = useCriarEditarCargosBase( id ? Number(id) : null);

  const router = useRouter(); 

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)}>
        <PageHeader
          showBackButton={false}
          title={
            id ? "Editar cargo base" : "Cadastrar cargo base"
          }
          breadcrumbs={[
            { title: "Início", href: "/" },
            { title: "Gestão", href: "/pages/gestao/cargos-base" },
            { title: "Cargos base", href: "/pages/gestao/cargos-base" },
            { title: id ? "Editar cargo base" : "Cadastrar cargo base", href: "/" },
          ]}
          createButton={
            <div className="flex justify-end gap-2">
              <Button
                size="lg"
                type="button"
                variant="default"
                className="gap-2"
                onClick={() => router.push("/pages/gestao/cargos-base")}
                data-testid="btn-voltar"
              >
                <span className="font-bold">Cancelar</span>
              </Button>
              <Button
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                variant="destructive"
                data-testid="botao-cadastrar-cargo"
                type="submit"               
                disabled={isLoadingEditarCargosBase || isLoadingCargosBase}
              >
                {id ? "Salvar" : "Cadastrar cargo"}
              </Button>
            </div>
          }
        />

        <div className="w-full flex flex-col lg:flex-row gap-4 mb-4 mt-8" >
          <FundoBranco className="w-full lg:w-[50%]">
            <FormCargosBasePrincipal CargosBaseOpcoes={CargosBaseOpcoes} isEditing={id !== null} isLoading={isLoadingEditarCargosBase || isLoadingCargosBase}/>
          </FundoBranco>

          <FundoBranco className="w-full lg:w-[50%]">
            <FormCargosBaseSecundario/>
          </FundoBranco>
        </div>

      </form>
    </FormProvider>
  );
}
