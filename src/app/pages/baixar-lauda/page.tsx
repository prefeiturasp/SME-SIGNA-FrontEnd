"use client";


import { usePortariasDO } from "../../../hooks/usePortariasDO";
import FiltroDeDo from "@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";
import { FormProvider } from "react-hook-form";
import ListagemDeDo from "@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo";
import { colunasListagemDeDo } from "@/components/dashboard/Designacao/ListagemDeDo/colunasListagemDeDo";
import {
  ListagemPortariasResponse,
} from "@/types/designacao";
import { downloadCSV } from "@/utils/export/exportCSV";
import { baixarLauda, FormatoLauda } from "@/utils/export/baixarLauda";
import { formatDate } from "@/utils/formatDate";
import { format } from "date-fns";
import { useAppNotification } from "@/components/providers/NotificationProvider";

export default function BaixarLauda() {
  const {
    handleClear,
    isPending,
    tabelaKey,
    resultado,
    filterForm,
    onSubmitFilterForm,
    salvando,
    setSalvando,
  } = usePortariasDO();
  const notification = useAppNotification();


  const baixarCsv = (selectedRows: ListagemPortariasResponse[]) => {
    // Datas no mesmo formato exibido na tabela (dd/MM/yyyy)
    const linhas = selectedRows.map((row) => ({
      ...row,
      doc: formatDate(row.doc),
      data_designacao: formatDate(row.data_designacao),
      data_cessacao: formatDate(row.data_cessacao),
    }));

    downloadCSV(linhas, colunasListagemDeDo, `lauda-${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`);
  };

  // PDF e Word são gerados pelo backend (texto da lauda vem do modelo de portaria)
  const baixarViaBackend = async (selectedRows: ListagemPortariasResponse[], formato: FormatoLauda) => {
    setSalvando(true);
    const result = await baixarLauda(selectedRows.map((row) => row.id), formato);
    setSalvando(false);

    if (!result.success) {
      notification.error({ title: "Erro ao baixar lauda", description: result.error });
    }
  };

  const handleBaixarLauda = async (selectedRows: ListagemPortariasResponse[], tipoArquivo: string) => {
    if (tipoArquivo === "CSV") baixarCsv(selectedRows);
    if (tipoArquivo === "PDF" || tipoArquivo === "WORD") await baixarViaBackend(selectedRows, tipoArquivo);
  };



  return (
    <>
      <PageHeader
        showBackButton={false}
        title={
          "Baixar lauda"
        }
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Atos Administrativos", href: "/pages/atos-administrativos" },
          { title: "Baixar lauda" }
        ]}        
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
