"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "antd";

import ListagemDeAtosAdministrativos from "@/components/dashboard/Designacao/ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos";
import ModalBuscaPortaria from "@/components/dashboard/Designacao/ModalBuscaPortaria/ModalBuscaPortaria";
import Plus from "@/assets/icons/Plus";
import Cancelar from "@/assets/icons/Cancelar";
import DocumentoErro from "@/assets/icons/DocumentoErro";
import DocumentoAlerta from "@/assets/icons/DocumentoAlerta";
import Editar from "@/assets/icons/Editar";
import Delete from "@/assets/icons/Delete";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from "@/components/ui/button";
import Designacao from "@/assets/icons/Designacao";
import { useAtosAdministrativos } from "@/hooks/useAtosAdministrativos";
import { useNovoAto, TipoNovoAto } from "@/hooks/useNovoAto";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import FiltroDeAtosAdministrativos from "@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/FiltroDeAtosAdministrativos";

const CONFIG_MODAL_NOVO_ATO: Record<
  TipoNovoAto,
  { title: string; description: string; fieldLabel: string; anoFieldLabel: string }
> = {
  cessacao: {
    title: "Nova cessação",
    description: "Digite o número e selecione o ano da portaria de designação que deseja cessar.",
    fieldLabel: "Portaria de designação",
    anoFieldLabel: "Ano da designação",
  },
  insubsistencia: {
    title: "Nova insubsistência",
    description:
      "Digite o número e selecione o ano da portaria de designação ou cessação que deseja tornar insubsistente.",
    fieldLabel: "Portaria de designação ou cessação",
    anoFieldLabel: "Ano da designação ou cessação",
  },
  "tornar-sem-efeito": {
    title: "Novo ato de tornar sem efeito",
    description:
      "Digite o número e selecione o ano da portaria da insubsistência que deseja tornar sem efeito.",
    fieldLabel: "Portaria da insubsistência",
    anoFieldLabel: "Ano da insubsistência",
  },
  apostila: {
    title: "Nova apostila",
    description:
      "Digite o número e selecione o ano da portaria de designação ou cessação que deseja apostilar.",
    fieldLabel: "Portaria de designação ou cessação",
    anoFieldLabel: "Ano da designação ou cessação",
  },
  "anular-apostila": {
    title: "Nova anulação de apostila",
    description:
      "Digite o número e selecione o ano da portaria de designação ou cessação vinculada à apostila que deseja anular.",
    fieldLabel: "Portaria de designação ou cessação",
    anoFieldLabel: "Ano da designação ou cessação",
  },
};

export default function AtosAdministrativos() {
  const {
    isPending,
    tabelaKey,
    resultado,
    onPageChange,
    page,
    filterForm,
    onSubmitFilterForm,
    handleClear,
    buscar: buscarAtosAdministrativos,
  } = useAtosAdministrativos();

  const { buscar, isLoading, errorMessage, limparErro } = useNovoAto();
  const [tipoModalAberto, setTipoModalAberto] = useState<TipoNovoAto | null>(null);
  const router = useRouter();

  const handleOpenChangeModal = (open: boolean) => {
    if (!open) {
      setTipoModalAberto(null);
      limparErro();
    }
  };

  const handleBuscarPortaria = async (portaria: string, ano: string) => {
    if (!tipoModalAberto) return;
    await buscar(tipoModalAberto, portaria, ano);
  };

  const handleAtoExcluido = () => {
    buscarAtosAdministrativos(filterForm.getValues(), page);
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
          <Dropdown menu={{
            items: [
              {
                key: '5',
                label: 'Nova designação',
                icon: <Designacao width={20} height={20} color="#9CA3B9" />,
                onClick: () => router.push("/pages/designacoes/designacoes-passo-1"),
              },
              {
                icon: <Cancelar width={20} height={20} color="#9CA3B9" />,
                label: 'Nova cessação',
                key: '3',
                onClick: () => setTipoModalAberto('cessacao'),
              },
              {
                label: 'Tornar insubsistente',
                key: '4',
                icon: <DocumentoErro width={20} height={20} color="#9CA3B9" />,
                onClick: () => setTipoModalAberto('insubsistencia'),
              },
              {
                key: '6',
                label: 'Tornar sem efeito',
                icon: <DocumentoAlerta width={20} height={20} color="#9CA3B9" />,
                onClick: () => setTipoModalAberto('tornar-sem-efeito'),
              },
              {
                key: '2',
                label: 'Nova apostila',
                icon: <Editar width={20} height={20} color="#9CA3B9" />,
                onClick: () => setTipoModalAberto('apostila'),
              },
              {
                key: '1',
                label: 'Anular apostila',
                icon: <Delete width={20} height={20} color="#9CA3B9" />,
                onClick: () => setTipoModalAberto('anular-apostila'),
              },
            ]
          }} placement="top">
            <Button
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              variant="destructive"
              data-testid="botao-proximo"
            >Novo ato
              <Plus />
            </Button>
          </Dropdown>
        }
      />

      {tipoModalAberto && (
        <ModalBuscaPortaria
          open={!!tipoModalAberto}
          onOpenChange={handleOpenChangeModal}
          title={CONFIG_MODAL_NOVO_ATO[tipoModalAberto].title}
          description={CONFIG_MODAL_NOVO_ATO[tipoModalAberto].description}
          fieldLabel={CONFIG_MODAL_NOVO_ATO[tipoModalAberto].fieldLabel}
          anoFieldLabel={CONFIG_MODAL_NOVO_ATO[tipoModalAberto].anoFieldLabel}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSubmit={handleBuscarPortaria}
        />
      )}

      <FundoBranco className="mb-4">
        <FormProvider {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
            <FiltroDeAtosAdministrativos onClear={handleClear} />
          </form>
        </FormProvider>
      </FundoBranco>

      <FundoBranco className="mb-4">
        <ListagemDeAtosAdministrativos
          onPageChange={onPageChange}
          key={tabelaKey}
          data={resultado?.results ?? []}
          total={resultado?.count ?? 0}
          page={page}
          isLoading={isPending}
          onAtoExcluido={handleAtoExcluido}
        />

      </ FundoBranco>
    </>
  );
}
