"use client";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import ModuleGrid from "./moduloGrid";
import FileSignatureIcon from "@/assets/icons/FileSignatureIcon";
import UserEditIcon from "@/assets/icons/UserEditIcon";
import ListIcon from "@/assets/icons/ListIcon";
import ApoioIcon from "@/assets/icons/ApoioIcon";

const modules = [
    {
        id: "designacao",
        title: "Designação",
        description: "Realize a pesquisa e validação de servidores para verificar a aptidão e efetuar a designação para cargos ou funções disponíveis.",
        icon: ListIcon,
    },
    {
        id: "nomeacao",
        title: "Nomeação",
        description: "Gerencie os processos de nomeação, acompanhando etapas, registros e informações necessárias para formalização do vínculo.",
        icon: UserEditIcon,
    },
    {
        id: "protocolo",
        title: "Protocolo",
        description: "Registre, acompanhe e consulte protocolos, garantindo o controle e a rastreabilidade das solicitações e documentos.",
        icon: FileSignatureIcon,
    },
    {
        id: "apoio",
        title: "Apoio administrativo",
        description: "Registre, acompanhe e consulte protocolos, garantindo o controle e a rastreabilidade das solicitações e documentos.",
        icon: ApoioIcon,
    },
];

export default function Dashboard() {
    return (
        <div className="pt-4 px-6">
            <h1 className="text-2xl font-semibold text-center mt-8">
                Selecione o módulo
            </h1>

            <p className="text-center text-gray-600 mt-2 max-w-2xl mx-auto">
                Escolha abaixo o módulo que deseja acessar para iniciar ou acompanhar os
                processos administrativos do sistema.
            </p>

            <ModuleGrid modules={modules} />
        </div>
    );
}
