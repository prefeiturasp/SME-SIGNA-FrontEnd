import * as React from "react";
import { Label } from "@/components/ui/label";

interface FormActionSlotProps {
  readonly children: React.ReactNode;
}

/**
 * Envolve uma ação de linha de formulário (ex.: um botão de busca) que fica
 * ao lado de campos FormItem. Reserva a mesma altura/espaçamento do label
 * via um label invisível, alinhando a ação com os inputs em vez dos labels
 * acima deles.
 */
export function FormActionSlot({ children }: FormActionSlotProps) {
  return (
    <div className="space-y-2">
      <Label className="invisible" aria-hidden="true">
        {" "}
      </Label>
      {children}
    </div>
  );
}
