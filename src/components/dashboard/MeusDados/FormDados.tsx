"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputBase, DocumentInputBase } from "@/components/ui/input-base";
import { User, useUserStore } from "@/stores/useUserStore";
import ModalNovaSenha from "./ModalNovaSenha/ModalNovaSenha";
import ModalAlterarEmail from "./ModalAlterarEmail/ModalAlterarEmail";

const FormDados: React.FC = () => {
    const [openModalNovaSenha, setOpenModalNovaSenha] = useState(false);
    const [openModalAlterarEmail, setOpenModalAlterarEmail] = useState(false);
    const user = useUserStore((state) => state.user) as User;

    const dados = {
        nome: user?.name || "",
        email: user?.email || "",
        senha: "****************",
        cpf: user?.cpf || "",
        dre: user?.unidades?.map((u) => u.dre.nome).join(", ") || "",
        unidade: user?.unidades?.map((u) => u.ue.nome).join(", ") || "",
        perfil: user?.perfil_acesso?.nome || "",
    };

    return (
        <div className="w-full md:w-1/2 flex flex-col h-full flex-1">
            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="nome" className="text-[#dadada] text-[14px] font-bold">
                        Nome completo
                    </label>
                    <InputBase
                        id="nome"
                        value={dados.nome}
                        disabled
                        className="text-[#dadada] bg-[#fff] border border-[#dadada]"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="text-[#dadada] text-[14px] font-bold">
                        E-mail
                    </label>
                    <div className="flex items-center gap-2">
                        <InputBase id="email" value={dados.email} disabled />
                        <Button
                            variant="customOutline"
                            type="button"
                            className="rounded-[4px]"
                            onClick={() => setOpenModalAlterarEmail(true)}
                        >
                            Alterar e-mail
                        </Button>
                    </div>
                </div>

                <div>
                    <label htmlFor="senha" className="text-[#dadada] text-[14px] font-bold">
                        Senha
                    </label>
                    <div className="flex items-center gap-2">
                        <InputBase id="senha" value={dados.senha} disabled type="password" />
                        <Button
                            variant="customOutline"
                            type="button"
                            className="rounded-[4px]"
                            onClick={() => setOpenModalNovaSenha(true)}
                        >
                            Alterar senha
                        </Button>
                    </div>
                </div>

                <div>
                    <label htmlFor="cpf" className="text-[#dadada] text-[14px] font-bold">
                        CPF
                    </label>
                    <DocumentInputBase
                        id="cpf"
                        value={dados.cpf}
                        disabled
                        className="text-[#dadada] bg-[#fff] border border-[#dadada]"
                    />
                </div>

                <div>
                    <label htmlFor="dre" className="text-[#dadada] text-[14px] font-bold">
                        Diretoria Regional de Educação (DRE)
                    </label>
                    <InputBase
                        id="dre"
                        value={dados.dre}
                        disabled
                        className="text-[#dadada] bg-[#fff] border border-[#dadada]"
                    />
                </div>

                <div>
                    <label htmlFor="unidade" className="text-[#dadada] text-[14px] font-bold">
                        Unidade Educacional
                    </label>
                    <InputBase
                        id="unidade"
                        value={dados.unidade}
                        disabled
                        className="text-[#dadada] bg-[#fff] border border-[#dadada]"
                    />
                </div>

                <div>
                    <label htmlFor="perfil" className="text-[#dadada] text-[14px] font-bold">
                        Perfil de acesso
                    </label>
                    <InputBase
                        id="perfil"
                        value={dados.perfil}
                        disabled
                        className="text-[#dadada] bg-[#fff] border border-[#dadada]"
                    />
                </div>
            </div>

            {/* Modais */}
            <ModalNovaSenha
                open={openModalNovaSenha}
                onOpenChange={setOpenModalNovaSenha}
            />
            <ModalAlterarEmail
                open={openModalAlterarEmail}
                onOpenChange={setOpenModalAlterarEmail}
                currentMail={user?.email}
            />
        </div>
    );
};

export default FormDados;
