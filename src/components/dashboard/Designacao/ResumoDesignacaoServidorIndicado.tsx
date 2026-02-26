"use client";

import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import Eye from "@/assets/icons/Eye";
import { Button } from "@/components/ui/button";



import ModalListaCursosTitulos from "./ModalListaCursosTitulo/ModalListaCursosTitulos";
import useCursosETitulos from "@/hooks/useCursosETitulos";
import Edit from "@/assets/icons/Edit";
import { Servidor } from "@/types/designacao-unidade";
import ModalEditarServidor from "./ModalEditarServidor/ModalEditarServidor";
export const InfoItem: React.FC<{ label: string; value?: string; icon?: React.ReactNode; className?: string }> = ({
  label,
  value,
  icon,
  className,
}) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <div className="flex flex-row gap-10">
      <p className="text-[14px] font-bold ">{label}</p>
      {icon && <div className="w-6 h-6">{icon}</div>}
    </div>

    <p className="text-[14px] text-[#6F6C8F]">{value}</p>

  </div>
);

const ResumoDesignacaoServidorIndicado: React.FC<{
  showEditar?: boolean;
  className?: string;
  defaultValues: Servidor;
  isLoading?: boolean;
  showCursosTitulos?: boolean;
  showCamposExtras?: boolean;
  showFuncaoAtividade?: boolean;
  showLotacao?: boolean;
}> = ({
   className,
    defaultValues,
     isLoading,
      showCursosTitulos = false,
       showEditar = false,
         showCamposExtras = false,
          showFuncaoAtividade = false,
           showLotacao = false
           }) => {



  const [openModalListaCursosTitulos, setOpenModalListaCursosTitulos] = useState(false);

  function handleOpenModalListaCursosTitulos() {
    setOpenModalListaCursosTitulos(!openModalListaCursosTitulos);
  }

  const [openModalEditarServidor, setOpenModalEditarServidor] = useState(false);
  function handleOpenModalEditarServidor() {
    setOpenModalEditarServidor(!openModalEditarServidor);
  }

  const { isLoading: isLoadingCursosETitulos } = useCursosETitulos();


  return (
    <>
      {isLoading ? (
        <div className="flex justify-center h-full">
          <Loader2
            data-testid="loading-spinner"
            className="
          h-16 w-16 text-primary 
          animate-spin 
         "
          />
        </div>
      ) : (
        <div className={className}>
          <div className="w-full flex flex-col h-full flex-1 bg-[#FAFAFA] p-4">
            <div className="grid lg:grid-cols-2 xl:grid-cols-4 lg:text-left gap-4">
              <InfoItem label="Nome Servidor" value={defaultValues.nome_servidor} />
              <InfoItem label="Nome Civil" value={defaultValues.nome_civil} />
              <InfoItem label="RF" value={defaultValues.rf} />
              <InfoItem label="Função" value={defaultValues.funcao_atividade} />
              <InfoItem
                label="Cargo sobreposto"
                value={defaultValues.cargo_sobreposto}
              />
              <InfoItem label="Cargo base" value={defaultValues.cargo_base} />

              {showFuncaoAtividade && (

               <InfoItem
                    label="Função atividade"
                    value={defaultValues.funcao_atividade}
                  />
              )}

              <InfoItem
                label="Vínculo"
                value={defaultValues.vinculo_cargo_sobreposto.toString()}
              />
              {showLotacao && (

                <InfoItem
                label="Lotação"
                value={defaultValues.lotacao_cargo_sobreposto}
                />
              )}
              


              {showCamposExtras && (
                <>
                  <InfoItem
                    label="DRE"
                    value={defaultValues.dre}
                  />

                  <InfoItem
                    label="Lotação"
                    value={defaultValues.lotacao_cargo_sobreposto}
                  />

                  <InfoItem label="Código Estrutura Hierarquica" value={defaultValues.codigo_estrutura_hierarquica} />
                </>
              )}

{showCursosTitulos && (
                <InfoItem
                  label="Cursos/Títulos"
                  value={defaultValues.cursos_titulos}
                  icon={
                    <Button
                      type="button"
                      data-testid="btn-visualizar-cursos-titulos"
                      variant="ghost"
                      size="icon"
                      onClick={handleOpenModalListaCursosTitulos}>
                      <Eye
                        width={16}
                        height={16} />
                    </Button>
                  }
                />
              )}



            </div>
          </div>

          {showEditar && (
            <div className="flex justify-end">
              <Button 
              type="button"
               variant="outline"
                size="lg"
                 className=" flex items-center justify-center gap-2" onClick={handleOpenModalEditarServidor}>

                <p className="text-[16px] font-bold">Editar</p>
                <Edit />
              </Button>
            </div>
          )}

          <ModalEditarServidor
            isLoading={false}
            open={openModalEditarServidor}
            onOpenChange={setOpenModalEditarServidor}
            defaultValues={defaultValues}
          />

        <ModalListaCursosTitulos
            isLoading={isLoadingCursosETitulos}
            open={openModalListaCursosTitulos}
            onOpenChange={setOpenModalListaCursosTitulos}
            data={[{ id: 1, concurso: '201002757777 - PROF ENS FUND II MEDIO' }, { id: 2, concurso: "201002757778 - PROF ENS FUND II MEDIO" }]}
            defaultValues={defaultValues}
          />

        </div>
      )}
    </>
  );
};

export default ResumoDesignacaoServidorIndicado;
