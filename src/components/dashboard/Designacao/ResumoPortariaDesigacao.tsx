"use client";

import { Loader2 } from "lucide-react";
import React  from "react";
import { InfoItem } from "@/components/ui/info-item";
import { PortariaDesignacao } from "@/types/portaria-designacao";
 
const ResumoPortariaDesigacao: React.FC<{
   className?: string;
  defaultValues: PortariaDesignacao;
  isLoading?: boolean;
  showExtraFields?: boolean;
 }> = ({
  className,
  defaultValues,
  isLoading,
  showExtraFields = true,
}) => {
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
                  label="Portaria da designação"
                  value={defaultValues.numero_portaria}
                />
                <InfoItem
                  label="Ano Vigente"
                  value={defaultValues.ano_vigente}
                />
                <InfoItem label="Nº SEI" value={defaultValues.sei_numero} />

                <InfoItem
                  label="D.O"
                  value={defaultValues.doc || "-"}
                />
                {showExtraFields && (
                  <>
                    <InfoItem label="A partir de" value={defaultValues.data_inicio ?? '-'} />
                    <InfoItem label="Até" value={defaultValues.data_fim ?? '-'} />
                    <InfoItem label="Caráter Excepcional" value={defaultValues.carater_excepcional? 'Sim':'Não'} />
                    <InfoItem label="Impedimento para substituição:" value={defaultValues.impedimento_substituicao ?? '-'} />
                    <InfoItem label="Motivo do afastamento:" value={defaultValues.motivo_afastamento ?? '-'} />
                    <InfoItem label="Pendência:" value={defaultValues.pendencias ?? '-'} />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

export default ResumoPortariaDesigacao;
