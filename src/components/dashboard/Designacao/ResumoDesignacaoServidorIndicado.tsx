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
import { InfoItem } from "@/components/ui/info-item";
import { FormEditarServidorData } from "./ModalEditarServidor/schema";

const ResumoDesignacaoServidorIndicado: React.FC<{
  showEditar?: boolean;
  className?: string;
  defaultValues: Servidor;
  isLoading?: boolean;
  showCursosTitulos?: boolean;
  showLotacao?: boolean;
  onSubmitEditarServidor: (data: FormEditarServidorData) => void;
}> = ({
  className,
  defaultValues,
  isLoading,
  showCursosTitulos = false,
  showEditar = false,
  showLotacao = false,
  onSubmitEditarServidor
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
     function handleSubmitEditarServidor(data: FormEditarServidorData) {
      onSubmitEditarServidor(data);
   
    }
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
                <InfoItem
                  label="Nome Servidor"
                  value={defaultValues.nome_servidor}
                />
                <InfoItem
                  label="Nome Civil"
                  value={defaultValues.nome_civil}
                />
                <InfoItem label="RF" value={defaultValues.rf} />

                <InfoItem
                  label="Vínculo"
                  value={defaultValues?.vinculo?.toString() ?? '-'}
                />
                <InfoItem label="Cargo base" value={defaultValues.cargo_base ?? '-'} />

                {showLotacao && (

                  <InfoItem
                    label="Lotação"
                    value={defaultValues.lotacao ?? '-'}
                  />
                )}


                {showCursosTitulos && (
                  <InfoItem
                    label="Cursos/Títulos"
                    value={defaultValues.cursos_titulos ?? 'Cursos/Títulos de exemplo'}
                    icon={
                      <Button
                        type="button"
                        data-testid="btn-visualizar-cursos-titulos"
                        variant="ghost"
                        size="icon"
                        onClick={handleOpenModalListaCursosTitulos}>
                        <Eye
                          width={16}
                          height={16} 
                          className='fill-[#6058A2]'
                          />
                      </Button>
                    }
                  />
                )}


              </div>
              <div className="grid lg:grid-cols-2 xl:grid-cols-4 lg:text-left gap-4 mt-4">

                <InfoItem
                  label="Cargo sobreposto/Função atividade"
                  value={defaultValues.cargo_sobreposto_funcao_atividade ?? '-'}
                />
                <InfoItem
                  label="Local de exercício"
                  value={defaultValues.local_de_exercicio ?? '-'}
                />
                <InfoItem
                  label="Laudo médico"
                  value={defaultValues.laudo_medico ?? '-'}
                />
                <InfoItem
                  label="Local de serviço"
                  value={defaultValues.local_de_servico ?? '-'}
                />
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
              handleSubmitEditarServidor={handleSubmitEditarServidor}
            />

            <ModalListaCursosTitulos
              isLoading={isLoadingCursosETitulos}
              open={openModalListaCursosTitulos}
              onOpenChange={setOpenModalListaCursosTitulos}
              //to-do: remover mock quando conectar com api que recebera dados do EOL
              data={[{ id: 1, concurso: '201002757777 - PROF ENS FUND II MEDIO' }, { id: 2, concurso: "201002757778 - PROF ENS FUND II MEDIO" }]}
              defaultValues={defaultValues}
            />

          </div>
        )}
      </>
    );
  };

export default ResumoDesignacaoServidorIndicado;
