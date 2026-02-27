"use client";

import { Loader2 } from "lucide-react";
import React from "react";
import { PesquisaUnidade } from "@/types/designacao-unidade";
import { InfoItem } from "./ResumoDesignacaoServidorIndicado";

const ResumoPesquisaDaUnidade: React.FC<{
  className?: string;
  defaultValues: PesquisaUnidade;
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
          <div className=" bg-[#FAFAFA] p-4">
            <div className="flex flex-col md:flex-row gap-4" >
              <InfoItem label="DRE" value={defaultValues.dre} className="w-full md:w-[25%]" />
              <InfoItem label="Unidade proponente" value={defaultValues.lotacao} className="w-full md:w-[50%]" />
              <InfoItem
                label="Código Estrutura Hierarquica"
                value={
                  defaultValues.estrutura_hierarquica?.trim()
                    ? defaultValues.estrutura_hierarquica
                    : "-"
                }
                className="w-full md:w-[25%]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumoPesquisaDaUnidade;
