"use client";

import { useState } from "react";
import { Building2, FilePlus2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UnidadeCadastrada } from "@/types/designacao-unidade";
import AutocompleteUnidadeCadastrada from "./AutocompleteUnidadeCadastrada";

export type OpcaoNovaDesignacao = "novo_cadastro" | "unidade_cadastrada";

const OPCOES: {
  value: OpcaoNovaDesignacao;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "novo_cadastro",
    title: "Começar um novo cadastro",
    description: "Informe os dados da pessoa servidora e da unidade educacional.",
    icon: <FilePlus2 className="h-5 w-5" />,
  },
  {
    value: "unidade_cadastrada",
    title: "Usar uma unidade educacional já cadastrada",
    description:
      "Selecione uma unidade educacional que já possui atos administrativos registrados para criar uma nova designação vinculada ao seu histórico.",
    icon: <Building2 className="h-5 w-5" />,
  },
];

interface ModalNovaDesignacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinuar: (opcao: OpcaoNovaDesignacao, unidade: UnidadeCadastrada | null) => void;
}

export default function ModalNovaDesignacao({
  open,
  onOpenChange,
  onContinuar,
}: Readonly<ModalNovaDesignacaoProps>) {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<OpcaoNovaDesignacao | null>(null);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<UnidadeCadastrada | null>(null);

  const podeContinuar =
    opcaoSelecionada === "novo_cadastro" ||
    (opcaoSelecionada === "unidade_cadastrada" && !!unidadeSelecionada);

  const handleOpenChange = (aberto: boolean) => {
    if (!aberto) {
      setOpcaoSelecionada(null);
      setUnidadeSelecionada(null);
    }
    onOpenChange(aberto);
  };

  const handleSelecionarOpcao = (opcao: OpcaoNovaDesignacao) => {
    setOpcaoSelecionada(opcao);
    if (opcao !== "unidade_cadastrada") setUnidadeSelecionada(null);
  };

  const handleContinuar = () => {
    if (!opcaoSelecionada || !podeContinuar) return;
    onContinuar(
      opcaoSelecionada,
      opcaoSelecionada === "unidade_cadastrada" ? unidadeSelecionada : null
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[560px] p-8" closeButton={false}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-[20px] font-bold">Nova designação</DialogTitle>
          <DialogDescription className="text-[14px] text-black">
            Escolha como deseja criar a designação.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="flex flex-col gap-4 mt-2">
          <legend className="sr-only">Forma de criação da designação</legend>
          {OPCOES.map((opcao) => {
            const selecionada = opcaoSelecionada === opcao.value;
            return (
              <div
                key={opcao.value}
                className={cn(
                  "rounded-lg border p-4 transition-colors has-[input[type=radio]:focus-visible]:ring-2 has-[input[type=radio]:focus-visible]:ring-[#B22B2A]",
                  selecionada
                    ? "border-[#B22B2A] bg-[#FDF2F2]"
                    : "border-[#DADADA] hover:border-[#B22B2A]"
                )}
              >
                <label className="flex cursor-pointer items-start gap-4 text-left">
                  <input
                    type="radio"
                    name="opcao-nova-designacao"
                    value={opcao.value}
                    checked={selecionada}
                    onChange={() => handleSelecionarOpcao(opcao.value)}
                    data-testid={`opcao-${opcao.value}`}
                    className="sr-only"
                  />
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDECEC] text-[#B22B2A]">
                    {opcao.icon}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-[#313131]">{opcao.title}</span>
                    <span className="text-[14px] text-[#9CA3B9]">{opcao.description}</span>
                  </span>
                </label>

                {selecionada && opcao.value === "unidade_cadastrada" && (
                  <div className="mt-4 pl-12">
                    <AutocompleteUnidadeCadastrada
                      value={unidadeSelecionada}
                      onChange={setUnidadeSelecionada}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            data-testid="botao-voltar-nova-designacao"
          >
            <span className="font-bold">Voltar</span>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="destructive"
            disabled={!podeContinuar}
            onClick={handleContinuar}
            data-testid="botao-continuar-nova-designacao"
          >
            <span className="font-bold">Continuar</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
