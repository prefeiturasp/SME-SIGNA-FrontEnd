"use client";
import React from "react";
import { InfoItem } from "@/components/ui/info-item";
import { Cessacao } from "@/types/designacao";
import { formatDate } from "@/utils/formatDate";

const ResumoPortariaCessacao: React.FC<{
  className?: string;
  defaultValues: Cessacao;
  showExtraFields?: boolean;
}> = ({ className, defaultValues, showExtraFields = false }) => {
  return (
    <div className={className}>
      <div className="w-full flex flex-col h-full flex-1 bg-[#FAFAFA]">
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 lg:text-left gap-4">
          <InfoItem
            label="Nº Portaria de Cessação"
            value={defaultValues.numero_portaria||defaultValues.portaria}
          />
          <InfoItem label="Ano da Cessação" value={defaultValues.ano_vigente} />
          <InfoItem label="Nº SEI" value={defaultValues.sei_numero} />
          <InfoItem label="D.O" value={ defaultValues?.doc ? formatDate(defaultValues.doc) : "-"} />

          {showExtraFields && (
            <>
              <InfoItem
                label="Cessar a partir de"
                value={formatDate(defaultValues.data_cessacao)}
              />
              <InfoItem label="A pedido" value={defaultValues.a_pedido ? 'Sim' : 'Não'} />
              <InfoItem label="Remoção" value={defaultValues.remocao ? 'Sim' : 'Não'} />
              <InfoItem label="Aposentadoria" value={defaultValues.aposentadoria ? 'Sim' : 'Não'} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumoPortariaCessacao;
