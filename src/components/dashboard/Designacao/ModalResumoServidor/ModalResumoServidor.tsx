"use client";
 
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,

} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import ResumoDesignacao from "../ResumoDesignacao";
import { Separator } from "@/components/ui/separator";
 
import { Servidor } from "@/types/designacao-unidade";
 
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
 


    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[900px] p-8 rounded-none rounded-0">
                <DialogHeader>
                    <DialogTitle>Detalhes do funcionário da unidade</DialogTitle>
                    <DialogDescription className="sr-only">
                        Modal com a Detalhes do funcionário da unidade selecionado.
                    </DialogDescription>
                </DialogHeader>

                <Separator className="mt-2" />
                
<<<<<<< HEAD
                <ResumoDesignacao defaultValues={servidor } isLoading={isLoading} showCursosTitulos={false} />
=======
                {servidores?.length ? (
                    servidores.map((servidor) => (
                        <ResumoDesignacao
                            key={servidor.rf}
                            defaultValues={servidor}
                            isLoading={isLoading}
                            showCursosTitulos={false}
                        />
                    ))
                ) : (
                    <p>Nenhum servidor encontrado</p>
                )}
>>>>>>> test

                <div className="flex justify-end">

                    <Button
                        type="submit"
                        size="lg"
                        className="flex items-center justify-center gap-6 w-[140px]"
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
