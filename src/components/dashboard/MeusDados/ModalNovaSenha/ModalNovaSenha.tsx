"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/headless-toast";
import { Button } from "@/components/ui/button";
import InputSenhaComToggle from "../../../InputSenhaComToggle/InputSenhaComToggle";
import { cn } from "@/lib/utils";
import Check from "@/assets/icons/Check";
import CloseCheck from "@/assets/icons/CloseCheck";

import formSchema, { FormAlterarSenha } from "./schema";
import ErrorMessage from "@/components/login/FormCadastro/ErrorMessage";
import useAtualizarSenha from "@/hooks/useAtualizarSenha";
import Aviso from "@/components/login/FormCadastro/Aviso";

type ModalNovaSenhaProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
};

type StatusType = "idle" | "ok" | "error";

export default function ModalNovaSenha({
    open,
    onOpenChange,
}: Readonly<ModalNovaSenhaProps>) {
    const form = useForm<FormAlterarSenha>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            oldPassword: "",
            password: "",
            confirmPassword: "",
        },
    });

    const { mutateAsync, isPending } = useAtualizarSenha();

    const { watch, formState } = form;
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");
    const oldPassword = watch("oldPassword");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const STATUS_STYLES: Record<StatusType, string> = {
        idle: "text-[#42474a]",
        ok: "text-[#297805]",
        error: "text-[#b40c31]",
    };

    const getStatus = (hasPassword: boolean, pass: boolean): StatusType => {
        let status: StatusType;
        if (!hasPassword) {
            status = "idle";
        } else if (pass) {
            status = "ok";
        } else {
            status = "error";
        }
        return status;
    };

    const passwordCriteria = useMemo(
        () => [
            {
                label: "Uma letra maiúscula",
                test: (v: string) => /[A-Z]/.test(v),
            },
            {
                label: "Uma letra minúscula",
                test: (v: string) => /[a-z]/.test(v),
            },
            {
                label: "Entre 8 e 12 caracteres",
                test: (v: string) => v.length >= 8 && v.length <= 12,
            },
            {
                label: "Ao menos 01 número",
                test: (v: string) => /\d/.test(v),
            },
            {
                label: "Ao menos 01 símbolo",
                test: (v: string) => /[#!@&?.*_]/.test(v),
            },
            {
                label: "Espaço em branco",
                test: (v: string) => !/\s/.test(v),
            },
            {
                label: "Caracteres acentuados",
                test: (v: string) => !/[À-ÖØ-öø-ÿ]/.test(v),
            },
        ],
        []
    );

    const passwordStatus = passwordCriteria.map((c) => c.test(password || ""));

    const todosCriteriosOk = passwordStatus.every(Boolean);
    const podeSalvar =
        !!oldPassword &&
        !!password &&
        !!confirmPassword &&
        todosCriteriosOk &&
        formState.isValid &&
        !isPending;

    async function handleChangePassword(values: FormAlterarSenha) {
        setErrorMessage(null);
        const response = await mutateAsync({
            senha_atual: values.oldPassword,
            nova_senha: values.password,
            confirmacao_nova_senha: values.confirmPassword,
        });

        if (response.success) {
            toast({
                variant: "success",
                title: "Tudo certo por aqui!",
                description: "Sua senha foi atualizada.",
            });
            handleOpenChange(false);
        } else {
            setErrorMessage(response.error);
        }
    }

    function handleOpenChange(v: boolean) {
        onOpenChange(v);
        if (!v) {
            form.reset();
            setErrorMessage(null);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[660px] p-8 rounded-none rounded-0">
                <DialogHeader>
                    <DialogTitle>Nova senha</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">
                    Informe sua nova senha seguindo os critérios abaixo.
                </DialogDescription>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleChangePassword)}>
                        <div className="flex flex-col md:flex-row gap-6 mt-3">
                            <div className="w-full md:w-[40%]">
                                <span className="text-[14px] font-[700] text-[#42474a] leading-[1.2]">
                                    A nova senha deve conter:
                                </span>
                                <div className="mt-3">
                                    {passwordCriteria
                                        .slice(0, 5)
                                        .map((c, idx) => {
                                            const status = getStatus(
                                                !!password,
                                                passwordStatus[idx]
                                            );
                                            return (
                                                <div
                                                    key={c.label}
                                                    className={cn(
                                                        "flex items-center text-sm gap-1 mb-2 last:mb-0",
                                                        STATUS_STYLES[status]
                                                    )}
                                                >
                                                    {status === "ok" && (
                                                        <Check />
                                                    )}
                                                    {status === "error" && (
                                                        <CloseCheck />
                                                    )}
                                                    {c.label}
                                                </div>
                                            );
                                        })}
                                </div>
                                <span className="text-[14px] font-[700] text-[#42474a] leading-[1.2] mt-4 block">
                                    A nova senha NÃO deve conter:
                                </span>
                                <div className="mt-3">
                                    {passwordCriteria.slice(5).map((c, idx) => {
                                        const status = getStatus(
                                            !!password,
                                            passwordStatus[idx + 5]
                                        );
                                        return (
                                            <div
                                                key={c.label}
                                                className={cn(
                                                    "flex items-center text-sm gap-1 mb-2 last:mb-0",
                                                    STATUS_STYLES[status]
                                                )}
                                            >
                                                {status === "ok" && <Check />}
                                                {status === "error" && (
                                                    <CloseCheck />
                                                )}
                                                {c.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="w-full md:w-[60%] space-y-4">
                                <FormField
                                    control={form.control}
                                    name="oldPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="required text-[#42474a] text-[14px] font-[700] mb-2 block">
                                                Senha atual*
                                            </FormLabel>
                                            <FormControl>
                                                <InputSenhaComToggle
                                                    placeholder="Digite a senha atual"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="required text-[#42474a] text-[14px] font-[700] mb-2 block">
                                                Nova senha*
                                            </FormLabel>
                                            <FormControl>
                                                <InputSenhaComToggle
                                                    placeholder="Digite a nova senha"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="required text-[#42474a] text-[14px] font-[700] mb-2 block">
                                                Confirmação da nova senha*
                                            </FormLabel>
                                            <FormControl>
                                                <InputSenhaComToggle
                                                    placeholder="Digite a nova senha novamente"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <ErrorMessage message={errorMessage} />

                        <div className="w-full mt-8">
                            <Aviso>
                                <strong>Importante:</strong> Ao alterar a sua senha, ela se tornará padrão e será utilizada para acessar todos os sistemas da SME aos quais você já possui acesso.
                            </Aviso>
                        </div>
                            
                        <DialogFooter className="mt-8">
                            <Button
                                type="button"
                                size="sm"
                                variant="customOutline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="text-center rounded-md text-[14px] font-[700] bg-[#717FC7] text-white hover:bg-[#5a65a8]"
                                disabled={!podeSalvar}
                            >
                                Salvar senha
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
