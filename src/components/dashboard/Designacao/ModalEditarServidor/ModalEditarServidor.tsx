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
import { Card } from "antd";
import type { IConcursoType } from "@/types/cursos-e-titulos";
import type { Servidor } from "@/types/designacao-unidade";
import { InputField } from "@/components/ui/FieldsForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Control, type FieldValues, type UseFormRegister } from "react-hook-form";
import formSchemaEditarServidor, { FormEditarServidorData } from "./schema";
import { Form } from "@/components/ui/form";
import { useDesignacaoContext } from "@/app/pages/designacoes/DesignacaoContext";

type ModalEditarServidorProps = {
    isLoading: boolean;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    defaultValues: Servidor;
 };



export default function ModalEditarServidor({
    isLoading,
    open,
    onOpenChange,
    defaultValues
}: Readonly<ModalEditarServidorProps>) {
    function handleOpenChange(v: boolean) {
        onOpenChange(v);
    }

    const form = useForm<FormEditarServidorData>({
        resolver: zodResolver(formSchemaEditarServidor),
        defaultValues: {
            nome_servidor: defaultValues.nome_servidor ?? defaultValues.nome,
            nome_civil: defaultValues.nome_civil ?? defaultValues.nome,
            rf: defaultValues.rf,
            
            funcao: defaultValues?.funcao_atividade ?? '',
            cargo_sobreposto: defaultValues.cargo_sobreposto,
            cargo_base: defaultValues.cargo_base,
            funcao_atividade: defaultValues?.funcao_atividade ?? '',
            vinculo_cargo_sobreposto: defaultValues.vinculo_cargo_sobreposto,
            dre: defaultValues.dre,
            lotacao_cargo_sobreposto: defaultValues.lotacao_cargo_sobreposto,
            codigo_estrutura_hierarquica: defaultValues.codigo_estrutura_hierarquica,
            local_de_exercicio: "",
            laudo_medico: "",
            local_de_servico: "",
            esta_afastado: defaultValues.esta_afastado,
        },
        mode: "onChange",
    });
    const { register, control } = form;
    const registerFieldValues = register as unknown as UseFormRegister<FieldValues>;
    const controlFieldValues = control as unknown as Control<FieldValues>;
    const { setFormDesignacaoData, formDesignacaoData } = useDesignacaoContext();

    const handleSubmitEditarServidor = (data: FormEditarServidorData) => {
        if (!formDesignacaoData) return;
        setFormDesignacaoData({
            ...formDesignacaoData,
            servidorIndicado: {
                ...formDesignacaoData.servidorIndicado,
                nome_servidor: data.nome_servidor,
                nome_civil: data.nome_civil,
            },
        });
        onOpenChange(false);
    };


    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[900px] p-8 rounded-none rounded-0">          <Form {...form} >

                <form
                    id="editar-servidor-form"
                    onSubmit={(e) => {
                        e.stopPropagation();
                        form.handleSubmit(handleSubmitEditarServidor)(e);
                    }}
                    data-testid="form-editar-servidor"
                >
                    <DialogHeader>
                        <DialogTitle>Editar dados servidor indicado</DialogTitle>
                        <DialogDescription className="sr-only">
                            Modal com a lista de dados do servidor selecionado.
                        </DialogDescription>
                    </DialogHeader>

                    <Separator className="mt-2" />



                    <div className="h-[720px] overflow-y-auto pt-4">

                        <Card

                            className={`m-0 border-l-4 bg-[#F9F9F9] border-l-[#EBB466]`}
                        >


                            <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-3 ">
                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="nome_servidor"
                                        label="Nome servidor"
                                        placeholder="Nome servidor"
                                        data-testid="input-nome-servidor"
                                    />
                                </div>
                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="nome_civil"
                                        label="Nome Civil"
                                        placeholder="Nome Civil"
                                        data-testid="input-nome-civil"
                                    />
                                </div>
                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="rf"
                                        label="RF"
                                        placeholder="Digite o RF"
                                        data-testid="input-rf"
                                        type="number"
                                        disabled
                                    />
                                </div>
                            </div>


                            <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-2 ">
                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="funcao"
                                        label="Função"
                                        placeholder="Função"
                                        data-testid="input-funcao"
                                        disabled
                                    />
                                </div>

                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="cargo_sobreposto"
                                        label="Cargo sobreposto"
                                        placeholder="Cargo sobreposto"
                                        data-testid="input-cargo-sobreposto"
                                        disabled
                                    />
                                </div>

                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="cargo_base"
                                        label="Cargo base"
                                        placeholder="Cargo base"
                                        data-testid="input-cargo-base"
                                        disabled
                                    />
                                </div>

                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="funcao_atividade"
                                        label="Função atividade"
                                        placeholder="Função atividade"
                                        data-testid="input-funcao-atividade"
                                        disabled
                                    />
                                </div>



                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="vinculo_cargo_sobreposto"
                                        label="Vínculo"
                                        placeholder="Vínculo"
                                        data-testid="input-vinculo-cargo-sobreposto"
                                        disabled
                                    />
                                </div>
                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="dre"
                                        label="DRE"
                                        placeholder="DRE"
                                        data-testid="input-dre"
                                        disabled
                                    />
                                </div>



                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="lotacao_cargo_sobreposto"
                                        label="Lotação"
                                        placeholder="Lotação cargo sobreposto"
                                        data-testid="input-lotacao-cargo-sobreposto"
                                        disabled
                                    />
                                </div>
                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="codigo_estrutura_hierarquica"
                                        label="Código estrutura hierárquica"
                                        placeholder="Código estrutura hierárquica"
                                        data-testid="input-codigo-estrutura-hierarquica"
                                        disabled
                                    />
                                </div>


                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="local_de_exercicio"
                                        label="Local de exercício"
                                        placeholder="Local de exercício"
                                        data-testid="input-local-de-exercicio"
                                        disabled
                                    />
                                </div>


                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="laudo_medico"
                                        label="Laudo médico"
                                        placeholder="Laudo médico"
                                        data-testid="input-laudo-medico"
                                        disabled
                                    />
                                </div>
                                <div className="w-full">
                                    <InputField
                                        register={registerFieldValues}
                                        control={controlFieldValues}
                                        name="local_de_servico"
                                        label="Local de serviço"
                                        placeholder="Local de serviço"
                                        data-testid="input-local-de-servico"
                                        disabled
                                    />
                                </div>
                            </div>

                        </Card>
                    </div>
                    <Separator className="mt-2 mb-2" />


                    <div className="flex justify-end gap-10">

                        <Button
                            type="button"
                            size="lg"
                            className="flex items-center justify-center gap-6 w-[140px]"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            data-testid="botao-proximo"
                        >
                            <p className="text-[16px] font-bold">Cancelar</p>
                        </Button>

                        <Button
                            form="editar-servidor-form"
                            type="submit"
                            size="lg"
                            className="flex items-center justify-center gap-6 w-[140px]"
                            variant="destructive"
                            disabled={isLoading}
                            data-testid="botao-salvar"
                        >
                            <p className="text-[16px] font-bold">Salvar</p>
                        </Button>
                    </div>

                </form>
            </Form>
            </DialogContent>
        </Dialog>
    );
}
