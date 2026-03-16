"use client";
import ListagemDeDesignacoes from "@/components/dashboard/Designacao/ListagemDeDesignacoes/ListagemDeDesignacoes";


import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from '@/components/ui/button';

import Designacao from "@/assets/icons/Designacao";
import useServidorDesignacao from "@/hooks/useServidorDesignacao";
import {  useRef, useState } from "react";

import{
  FormularioPesquisaUnidadeRef,
} from "@/components/dashboard/Designacao/PesquisaUnidade/FormularioPesquisaUnidade";

import { useRouter } from "next/navigation";

import FiltroDeDesignacoes from "@/components/dashboard/Designacao/FiltroDeDesignacoes/FiltroDeDesignacoes";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListagemDesignacoesResponse } from "@/types/designacao";
import Filter from "@/assets/icons/Alert";
import formSchemaFiltroDesignacao, { formSchemaFiltroDesignacaoData } from "./schema";



const data: ListagemDesignacoesResponse[] = Array.from({ length: 20 }).map((_, index) => ({
  key: index.toString(),
  servidor_indicado: 'Mateus Antônio Miranda',
  rf_servidor_indicado: 987654,
  servidor_titular: 'Mateus Antônio Miranda',
  rf_servidor_titular: 654321,
  sei_titular: 123,
  portaria_designacao: 123,
  ano_designacao: 2025,
  sei_designacao: 123,
  portaria_cessacao: 123,
  ano_cessacao: 123,
  status: index % 4,
}))

export default function DesignacoesPasso1() {
 
 
  const form = useForm<formSchemaFiltroDesignacaoData>({
    resolver: zodResolver(formSchemaFiltroDesignacao),
    defaultValues: {
      rf: "",
      nome_servidor:"",
      periodo: new Date(),
      cargo_base:"",
      cargo_sobreposto:"",
      dre:"",
      unidade_escolar:"",
      ano:"",
    },
    mode: "onChange",
  });



  const onSubmit = (values: formSchemaFiltroDesignacaoData) => {
    console.log(values);

  };
  



  return (
    <>
      <PageHeader
        title={''}
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Designação" },
        ]}
        icon={
          <div className="flex justify-start '">
            <Button
              className="gap-2 rounded-full text-[#660C0B] border-[#660C0B]"
              type="button"
              variant="default"
              size="sm"
            >
              <Filter />
              <span className="font-bold">Filtros</span>
            </Button>
          </div>
        }
        showBackButton={false}
        createButton={
          <Button
            className="gap-2 px-4"
            type="button"
            variant="destructive"
            size="lg"
          >
            <span className="font-bold">Iniciar Nova Designação</span>
            <Designacao width={20} height={20} fill="white" />
          </Button>
        }

      />



      <FundoBranco className="mb-4">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FiltroDeDesignacoes />
          </form>
        </FormProvider>
      </FundoBranco>
      <ListagemDeDesignacoes data={data} />



    </>
  );
}



