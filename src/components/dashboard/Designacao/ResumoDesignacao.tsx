"use client";

import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import Eye from "@/assets/icons/Eye";
import { Button } from "@/components/ui/button";

import ModalListaCursosTitulos from "./ModalListaCursosTitulo/ModalListaCursosTitulos";
import { IConcursoType } from "./ModalListaCursosTitulo/ModalListaCursosTitulos";
export const InfoItem: React.FC<{ label: string; value?: string; icon?: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-row gap-10">
      <p className="text-[14px] font-bold ">{label}</p>
      {icon && <div className="w-6 h-6">{icon}</div>}
    </div>

    <p className="text-[14px] text-[#6F6C8F]">{value}</p>

  </div>
);

const ResumoDesignacao: React.FC<{
  className?: string;
  defaultValues: BuscaServidorDesignacaoBody;
  isLoading?: boolean;
}> = ({ className, defaultValues, isLoading }) => {



  const [openModalListaCursosTitulos, setOpenModalListaCursosTitulos] = useState(false);

  function handleOpenModalListaCursosTitulos() {
    setOpenModalListaCursosTitulos(!openModalListaCursosTitulos);
  }

  
  const data = [
    {
      id: 1,
      concurso: '201002757777 - PROF ENS FUND II MEDIO',
    },
    {
      id: 2,
      concurso: '201002757778 - PROF ENS FUND II MEDIO',
    },
    {
      id: 3,
      concurso: '201002757779 - PROF ENS FUND II MEDIO',
    },
    {
      id: 4,
      concurso: '201002757780 - PROF ENS FUND II MEDIO',
    },
    {
      id: 5,
      concurso: '201002757781 - PROF ENS FUND II MEDIO',
    },
    {
      id: 6,
      concurso: '201002757782 - PROF ENS FUND II MEDIO',
    },
    {
      id: 7,
      concurso: '201002757783 - PROF ENS FUND II MEDIO',
    },
    {
      id: 8,
      concurso: '201002757784 - PROF ENS FUND II MEDIO',
    },
    {
      id: 9,
      concurso: '201002757785 - PROF ENS FUND II MEDIO',
    },
    {
      id: 1,
      concurso: '201002757786 - PROF ENS FUND II MEDIO',
    },
     
  ] as IConcursoType[];
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
          <div className="w-full flex flex-col h-full flex-1">
            <div className="grid lg:grid-cols-2 xl:grid-cols-4 lg:items-center lg:text-left gap-4">
              <InfoItem label="Servidor" value={defaultValues.nome} />
              <InfoItem label="RF" value={defaultValues.rf} />
              <InfoItem label="Função" value={defaultValues.funcao_atividade} />
              <InfoItem
                label="Cargo sobreposto"
                value={defaultValues.cargo_sobreposto}
              />
              <InfoItem label="Cargo base" value={defaultValues.cargo_base} />

              <InfoItem
                label="Vínculo"
                value={defaultValues.vinculo_cargo_sobreposto}
              />
              <InfoItem
                label="Lotação"
                value={defaultValues.lotacao_cargo_sobreposto}
              />

              <InfoItem
                label="Cursos/Títulos"
                value={defaultValues.cursos_titulos}
                icon={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenModalListaCursosTitulos}>
                    <Eye
                      width={16}
                      height={16} />
                  </Button>
                }
              />



            </div>
          </div>

          <ModalListaCursosTitulos
            open={openModalListaCursosTitulos}
            onOpenChange={setOpenModalListaCursosTitulos}
            data={data}
            defaultValues={defaultValues}
           />

        </div>
      )}
    </>
  );
};

export default ResumoDesignacao;
