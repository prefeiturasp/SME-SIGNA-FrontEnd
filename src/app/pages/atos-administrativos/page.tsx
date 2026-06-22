"use client";


import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { Button } from "@/components/ui/button";
import Designacao from "@/assets/icons/Designacao";
import { Dropdown } from "antd";
import Cancelar from "@/assets/icons/Cancelar";
import DocumentoErro from "@/assets/icons/DocumentoErro";
import Editar from "@/assets/icons/Editar";
import Delete from "@/assets/icons/Delete";
import Plus from "@/assets/icons/Plus";
import ListagemDeAtosAdministrativos from "@/components/dashboard/Designacao/ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos";
import { useAtosAdministrativos } from "@/hooks/useAtosAdministrativos";

export default function AtosAdministrativos() {
  const {
    isPending,
    tabelaKey,
    resultado,
    onPageChange,
    page
  } = useAtosAdministrativos();



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
                  console.log("Nova designação");
                },
              },
              {
                key: '2',
                label: 'Nova cessação',
                icon: <Cancelar width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("Nova cessação");  
                },
              },
              {
                key: '3',
                label: 'Tornar insubsistente',
                icon: <DocumentoErro width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("Tornar insubsistente");
                },
              },
              {
                key: '4',
                label: 'Nova apostila',
                 icon: <Editar width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("Nova apostila");  
                },
              },
              {
                key: '5',
                label: 'Anular apostila',
                icon: <Delete width={20} height={20} color="#9CA3B9" />,
                onClick: () => {
                  console.log("Anular apostila");
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
        <ListagemDeAtosAdministrativos
          isLoading={isPending}
          data={resultado?.results ?? []}                       
          key={tabelaKey}
          total={resultado?.count ?? 0}
          page={page}
          onPageChange={onPageChange}
        />
        
      </FBranco>
    </>
  );
}
