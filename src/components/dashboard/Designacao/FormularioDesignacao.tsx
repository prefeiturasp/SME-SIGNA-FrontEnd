"use client";

import React from "react";

import { ResumoDesignacaoBody } from "@/types/busca-servidor-designacao";




const FormularioDesignacao: React.FC<{
  className?: string;
  onSubmitDesignacao: (values: ResumoDesignacaoBody) => void;
}> = ({ className, onSubmitDesignacao }) => {


  return (
    <div className={className}>
    Nome da unidade
    </div>
  );
};

export default FormularioDesignacao;
