"use client";
import React from "react";
import { InfoItem } from "@/components/ui/info-item";
import { formatDate } from "@/utils/formatDate";
import { ApostilaDetailRead } from "@/types/apostila";

const ResumoPortariaApostila: React.FC<{
  className?: string;
  defaultValues: ApostilaDetailRead;  
}> = ({ className, defaultValues }) => {
  return (
    <div className={className}>
      <div className="w-full flex flex-col h-full flex-1 bg-[#FAFAFA]">
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 lg:text-left gap-4">
          <InfoItem
            label="Portaria da apostila"
            value={defaultValues.numero_portaria}
          />
          <InfoItem label="Tipo de apostila" value={defaultValues.ato_apostilado_display} />
          <InfoItem label="Nº SEI" value={defaultValues.sei_numero} />
          <InfoItem label="D.O" value={ defaultValues?.doc ? formatDate(defaultValues.doc) : "-"} />    
        </div>
      </div>
    </div>
  );
};

export default ResumoPortariaApostila;
