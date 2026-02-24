"use client";

import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import Eye from "@/assets/icons/Eye";
import { Button } from "@/components/ui/button";


 
import { Servidor } from "@/types/designacao-unidade";
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

const ResumoDesignacao: React.FC<{
  onClickEditar?: () => void;
  showEditar?: boolean;
  className?: string;
  defaultValues: Servidor;
  isLoading?: boolean;  
  showCamposExtras?: boolean;
}> = ({ className, defaultValues, isLoading }) => {


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
            <InfoItem label="Nome Servidor" value={defaultValues.nome} />
            <InfoItem label="Nome Civil" value={defaultValues.nome} />
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



            </div>
          </div>



        </div>
      )}
    </>
  );
};

export default ResumoDesignacao;
