"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { OrdenacaoLauda } from "@/utils/export/baixarLauda";

export const OPCOES_ORDENACAO_LAUDA: ReadonlyArray<{
  value: OrdenacaoLauda;
  label: string;
  descricao: string;
}> = [
  { value: "NUMERO_PORTARIA", label: "Número de portaria", descricao: "Ordena pelo número de portaria." },
  {
    value: "DRE",
    label: "Diretoria Regional de Educação",
    descricao: "Ordena pelo nome das DREs selecionadas em ordem alfabética.",
  },
  { value: "TITULO", label: "Título", descricao: "Ordena os títulos em ordem alfabética." },
];

type ModalOrdenacaoLaudaProps = Readonly<{
  open: boolean;
  onCancelar: () => void;
  onConfirmar: (ordenacao: OrdenacaoLauda) => void;
}>;

export default function ModalOrdenacaoLauda({ open, onCancelar, onConfirmar }: ModalOrdenacaoLaudaProps) {
  const [ordenacao, setOrdenacao] = useState<OrdenacaoLauda | "">("");

  const cancelar = () => {
    setOrdenacao("");
    onCancelar();
  };

  const confirmar = () => {
    if (!ordenacao) return;
    setOrdenacao("");
    onConfirmar(ordenacao);
  };

  return (
    <Dialog open={open} onOpenChange={(aberto) => !aberto && cancelar()}>
      <DialogContent className="max-w-[560px] p-8" closeButton={false}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-[20px] font-bold">Como deseja ordenar a lauda?</DialogTitle>
          <DialogDescription className="text-[14px] text-black">
            Selecione como deseja organizar as informações no arquivo antes de fazer o download.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={ordenacao}
          onValueChange={(valor) => setOrdenacao(valor as OrdenacaoLauda)}
          className="flex flex-col gap-3 mt-2"
          aria-label="Ordenação da lauda"
        >
          {OPCOES_ORDENACAO_LAUDA.map((opcao) => {
            const id = `ordenacao-lauda-${opcao.value}`;
            return (
              <label
                key={opcao.value}
                htmlFor={id}
                className="flex items-start gap-3 rounded-md border border-[#DADADA] p-4 cursor-pointer has-[button[data-state=checked]]:border-[#B22B2A]"
              >
                <RadioGroupItem value={opcao.value} id={id} data-testid={id} className="mt-0.5 shrink-0" />
                <span className="flex flex-col gap-1">
                  <span className="text-[14px] font-bold text-[#313131]">{opcao.label}</span>
                  <span className="text-[13px] text-[#555]">{opcao.descricao}</span>
                </span>
              </label>
            );
          })}
        </RadioGroup>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={cancelar}
            data-testid="botao-cancelar-ordenacao-lauda"
          >
            <span className="font-bold">Cancelar</span>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="destructive"
            disabled={!ordenacao}
            onClick={confirmar}
            data-testid="botao-confirmar-ordenacao-lauda"
          >
            <span className="font-bold">Baixar lauda</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
