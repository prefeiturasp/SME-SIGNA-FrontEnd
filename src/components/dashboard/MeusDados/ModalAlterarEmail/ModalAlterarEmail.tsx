"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import formSchema, { FormDataChangeEmail } from "./schema";
import ErrorMessage from "@/components/login/FormCadastro/ErrorMessage";
import useAtualizarEmail from "@/hooks/useAtualizarEmail";
import Aviso from "@/components/login/FormCadastro/Aviso";
import Check from "@/assets/icons/Check";

type ModalAlterarEmailProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    currentMail?: string;
};

export default function ModalAlterarEmail({
    open,
    onOpenChange,
    currentMail,
}: Readonly<ModalAlterarEmailProps>) {
    const form = useForm<FormDataChangeEmail>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            email: currentMail,
        },
    });
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const { mutateAsync, isPending } = useAtualizarEmail();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleChangeEmail(values: FormDataChangeEmail) {
        setErrorMessage(null);
        const response = await mutateAsync({
            new_email: values.email,
        });

        if (response.success) {
            setUpdateSuccess(true);
        } else {
            setErrorMessage(response.error);
        }
    }

    function handleOpenChange(v: boolean) {
        onOpenChange(v);
        if (!v) {
            form.reset();
            setErrorMessage(null);
            setUpdateSuccess(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[660px] p-8 rounded-none rounded-0">
                <DialogHeader>
                    <DialogTitle>Alteração de e-mail</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">
                    Informe seu novo e-mail seguindo os critérios abaixo.
                </DialogDescription>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleChangeEmail)}>
                        <p
                            className={`mt-6 text-[14px] font-normal ${
                                updateSuccess
                                    ? "text-[#b0b0b0]"
                                    : "text-[#42474a]"
                            }`}
                        >
                            Altere ou insira um novo e-mail.
                        </p>
                        <div className="w-full">
                            <FormField
                                control={form.control}
                                name="email"
                                disabled={updateSuccess}
                                render={({ field }) => (
                                    <FormItem className="mb-4 mt-2">
                                        <FormLabel
                                            className={`required text-[14px] font-[700] ${
                                                updateSuccess
                                                    ? "text-[#b0b0b0]"
                                                    : "text-[#42474a]"
                                            }`}
                                        >
                                            E-mail*
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="Digite o seu e-mail corporativo"
                                                className={`font-normal ${
                                                    updateSuccess
                                                        ? "text-[#dadada] bg-[#fff] border border-[#dadada]"
                                                        : ""
                                                }`}
                                                data-testid="input-email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <ErrorMessage message={errorMessage} />

                            <Aviso
                                icon={
                                    updateSuccess ? (
                                        <Check className="w-[22px]" />
                                    ) : null
                                }
                            >
                                {!updateSuccess ? (
                                    <>
                                        <strong>Importante:</strong> Ao alterar o e-mail cadastrado, todas as
                                        comunicações serão enviadas para o novo endereço. Além disso, ele se
                                        tornará padrão e será utilizado para acessar todos os sistemas da SME
                                        aos quais você já possui acesso.
                                    </>
                                ) : (
                                    <>
                                        Quase lá! Um e-mail de confirmação
                                        foi enviado para o novo endereço.
                                        Basta acessá-lo e seguir as
                                        instruções para concluir a
                                        alteração.
                                    </>
                                )}
                            </Aviso>
                        </div>

                        <DialogFooter className="mt-6">
                            {updateSuccess ? (
                                <Button
                                    size="sm"
                                    className="text-center rounded-md text-[14px] font-[700] bg-[#717FC7] text-white hover:bg-[#5a65a8]"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Fechar
                                </Button>
                            ) : (
                                <>
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
                                        className="text-center rounded-md text-[14px] font-[700] bg-[#717FC7] text-white hover:bg-[#5a65a8] min-w-[103px]"
                                        disabled={
                                            !form.formState.isValid ||
                                            form.getValues("email") ===
                                                currentMail
                                        }
                                        loading={isPending}
                                    >
                                        Salvar e-mail
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
