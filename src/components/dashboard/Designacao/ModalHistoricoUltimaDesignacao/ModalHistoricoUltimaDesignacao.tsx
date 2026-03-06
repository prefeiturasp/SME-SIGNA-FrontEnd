"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Servidor } from "@/types/designacao-unidade";

type PortariaCessacao = {
    numero_portaria: string;
    ano: string;
    numero_sei: string;
    doc: string;
    designacao_a_partir_de: string;
    ate: string;
    carater_excepcional: boolean | string;
    motivo_cancelamento: string;
    impedimento_substituicao: string;
};

type ModalUltimaDesignacaoProps = {
    isLoading: boolean;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    ultimoServidor?: Servidor | null;
    portariaCessacao: PortariaCessacao | null;
};

type CampoInfoProps = Readonly<{ label: string; value?: string | null }>;

function CampoInfo({ label, value }: CampoInfoProps) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[#333]">{label}</span>
            <span className="text-sm text-[#555]">{value ?? "—"}</span>
        </div>
    );
}

// to-do -> Alterar esse modal para os novos campos.
export default function ModalUltimaDesignacao({
    open,
    onOpenChange,
    ultimoServidor,
    portariaCessacao,
}: Readonly<ModalUltimaDesignacaoProps>) {

    function handleOpenChange(v: boolean) {
        onOpenChange(v);
    }

    const caraterExcepcionalLabel =
        portariaCessacao?.carater_excepcional === true ||
            portariaCessacao?.carater_excepcional === "sim"
            ? "Sim"
            : "Não";

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[900px] p-8 rounded-none">
                <DialogHeader>
                    <DialogTitle>Última designação</DialogTitle>
                    <DialogDescription className="sr-only">
                        Modal exibindo os detalhes da última designação do servidor.
                    </DialogDescription>
                </DialogHeader>
                <Separator className="mt-2 mb-3" />
                {ultimoServidor ? (
                    <div className="bg-[#FAFAFA] rounded p-4 flex flex-col gap-4">
                        <div className="grid grid-cols-4 gap-4">
                            <CampoInfo
                                label="Nome Servidor"
                                value={ultimoServidor.nome_servidor}
                            />
                            <CampoInfo
                                label="Nome Civil"
                                value={ultimoServidor.nome_civil}
                            />
                            <CampoInfo
                                label="RF"
                                value={ultimoServidor.rf}
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <CampoInfo
                                label="Cargo sobreposto"
                                value={ultimoServidor.cargo_sobreposto_funcao_atividade}
                            />
                            <CampoInfo
                                label="Cargo base"
                                value={ultimoServidor.cargo_base}
                            />
                            <CampoInfo
                                label="Vínculo"
                                value={ultimoServidor.vinculo?.toString()}
                            />
                            <CampoInfo
                                label="Lotação"
                                value={ultimoServidor.lotacao}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-muted-foreground">Nenhuma designação encontrada.</p>
                    </div>
                )}
                {portariaCessacao && (
                    <div>
                        <span className="text-sm font-bold text-[#333]">Portaria de Cessação</span>
                        <div className="mt-6 bg-[#FAFAFA] rounded p-4 flex flex-col gap-4">
                            {/* Linha 1 */}
                            <div className="grid grid-cols-4 gap-4">
                                <CampoInfo
                                    label="Nº Portaria da designação"
                                    value={portariaCessacao.numero_portaria}
                                />
                                <CampoInfo
                                    label="Ano"
                                    value={portariaCessacao.ano}
                                />
                                <CampoInfo
                                    label="Nº SEI"
                                    value={portariaCessacao.numero_sei}
                                />
                                <CampoInfo
                                    label="DOC"
                                    value={portariaCessacao.doc}
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <CampoInfo
                                    label="Designação a partir de"
                                    value={portariaCessacao.designacao_a_partir_de}
                                />
                                <CampoInfo
                                    label="Até"
                                    value={portariaCessacao.ate}
                                />
                                <CampoInfo
                                    label="Caráter Excepcional"
                                    value={caraterExcepcionalLabel}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <CampoInfo
                                    label="Motivo Cancelamento"
                                    value={portariaCessacao.motivo_cancelamento}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <CampoInfo
                                    label="Impedimento para Substituição"
                                    value={portariaCessacao.impedimento_substituicao}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end mt-8">
                    <Button
                        type="button"
                        size="lg"
                        className="w-[140px] bg-[#B22222] hover:bg-[#8B0000] text-white"
                        onClick={() => handleOpenChange(false)}
                        data-testid="botao-sair-modal"
                    >
                        <span className="text-[16px] font-bold">Sair</span>
                    </Button>
                </div>
                <span className="block w-full text-[20px] font-bold text-red-500 text-center">
                    Dados fixos no código, ainda sem conexão com banco de dados.
                </span>
            </DialogContent>
        </Dialog>
    );
}