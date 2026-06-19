"use client";


import { usePortariasDO } from "../../../hooks/usePortariasDO";
import FiltroDeDo from "@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";

import ListagemDeDo from "@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo";
import {
  ListagemPortariasResponse,
} from "@/types/designacao";
import Designacao from "@/assets/icons/Designacao";
import { Dropdown } from "antd";
import DownloadFiles from "@/assets/icons/DownloadFiles";
import Cancelar from "@/assets/icons/Cancelar";
import DocumentoAlerta from "@/assets/icons/DocumentoAlerta";
import DocumentoErro from "@/assets/icons/DocumentoErro";
import Editar from "@/assets/icons/Editar";
import Delete from "@/assets/icons/Delete";
import Plus from "@/assets/icons/Plus";

export default function BaixarLauda() {
  const {
    handleClear,
    isPending,
    tabelaKey,
    resultado,
    filterForm,
    onSubmitFilterForm,
    salvando,
  } = usePortariasDO();



  const handleBaixarLauda = async (selectedRows: ListagemPortariasResponse[], tipoArquivo: string) => {
    console.log('selectedRows', selectedRows, tipoArquivo);
  };



  return (
    <>
      <PageHeader
        showBackButton={false}
        title={
          "Atos administrativos"
        }
        breadcrumbs={[
          { title: "Início", href: "/" },
        ]}        
        createButton={
          <Dropdown  menu={{
            items: [
              {
                key: '1',
                label: 'Nova designação',
                icon: <Designacao width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("clicar");
                },
              },
              {
                key: '2',
                label: 'Nova cessação',
                icon: <Cancelar width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("clicar");
                },
              },
              {
                key: '3',
                label: 'Tornar insubsistente',
                icon: <DocumentoErro width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("clicar");
                },
              },
              {
                key: '4',
                label: 'Nova apostila',
                 icon: <Editar width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("clicar");
                },
              },
              {
                key: '5',
                label: 'Anular apostila',
                icon: <Delete width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("clicar");
                },
              },
            ]
          }} placement="top">
            <Button
             size="sm"
             className="w-full flex items-center justify-center gap-2"
             variant="destructive"
             data-testid="botao-proximo"
            >Novo ato
            <Plus  />
            </Button>
          </Dropdown> 
        }
      />

      <FBranco className="mb-4">
        <FormProvider {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
            <FiltroDeDo onClear={handleClear} />
          </form>
        </FormProvider>
      </FBranco>

      <FBranco className="mb-4">

        <ListagemDeDo
          isListagemDo={false}
          onClickBaixarLauda={handleBaixarLauda}
          isLoading={isPending}
          data={resultado ?? []}              
          value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}          
          data_considerada_portaria={new Date()}          
          isDisabled={salvando}
          data_publicacao={new Date()}
          key={tabelaKey}
        />
        
      </FBranco>
    </>
  );
}
