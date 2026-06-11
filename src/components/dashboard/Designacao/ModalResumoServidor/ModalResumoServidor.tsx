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
import ResumoDesignacaoServidorIndicado from "../ResumoDesignacaoServidorIndicado";
import { FormDesignacaoEServidorIndicado, useDesignacaoContext } from "@/app/pages/designacoes/DesignacaoContext";
import { useAppNotification } from "@/components/providers/NotificationProvider";

type ModalResumoServidorProps = {
    isLoading: boolean;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    servidores: Servidor[];
};



export default function ModalResumoServidor({
    isLoading,
    open,
    onOpenChange,
    servidores,
}: Readonly<ModalResumoServidorProps>) {
    function handleOpenChange(v: boolean) {
        onOpenChange(v);
    }
    const { setFormDesignacaoData } = useDesignacaoContext();
    const notification = useAppNotification();


    function onClickCopiarRF(defaultValues: Servidor) {


 

         
       
          
          
        setFormDesignacaoData((prevState: FormDesignacaoEServidorIndicado) => {
            return {
                ...(prevState ?? {}),
                rf_titular: defaultValues.rf,
                dadosTitular: defaultValues,    
                tipo_cargo: "disponivel",
            }
        });

        notification.success(
            "RF copiado!"
          );
        
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[900px] p-8 rounded-none rounded-0 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Detalhes do funcionário da unidade</DialogTitle>
                    <DialogDescription className="sr-only">
                        Modal com a Detalhes do funcionário da unidade selecionado.
                    </DialogDescription>
                </DialogHeader>

                <Separator className="mt-2" />

                {servidores?.length ? (
                    servidores.map((servidor) => (
                        <ResumoDesignacaoServidorIndicado
                            key={servidor.rf}
                            defaultValues={servidor}
                            isLoading={isLoading}
                            showCursosTitulos={false}
                            showLotacao={true}
                            onSubmitEditarServidor={() => { }}
                            showEditar={false}
                            showCopiar
                            onClickCopiarRF={onClickCopiarRF}
                        />
                    ))
                ) : (
                    <p>Nenhum servidor encontrado</p>
                )}

                <div className="flex justify-end">

                    <Button
                        type="submit"
                        size="sm"
                        className="flex items-center justify-center "
                        variant="destructive"
                        onClick={() => handleOpenChange(false)}
                        data-testid="botao-proximo"
                    >
                        <p className="text-[16px] font-bold">Sair</p>
                    </Button>
                </div>


            </DialogContent>
        </Dialog>
    );
}
