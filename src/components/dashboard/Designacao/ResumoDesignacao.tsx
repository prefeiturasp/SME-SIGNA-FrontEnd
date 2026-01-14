"use client";

import React from "react";
import { z } from "zod";
 
 
const designacaoSchema = z.object({
  servidor: z
    .string()
    .min(1, "Número da unidade é obrigatório"),
   rf: z.string().optional(),
  vinculo: z.string().optional(),
  lotacao: z.string().optional(),
  cargo_base: z.string().optional(),
  aulas_atribuidas: z.string().optional(),
  funcao: z.string().optional(),
  cargo_sobreposto: z.string().optional(),  
  estagio_probatorio: z.string().optional(),  
  cursos_titulos: z.string().optional(),
  aprovado_em_concurso: z.string().optional(),
  laudo_medico: z.string().optional(),
});

export type DesignacaoResumoValues = z.infer<typeof designacaoSchema>;



const InfoItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-2">
    <p className="text-[14px] font-bold ">{label}</p>
    <p className="text-[14px] text-[#6F6C8F]">{value}</p>
  </div>
);

const ResumoDesignacao: React.FC<{ className?: string; defaultValues: DesignacaoResumoValues }> = ({ className, defaultValues }) => {
  const parsedValues = designacaoSchema.partial().parse(defaultValues);

  return (
    <div className={className}>
       <div
         className="w-full flex flex-col h-full flex-1"
      >
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 lg:items-center lg:text-left gap-4">



        <InfoItem label="Servidor" value={parsedValues.servidor} />
        <InfoItem label="RF" value={parsedValues.rf} />
        <InfoItem label="Vínculo" value={parsedValues.vinculo} />
        <InfoItem label="Lotação" value={parsedValues.lotacao} />
        <InfoItem label="Cargo base" value={parsedValues.cargo_base} />
        <InfoItem label="Aulas atribuídas" value={parsedValues.aulas_atribuidas} />
        <InfoItem label="Função" value={parsedValues.funcao} />
        <InfoItem label="Cargo sobreposto" value={parsedValues.cargo_sobreposto} />
        <InfoItem label="Laudo Médico" value={parsedValues.laudo_medico} />
        <InfoItem label="Cursos/Títulos" value={parsedValues.cursos_titulos} />
        <InfoItem label="Estágio probatório" value={parsedValues.estagio_probatorio} />
        <InfoItem label="Aprovado em concurso" value={parsedValues.aprovado_em_concurso} />
      

        </div>

         
      </div>
        </div>
  );
};

export default ResumoDesignacao;