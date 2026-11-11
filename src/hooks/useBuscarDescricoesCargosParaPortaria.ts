import { useCallback } from "react";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import type { CodigoCargo, DescricoesCargosBase } from "@/utils/portarias/cargoIndicado";
import {
    MENSAGEM_ERRO_DESCRICOES_CARGOS,
    useBuscarDescricoesCargosBase,
} from "./useBuscarDescricoesCargosBase";

/**
 * Busca as descrições dos cargos antes de gerar uma portaria. Se a consulta
 * falhar, avisa o usuário e devolve `null`: quem chama não deve gerar o texto.
 */
export function useBuscarDescricoesCargosParaPortaria() {
    const buscarDescricoesCargosBase = useBuscarDescricoesCargosBase();
    const notification = useAppNotification();

    return useCallback(
        async (codigos: CodigoCargo[]): Promise<DescricoesCargosBase | null> => {
            try {
                return await buscarDescricoesCargosBase(codigos);
            } catch (error) {
                console.error("Erro ao buscar cargos base:", error);
                notification.error({ title: MENSAGEM_ERRO_DESCRICOES_CARGOS });
                return null;
            }
        },
        [buscarDescricoesCargosBase, notification]
    );
}
