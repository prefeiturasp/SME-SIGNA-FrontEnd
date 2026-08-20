"use client";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import SimpleTableHeader, { SimpleHeaderWithBorder } from "@/components/dashboard/SimpleTableHeader/SimpleTableHeader";
import { Tabs } from "antd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ListagemDeTextosDePortarias from "@/components/dashboard/Gestao/ListagemDeTextosDePortarias/ListagemDeTextosDePortarias";
import { TextosDePortariasPaginada } from "@/types/gestao";



export default function TextosDePortaria() {

  const isPending = false;
  const resultado: TextosDePortariasPaginada = {
    count: 0,
    next: null,
    previous: null,
    results: [
      {id: 1, tipo_de_portaria: "Portaria", nome_do_modelo: "Modelo 1", status: "ATIVO", atualizado_por: "Usuario 1", atualizado_em: "30/06/2026 08:05"},
      {id: 2, tipo_de_portaria: "Portaria", nome_do_modelo: "Modelo 2", status: "ATIVO", atualizado_por: "Usuario 2", atualizado_em: "28/06/2026 11:12"},
      {id: 3, tipo_de_portaria: "Portaria", nome_do_modelo: "Modelo 3", status: "INATIVO", atualizado_por: "Usuario 3", atualizado_em: "15/06/2026 06:30"},
    ],
  };
  const onPageChange = () => { };
  const page = 1;

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

                  <ListagemDeTextosDePortarias
                    onPageChange={onPageChange}
                    key={"lista-de-textos-de-portarias"}
                    data={resultado?.results ?? []}
                    total={resultado?.count ?? 0}
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
