"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ModalPeriodoSobrepostoProps = Readonly<{
  open: boolean;
  mensagem: string;
  onFechar: () => void;
  onAlterarPeriodo: () => void;
}>;

// Exibe o bloqueio de designação concomitante devolvido pelo backend
// (`periodo_sobreposto`), com a data a partir da qual a nova designação
// pode iniciar.
export default function ModalPeriodoSobreposto({
  open,
  mensagem,
  onFechar,
  onAlterarPeriodo,
}: ModalPeriodoSobrepostoProps) {
  return (
    <Dialog open={open} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="max-w-[560px] p-8" closeButton={false}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-[20px] font-bold">
            Período em conflito com outra designação
          </DialogTitle>
          <DialogDescription className="text-[14px] text-black" data-testid="mensagem-periodo-sobreposto">
            {mensagem}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={onFechar}
            data-testid="botao-fechar-periodo-sobreposto"
          >
            <span className="font-bold">Fechar</span>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="destructive"
            onClick={onAlterarPeriodo}
            data-testid="botao-alterar-periodo-sobreposto"
          >
            <span className="font-bold">Alterar período</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
