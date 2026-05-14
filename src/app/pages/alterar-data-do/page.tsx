"use client";
import { useState, useTransition, useEffect } from "react";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FiltroDeDo from "@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ListagemPortariasResponse,
} from "@/types/designacao";
import {
  fetchPortarias,
} from "@/actions/designacao";

import ListagemDeDo from "@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo";
import filterFormSchemaFiltroDO, { filterFormSchemaFiltroDOData } from "./filterFormSchemaFiltroDO";
import mainDOFormSchema, { mainDOFormSchemaData } from "./mainDOFormSchema";
import MainDOForm, { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";

export default function AlterarDataDo() {
  const [resultado, setResultado] = useState<ListagemPortariasResponse[]>([
    {
      id: 1,
      portaria_designacao: "25986",
      doc: "123456",
      tipo_ato: "CESSAR",
      titular_nome_servidor: "Jader Santos",
      cargo_vaga_display: "AD",
      do: "0025985",
      data_designacao: "2026-01-01",
      data_cessacao: "2026-01-01",
      sei_numero: "6016.2026/0041487",
    },
    {
      id: 2,
      portaria_designacao: "25987",
      doc: "123456",
      tipo_ato: "SUBSTITUIÇÃO",
      titular_nome_servidor: "Christian Chang",
      cargo_vaga_display: "Secretário",
      do: "021489",
      data_designacao: "",
      data_cessacao: "2026-05-07",
      sei_numero: "6016.2026/0041487",
    }
  ]);
  const [isPending, startTransition] = useTransition();
  const mainDOForm = useForm<mainDOFormSchemaData>({
    resolver: zodResolver(mainDOFormSchema),
    defaultValues: {
      portarias_selecionadas: PORTARIAS_SEM_DATA_DE_PUBLICACAO,
      data_considerada_portaria: undefined,
    },
    mode: "onChange",
  });


  const data_considerada_portaria = mainDOForm.watch("data_considerada_portaria");
  const data_publicacao = mainDOForm.watch("data_publicacao");

  const portarias_selecionadas = mainDOForm.watch("portarias_selecionadas");
  const filterForm = useForm<filterFormSchemaFiltroDOData>({
    resolver: zodResolver(filterFormSchemaFiltroDO),
    defaultValues: {
      numero_sei: "",
      portaria_inicial: "",
      portaria_final: "",
      ano: new Date().getFullYear().toString(),
      listar_para: "",
    },
    mode: "onChange",
  });


  const portariaInicial = filterForm.watch("portaria_inicial");
  const portariaFinal = filterForm.watch("portaria_final");

  useEffect(() => {
    filterForm.trigger(["portaria_inicial", "portaria_final"]);
  }, [portariaInicial, portariaFinal, filterForm]);

  const generateDesignacaoFiltros = (
    values: filterFormSchemaFiltroDOData
  ) => {

    return {
      numero_sei: values.numero_sei,
      portaria_inicial: values.portaria_inicial,
      portaria_final: values.portaria_final,
      ano: values.ano,
      listar_para: values.listar_para,
    };
  };




  const buscarPortarias = async (
    values: filterFormSchemaFiltroDOData,
  ) => {
    const filtros = {
      ...generateDesignacaoFiltros(values),
    };

    return fetchPortarias(filtros);
  };
  const buscar = (values: filterFormSchemaFiltroDOData) => {
    startTransition(async () => {

      const response = await buscarPortarias(values);

      if (response.success) {
        setResultado(response.data);
      } else {
        console.error(response.error);
      }
    });
  };

  useEffect(() => {
    buscar(filterForm.getValues());
  }, []);

  const onSubmitFilterForm = (values: filterFormSchemaFiltroDOData) => {
    buscar(values);
  };

  const onSubmitMainDOForm = (values: mainDOFormSchemaData) => {
    console.log('onSubmitMainDOForm', values);
  };

  const onPageChange = () => {
    buscar(filterForm.getValues());
  };

  const handleClear = () => {
    filterForm.reset({
      numero_sei: "",
      portaria_inicial: "",
      portaria_final: "",
      ano: new Date().getFullYear().toString(),
      listar_para: "",
    });

    buscar(
      {
        numero_sei: "",
        portaria_inicial: "",
        portaria_final: "",
        ano: new Date().getFullYear().toString(),
        listar_para: "",
      },

    );
  };
  const handleAlterarDataDo = (selectedRows: ListagemPortariasResponse[]) => {
    console.log('handleAlterarDataDo', selectedRows);
    console.log('data_publicacao', data_publicacao);
    // fazer a integração com o backend
  };



  return (
    <>
      <PageHeader
        title={"Alterar data do D.O"}
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designações", href: "/pages/listagem-designacoes" }, { title: "Alterar data do D.O" }]}
        showBackButton={false}
      />

      <FundoBranco className="mb-4">
        <FormProvider {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
            <FiltroDeDo onClear={handleClear} />
          </form>
        </FormProvider>
      </FundoBranco>
      <FundoBranco className="mb-4">

        <FormProvider {...mainDOForm}>
          <form onSubmit={mainDOForm.handleSubmit(onSubmitMainDOForm)}>
            <MainDOForm onClear={handleClear} />
          </form>
        </FormProvider>


        <ListagemDeDo
          data_considerada_portaria={data_considerada_portaria}
          data_publicacao={data_publicacao}
          value={portarias_selecionadas}
          data={resultado ?? []}
          isLoading={isPending}
          onPageChange={onPageChange}
          onClickButton={handleAlterarDataDo}
          labelButton="Alterar data"
        />
      </FundoBranco>
    </>
  );
}
