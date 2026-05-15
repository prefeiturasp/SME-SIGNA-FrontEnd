"use client";
import React from "react";
import { InfoItem } from "@/components/ui/info-item";
import { Cessacao } from "@/types/designacao";

const ResumoPortariaCessacao: React.FC<{
  className?: string;
  defaultValues: Cessacao;
}> = ({ className, defaultValues }) => {
  return (
    <div className={className}>
      <div className="w-full flex flex-col h-full flex-1 bg-[#FAFAFA] p-4">
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 lg:text-left gap-4">
          <InfoItem
            label="Nº Portaria de Cessação"
            value={defaultValues.numero_portaria}
          />
          <InfoItem label="Ano da Cessação" value={defaultValues.ano_vigente} />
          <InfoItem label="Nº SEI" value={defaultValues.sei_numero} />
          <InfoItem label="D.O" value={defaultValues.doc} />
        </div>
      </div>
    </div>
  );
};

export default ResumoPortariaCessacao;
