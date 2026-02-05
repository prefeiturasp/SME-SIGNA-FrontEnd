"use client";
 
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,

} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { InfoItem } from "../ResumoDesignacao";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import { Separator } from "@/components/ui/separator";
import { Table, TableColumnsType } from "antd";
import { IConcursoType } from "@/types/cursos-e-titulos";

type ModalListaCursosTitulosProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    defaultValues: BuscaServidorDesignacaoBody;
     data: IConcursoType[];
};



export default function ModalListaCursosTitulos({
    open,
    onOpenChange,
    defaultValues,
     data
}: Readonly<ModalListaCursosTitulosProps>) {
    function handleOpenChange(v: boolean) {
        onOpenChange(v);
    }
    const columns: TableColumnsType<IConcursoType> = [
        {
            title: 'Concurso',
            dataIndex: 'concurso',
            defaultSortOrder: 'descend',
            sorter: (a, b) => Number(a.id) - Number(b.id),
        },

    ];



    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[660px] p-8 rounded-none rounded-0">
                <DialogHeader>
                    <DialogTitle>Lista de cursos/títulos</DialogTitle>
                    <DialogDescription className="sr-only">
                        Modal com a lista de cursos/títulos do servidor selecionado.
                    </DialogDescription>
                </DialogHeader>

                <Separator className="mt-2" />
                <div className="flex flex-row gap-20 bg-[#FAFAFA] p-4 my-4">
                    <InfoItem label="Servidor" value={defaultValues.nome} />
                    <InfoItem label="RF" value={defaultValues.rf} />
                    <InfoItem label="Função" value={defaultValues.funcao_atividade } />
                </div>


                <div className="h-[400px] overflow-y-auto">
                    <Table<IConcursoType>
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                        showSorterTooltip={{ target: 'sorter-icon' }}
                    />
                </div>
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
