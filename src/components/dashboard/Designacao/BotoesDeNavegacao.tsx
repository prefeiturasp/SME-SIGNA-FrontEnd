"use client";

import { Button } from "@/components/ui/button";
 import React from "react";
 
 
 
 type StepRendererProps = {
   disableAnterior: boolean;
  disableProximo: boolean;
    onProximo: () => void;
  onAnterior: () => void;
};

export default function BotoesDeNavegacao({
   disableAnterior,
  disableProximo,
   onProximo,
  onAnterior,
 
}: Readonly<StepRendererProps>) {
  
  return (
    <div className="flex items-center justify-between">
    <div className="w-[200px] pt-[2rem] ">
      <Button
        size="lg"
        className="w-full flex items-center justify-center gap-6"
        variant="default"
        disabled={disableAnterior}
        onClick={onAnterior}
        data-testid="botao-anterior"
      >
        <p className="text-[16px] font-bold">Voltar</p>
      </Button>
    </div>

    <div className="w-[200px] pt-[2rem] ">
      <Button
        type="submit"
        size="lg"
        className="w-full flex items-center justify-center gap-6"
        variant="destructive"
        disabled={disableProximo}
        onClick={onProximo}
        data-testid="botao-proximo"
      >
        <p className="text-[16px] font-bold">Avançar</p>
      </Button>
    </div>
  </div>
  );
};
 