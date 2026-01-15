"use client";

import { BuscaServidorDesignacaoResponse } from "@/types/busca-servidor-designacao";
import React from "react";
 
 
const InfoItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-2">
    <p className="text-[14px] font-bold ">{label}</p>
    <p className="text-[14px] text-[#6F6C8F]">{value}</p>
  </div>
);

const ResumoDesignacao: React.FC<{ className?: string; defaultValues: BuscaServidorDesignacaoResponse }> = ({ className, defaultValues }) => {
 
  return (
    <div className={className}>
       <div
         className="w-full flex flex-col h-full flex-1"
      >
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 lg:items-center lg:text-left gap-4">



        <InfoItem label="Servidor" value={defaultValues.servidor} />
        <InfoItem label="RF" value={defaultValues.rf} />
        <InfoItem label="Vínculo" value={defaultValues.vinculo} />
        <InfoItem label="Lotação" value={defaultValues.lotacao} />
        <InfoItem label="Cargo base" value={defaultValues.cargo_base} />
        <InfoItem label="Aulas atribuídas" value={defaultValues.aulas_atribuidas} />
        <InfoItem label="Função" value={defaultValues.funcao} />
        <InfoItem label="Cargo sobreposto" value={defaultValues.cargo_sobreposto} />
        <InfoItem label="Laudo Médico" value={defaultValues.laudo_medico} />
        <InfoItem label="Cursos/Títulos" value={defaultValues.cursos_titulos} />
        <InfoItem label="Estágio probatório" value={defaultValues.estagio_probatorio} />
        <InfoItem label="Aprovado em concurso" value={defaultValues.aprovado_em_concurso} />
      

        </div>

         
      </div>
        </div>
  );
};

export default ResumoDesignacao;