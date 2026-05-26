"use client";
import { useState } from "react";
import { format } from "date-fns";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FiltroDeDo from "@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ListagemPortariasResponse,
} from "@/types/designacao";
 

import ListagemDeDo from "@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo";
import mainDOFormSchema, { mainDOFormSchemaData } from "./mainDOFormSchema";
import MainDOForm, { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";
import { message, Modal, Result } from "antd";
import { useSalvarPortariasDo } from "@/hooks/useSalvarPortariasDO";
import { usePortariasDO } from "@/hooks/usePortariasDO";

export default function AlterarDataDo() {

  const {
    resultado,
    filterForm,
    onSubmitFilterForm,
    handleClear,
    buscar,
    isPending,
    salvando,
    setSalvando,
    tabelaKey,
    setTabelaKey,
  } = usePortariasDO();

  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);

  const salvarPortariasDo = useSalvarPortariasDo();

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
 
 

 

  const onSubmitMainDOForm = (values: mainDOFormSchemaData) => {
    console.log('onSubmitMainDOForm', values);
  };



  
  const handleAlterarDataDo = async (selectedRows: ListagemPortariasResponse[]) => {

    try {
      setSalvando(true);
      message.loading({ content: "Salvando portaria...", duration: 0 });
      await salvarPortariasDo.mutateAsync({
        values: selectedRows,
        data_publicacao: format(data_publicacao, "yyyy-MM-dd")
      });
      message.destroy();
      setModalSucesso(true);
      setSalvando(false);
      setTimeout(() => {
        setModalSucesso(false);
        mainDOForm.reset();
        setTabelaKey((k) => k + 1);
        buscar(filterForm.getValues());
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar portaria:", error);
      message.destroy();
      setModalErro(true);
      setSalvando(false);
    }
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
          key={tabelaKey}
          isDisabled={salvando}
          data_considerada_portaria={data_considerada_portaria}
          data_publicacao={data_publicacao}
          value={portarias_selecionadas}
          data={resultado ?? []}
          isLoading={isPending}
          onClickButton={handleAlterarDataDo}
          labelButton="Alterar data"
        />
      </FundoBranco>


      <Modal open={modalSucesso} footer={null} closable={false} centered>
        <Result
          status="success"
          title="Tudo certo por aqui!"
          subTitle="A alteração de data do Diário Oficial foi concluída com sucesso!"
        />
      </Modal>

      <Modal open={modalErro} footer={null} closable={false} centered>
        <Result
          status="error"
          title="Ocorreu um erro!"
          subTitle="Não foi possível realizar a alteração de data do Diário Oficial.
Por favor, tente novamente."
          extra={[
            <button
              key="fechar"
              onClick={() => setModalErro(false)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Fechar
            </button>,
          ]}
        />
      </Modal>
    </>
  );
}
