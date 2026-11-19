"use client";

import { useState } from "react";

import { usePortariasDO } from "../../../hooks/usePortariasDO";
import FiltroDeDo from "@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";
import { FormProvider } from "react-hook-form";
import ListagemDeDo from "@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo";
import {
  ListagemPortariasResponse,
} from "@/types/designacao";
import { baixarLauda, FormatoLauda, FORMATOS_LAUDA, OrdenacaoLauda } from "@/utils/export/baixarLauda";
import ModalOrdenacaoLauda from "@/components/dashboard/Designacao/ModalOrdenacaoLauda/ModalOrdenacaoLauda";
import { useAppNotification } from "@/components/providers/NotificationProvider";

const ehFormatoLauda = (tipoArquivo: string): tipoArquivo is FormatoLauda =>
  (FORMATOS_LAUDA as readonly string[]).includes(tipoArquivo);

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
  // Download (PDF, Word ou CSV) aguardando o usuário escolher a ordenação no modal
  const [downloadPendente, setDownloadPendente] = useState<{
    rows: ListagemPortariasResponse[];
    formato: FormatoLauda;
  } | null>(null);


  // Todos os formatos são gerados pelo backend (texto da lauda vem do modelo de portaria)
  const baixarViaBackend = async (
    selectedRows: ListagemPortariasResponse[],
    formato: FormatoLauda,
    ordenacao: OrdenacaoLauda
  ) => {
    setSalvando(true);
    const result = await baixarLauda(selectedRows.map((row) => row.id), formato, ordenacao);
    setSalvando(false);

    if (!result.success) {
      notification.error({ title: "Erro ao baixar lauda", description: result.error });
    }
  };

  const handleBaixarLauda = async (selectedRows: ListagemPortariasResponse[], tipoArquivo: string) => {
    if (ehFormatoLauda(tipoArquivo)) setDownloadPendente({ rows: selectedRows, formato: tipoArquivo });
  };

  const handleConfirmarOrdenacao = async (ordenacao: OrdenacaoLauda) => {
    if (!downloadPendente) return;
    const { rows, formato } = downloadPendente;
    setDownloadPendente(null);
    await baixarViaBackend(rows, formato, ordenacao);
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
            <FiltroDeDo onClear={handleClear} exibirFiltroDre />
          </form>
        </FormProvider>
      </FBranco>

      <FBranco className="mb-4">

        <ListagemDeDo
          isListagemDo={false}
          exibirColunaDre
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

      <ModalOrdenacaoLauda
        open={downloadPendente !== null}
        onCancelar={() => setDownloadPendente(null)}
        onConfirmar={handleConfirmarOrdenacao}
      />
    </>
  );
}
