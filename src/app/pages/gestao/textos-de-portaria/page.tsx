"use client";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import SimpleTableHeader, { SimpleHeaderWithBorder } from "@/components/dashboard/SimpleTableHeader/SimpleTableHeader";
import { Tabs } from "antd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ListagemDeTextosDePortarias from "@/components/dashboard/Gestao/ListagemDeTextosDePortarias/ListagemDeTextosDePortarias";
import { FormProvider } from "react-hook-form";
import { useVisualizarTextosPortaria } from "@/hooks/useVisualizarTextosPortaria";
import FiltroDeTextosPortaria from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/FiltroDeTextosPortaria";



export default function TextosDePortaria() {


   const {
    isPending,    
    resultado,
    onPageChange,
    page,
    filterForm,
    onSubmitFilterForm,
    handleClear,
  } = useVisualizarTextosPortaria();


  return (
    <>
      <PageHeader
        showBackButton={false}
        title={
          "Textos de portarias"
        }
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/" },
          { title: "Textos de portaria", href: "" },
        ]}
      />

      <FundoBranco className="mb-4 mt-8">
        <SimpleTableHeader
          title="Parametrização dos textos de portaria"
          subtitle="Gerencie os modelos de textos utilizados na emissão de Portarias e configure as regras que definem sua composição."
        />
        <Tabs

          defaultActiveKey="1"
          type="card"
          size={"medium"}
          items={[
            {
              label: `Textos de portaria`,
              key: "1",
              children:
                <div className="flex flex-col gap-8">

                  <SimpleHeaderWithBorder
                    title="Crie um novo texto de portaria"
                    subtitle="Cadastre um novo modelo de texto para ser utilizado na geração automática de portarias e outros atos administrativos."
                    buttonRight={
                      <Button
                        size="lg"
                        className="w-full flex items-center justify-center gap-2"
                        variant="destructive"
                        data-testid="botao-proximo"
                        onClick={() => { }}
                      >Cadastrar novo texto
                        <Plus />
                      </Button>
                    }
                  />

                  <FormProvider {...filterForm}>
                    <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
                      <FiltroDeTextosPortaria onClear={handleClear} />
                    </form>
                  </FormProvider>

                  <ListagemDeTextosDePortarias
                    onPageChange={onPageChange}
                    key={"lista-de-textos-de-portarias"}
                    data={resultado.results}
                    total={resultado.count}
                    page={page}
                    isLoading={isPending}
                  />
                </div>
            }, {
              label: `Regras`,
              key: "2",
              children:
                <>
                  TBD
                </>
            }
          ]}
        />

      </ FundoBranco>
    </>
  );
}
