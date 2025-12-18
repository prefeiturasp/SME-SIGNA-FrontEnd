"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import LogoGipe from "@/components/login/LogoGipe";
import { Button } from "@/components/ui/button";
import useCadastro from "@/hooks/useCadastro";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input, InputMask } from "@/components/ui/input";
import { Combobox } from "@/components/ui/Combobox";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import formSchema, { FormDataSignup } from "./schema";
import Aviso from "./Aviso";
import Finalizado from "./Finalizado";
import ErrorMessage from "./ErrorMessage";
import { useFetchDREs, useFetchUEs } from "@/hooks/useUnidades";
import AlertSmall from "@/assets/icons/AlertSmall";

export default function FormCadastro() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [cadastroFinalizado, setCadastroFinalizado] = useState(false);
    const { data: dreOptions = [] } = useFetchDREs();
    const router = useRouter();
    const cadastroMutation = useCadastro();
    const { mutateAsync, isPending } = cadastroMutation;
    const isLoading = isPending;

    const form = useForm<FormDataSignup>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dre: "",
            ue: "",
            fullName: "",
            cpf: "",
            email: "",
        },
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const values = form.watch();
    const { data: ueOptions = [] } = useFetchUEs(values.dre);

    async function tratarCadastro() {
        setErrorMessage(null);

        const payload = {
            username: values.cpf.replace(/\D/g, ""),
            name: values.fullName,
            cpf: values.cpf.replace(/\D/g, ""),
            email: values.email,
            cargo: 3360,
            rede: "INDIRETA",
            unidades: [values.ue],
        };

        const response = await mutateAsync(payload);

        if (response.success) {
            setCadastroFinalizado(true);
        } else {
            if (response.field && response.error) {
                const formField =
                    response.field === "username"
                        ? "cpf"
                        : (response.field as keyof FormDataSignup);
                form.setError(formField, {
                    type: "server",
                    message: "",
                });
            }

            setErrorMessage(response.error);
        }
    }

    if (cadastroFinalizado) {
        return <Finalizado />;
    }

    return (
        <Form {...form}>
            <form
                className="w-full max-w-sm"
                onSubmit={form.handleSubmit(tratarCadastro)}
            >
                <div className="flex justify-start mb-4">
                    <LogoGipe className="w-48" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Faça o seu cadastro
                </h1>
                <p className="text-sm text-gray-600 mb-10">
                    Preencha os dados para solicitar acesso ao GIPE.
                </p>
                <Aviso icon={<AlertSmall className="w-[22px]" />}>
                    O cadastro de novos usuários é permitido apenas para
                    diretores escolares.
                </Aviso>

                <FormField
                    control={form.control}
                    name="dre"
                    render={({ field }) => (
                        <FormItem className="mb-4 mt-4">
                            <FormLabel className="required text-[#42474a] text-[14px] font-[700]">
                                Selecione a DRE
                            </FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={field.disabled}
                                    data-testid="select-dre"
                                >
                                    <SelectTrigger className="w-full border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#717FC7]">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dreOptions.map(
                                            (dre: {
                                                uuid: string;
                                                nome: string;
                                            }) => (
                                                <SelectItem
                                                    key={dre.uuid}
                                                    value={dre.uuid}
                                                >
                                                    {dre.nome}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="ue"
                    render={({ field }) => (
                        <FormItem className="mb-4">
                            <FormLabel className="required text-[#42474a] text-[14px] font-[700]">
                                Digite o nome da UE
                            </FormLabel>
                            <FormControl>
                                <Combobox
                                    data-testid="select-ue"
                                    options={ueOptions.map(
                                        (ue: { 
                                            nome: string; 
                                            uuid: string;
                                        }) => ({
                                            label: ue.nome,
                                            value: ue.uuid,
                                        })
                                    )}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Exemplo: EMEF João da Silva"
                                    disabled={!values.dre}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem className="mb-4">
                            <FormLabel className="required text-[#42474a] text-[14px] font-[700]">
                                Qual o seu nome completo?
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Exemplo: Maria Clara Medeiros"
                                    className="font-normal"
                                    data-testid="input-fullName"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                        <FormItem className="mb-4">
                            <FormLabel className="required text-[#42474a] text-[14px] font-[700]">
                                Qual o seu CPF?
                            </FormLabel>
                            <FormControl>
                                <InputMask
                                    {...field}
                                    inputMode="numeric"
                                    placeholder="123.456.789-10"
                                    maskProps={{
                                        mask: "999.999.999-99",
                                    }}
                                    className="font-normal"
                                    data-testid="input-cpf"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="mb-6 mt-8">
                            <FormLabel className="required text-[#42474a] text-[14px] font-[700]">
                                Qual o seu e-mail?
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="email"
                                    placeholder="Digite o seu e-mail corporativo"
                                    className="font-normal"
                                    data-testid="input-email"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <ErrorMessage message={errorMessage} />

                <Button
                    type="submit"
                    variant="secondary"
                    className="w-full text-center rounded-md text-[16px] font-[700] md:h-[45px] inline-block align-middle bg-[#717FC7] text-white hover:bg-[#5a65a8]"
                    disabled={
                        isLoading ||
                        Object.keys(form.formState.errors).length > 0
                    }
                    loading={isLoading}
                    data-testid="button-cadastrar"
                >
                    Cadastrar agora
                </Button>

                <Button
                    type="button"
                    variant="customOutline"
                    className="w-full mt-2"
                    onClick={() => router.push("/")}
                >
                    Cancelar
                </Button>
            </form>
        </Form>
    );
}
