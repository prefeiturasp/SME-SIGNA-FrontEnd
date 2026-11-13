"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ModalDataFuturaSemPeriodoProps = Readonly<{
  open: boolean;
  mensagem: string;
  onFechar: () => void;
  onAlterarPeriodo: () => void;
}>;

// Exibe o bloqueio de designação com início futuro sem data final ("Até"),
// seja o detectado no front antes de enviar, seja o devolvido pelo backend
// (`data_futura_sem_periodo`).
export default function ModalDataFuturaSemPeriodo({
  open,
  mensagem,
  onFechar,
  onAlterarPeriodo,
}: ModalDataFuturaSemPeriodoProps) {
  return (
    <Dialog open={open} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="max-w-[560px] p-8" closeButton={false}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-[20px] font-bold">
            Data final obrigatória
          </DialogTitle>
          <DialogDescription className="text-[14px] text-black" data-testid="mensagem-data-futura-sem-periodo">
            {mensagem}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={onFechar}
            data-testid="botao-fechar-data-futura-sem-periodo"
          >
            <span className="font-bold">Fechar</span>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="destructive"
            onClick={onAlterarPeriodo}
            data-testid="botao-alterar-periodo-data-futura-sem-periodo"
          >
            <span className="font-bold">Alterar período</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
