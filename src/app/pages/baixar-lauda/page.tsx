"use client";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FiltroDeDo from "@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo";
import { FormProvider } from "react-hook-form";
import {
  ListagemPortariasResponse,
} from "@/types/designacao";


import ListagemDeDo from "@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo";
import  { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";
import { message } from "antd";
import { usePortariasDO } from "../../../hooks/usePortariasDO";

export default function BaixarLauda() {
  

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



  const handleBaixarLauda = async (selectedRows: ListagemPortariasResponse[]) => {

    try {
      setSalvando(true);
      message.loading({ content: "Salvando portaria...", duration: 0 });
      // await salvarPortariasDo.mutateAsync({
      //   values: selectedRows,
      //   data_publicacao: undefined
      // });
      message.destroy();
      // setModalSucesso(true);
      setSalvando(false);
      setTimeout(() => {
        // setModalSucesso(false);
        // mainDOForm.reset();
        setTabelaKey((k) => k + 1);
        buscar(filterForm.getValues());
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar portaria:", error);
      message.destroy();
      // setModalErro(true);
      setSalvando(false);
    }
  };



  return (
    <>
      <PageHeader
        title={"Baixar lauda"}
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designações", href: "/pages/listagem-designacoes" }, { title: "Baixar lauda" }]}
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

      <ListagemDeDo
          key={tabelaKey}
          isDisabled={salvando}
          data_considerada_portaria={undefined}
          data_publicacao={undefined}
          value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
          data={resultado ?? []}
          isLoading={isPending}
          onClickButton={handleBaixarLauda}
          labelButton="Alterar data"
        />
      </FundoBranco>
    </>
  );
}
