"use client";

import Image from "next/image";
import { useUserStore } from "@/stores/useUserStore";
import LogoSigna from "@/assets/images/logo-signa-completo.png";
import SignOutButton from "./SignOutButton";

function capitalizeWords(str: string) {
    return str?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Navbar() {
    function isCPF(value: string | number) {
        const strValue = String(value);
        const cpf = strValue.replace(/\D/g, "");
        return cpf.length === 11;
    }

    const user = useUserStore((state) => state.user);

    return (
        <header className="flex items-center justify-between border-b border-gray-200 bg-white h-[72px] px-4">
            <div className="flex items-center">
                <Image src={LogoSigna} alt="Logo Signa" width={77} height={56} />
            </div>

            <div className="flex items-center gap-4">
                <div
                    className="rounded border border-gray-300 px-1 font-weight-[400] py-1 h-[59px] text-sm text-muted-foreground leading-tight bg-[#f5f6f8]"
                    style={{
                        fontFamily: "Roboto, sans-serif",
                        color: "#42474a",
                    }}
                >
                    {user && (
                        <>
                            <div>
                                <span className="font-bold">
                                    {isCPF(user.username) ? "CPF" : "RF"}:{" "}
                                    {user.username}
                                </span>
                            </div>
                            <div>{capitalizeWords(user.name)}</div>
                            <div>
                                {/* {capitalizeWords(user.perfil_acesso.nome)} */}
                            </div>
                        </>
                    )}
                </div>

                <SignOutButton />
            </div>
        </header>
    );
}
