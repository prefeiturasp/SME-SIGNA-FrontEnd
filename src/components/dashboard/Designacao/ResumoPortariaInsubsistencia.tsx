"use client";
import React from "react";
import { InfoItem } from "@/components/ui/info-item";
import { formatDate } from "@/utils/formatDate";

import { InsubsistenciaRead } from "@/types/insubsistencia";

const ResumoPortariaInsubsistencia: React.FC<{
  className?: string;
  defaultValues: InsubsistenciaRead;  
  titulo_portaria: string;
}> = ({ className, defaultValues, titulo_portaria }) => {
  return (
    <div className={className}>
      <div className="w-full flex flex-col h-full flex-1 bg-[#FAFAFA]">
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 lg:text-left gap-4">
          <InfoItem
            label={titulo_portaria}
            value={defaultValues.numero_portaria}
          />
          <InfoItem label="Ano vigente" value={defaultValues.ano_vigente} />
          <InfoItem label="Nº SEI" value={defaultValues.sei_numero} />
          <InfoItem label="D.O" value={ defaultValues?.doc ? formatDate(defaultValues.doc) : "-"} />    
        </div>
        <div className="grid lg:grid-cols gap-4 pt-8">
          <InfoItem label="Observações" value={defaultValues.observacoes} />
        </div>
      </div>
    </div>
  );
};

export default ResumoPortariaInsubsistencia;
