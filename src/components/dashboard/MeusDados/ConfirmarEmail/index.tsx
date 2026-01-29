"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import LogoSigna from "@/components/login/LogoSigna";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Check from "@/assets/icons/Check";
import CloseCheck from "@/assets/icons/CloseCheck";
import useConfirmarEmail from "@/hooks/useConfirmarEmail";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";

import LogoPrefeituraSP from "../../../login/LogoPrefeituraSP";
import Spinner from "@/assets/icons/Spinner";
import { useQueryClient } from "@tanstack/react-query";

export default function ConfirmarEmail({ code }: { readonly code: string }) {
    const [returnMessage, setReturnMessage] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const router = useRouter();
    const clearUser = useUserStore((state) => state.clearUser);
    const queryClient = useQueryClient();
    const { mutateAsync } = useConfirmarEmail();

    const calledRef = useRef(false);

    const handleUpdateEmail = useCallback(async () => {
        const response = await mutateAsync({ code });

        if (response.success) {
            setReturnMessage({
                success: true,
                message:
                    "Agora você já possui acesso ao Signa com o novo endereço de e-mail cadastrado.",
            });
        } else {
            setReturnMessage({
                success: false,
                message: response.error,
            });
        }
    }, [mutateAsync, code]);

    useEffect(() => {
        if (!code) return;
        if (calledRef.current) return;
        calledRef.current = true;

        (async () => {
            await handleUpdateEmail();
        })();
    }, [code, handleUpdateEmail]);

    const handleLogout = () => {
        queryClient.removeQueries({ queryKey: ["me"] });
        clearUser();
        router.push("/");
    };

    return (
        <div className="w-full max-w-sm h-screen mx-auto flex flex-col py-0 overflow-hidden">
            <div className="flex justify-start pt-20">
                <LogoSigna />
            </div>

            <div className="flex-1 flex items-center justify-center">
                {!returnMessage ? (
                    <div className="flex flex-col items-center">
                        <Spinner />

                        <p className="font-semibold text-[16px] mt-2">
                            Aguarde um momento!
                        </p>
                        <p className="text-sm text-center text-[#42474a] mt-1">
                            Estamos validando o seu e-mail...
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col py-6 w-full">
                        <h1 className="font-bold text-gray-900 text-[20px]">
                            {returnMessage.success
                                ? "E-mail confirmado!"
                                : "Ocorreu um erro!"}
                        </h1>
                        <Alert
                            className="mt-4"
                            variant={returnMessage.success ? "aviso" : "error"}
                        >
                            {returnMessage.success ? (
                                <Check height={20} width={20} />
                            ) : (
                                <CloseCheck height={20} width={20} />
                            )}
                            <AlertDescription>
                                {returnMessage.message}
                            </AlertDescription>
                        </Alert>

                        <div className="w-full mt-6">
                            <Button asChild variant="submit" className="w-full">
                                <Link
                                    href={
                                        returnMessage.success
                                            ? "/pages"
                                            : "/pages/meus-dados"
                                    }
                                    replace
                                >
                                    {returnMessage.success
                                        ? "Continuar no Signa"
                                        : "Alterar e-mail"}
                                </Link>
                            </Button>
                            {returnMessage.success ? (
                                <Button
                                    onClick={handleLogout}
                                    variant="customOutline"
                                    className="w-full mt-2"
                                >
                                    Sair
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    variant="customOutline"
                                    className="w-full mt-2"
                                >
                                    <Link href="/pages">Cancelar</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center mt-auto pb-20">
                <div className="flex justify-center py-2">
                    <LogoPrefeituraSP />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[#42474a] text-[12px] font-normal mt-3 text-center py-2">
                        - Sistema homologado para navegadores: Google Chrome e
                        Firefox
                    </span>
                </div>
            </div>
        </div>
    );
}
