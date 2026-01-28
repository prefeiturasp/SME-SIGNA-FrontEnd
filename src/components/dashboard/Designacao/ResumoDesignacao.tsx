"use client";

import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import { Skeleton } from "antd";
import { Loader2 } from "lucide-react";
import React from "react";

const InfoItem: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-2">
    <p className="text-[14px] font-bold ">{label}</p>
    <p className="text-[14px] text-[#6F6C8F]">{value}</p>
  </div>
);

const ResumoDesignacao: React.FC<{
  className?: string;
  defaultValues: BuscaServidorDesignacaoBody;
  isLoading?: boolean;
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
              />
 
 
            
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumoDesignacao;
