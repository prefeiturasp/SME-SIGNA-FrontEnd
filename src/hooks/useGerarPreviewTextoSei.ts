import { useCallback, useState } from "react";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import {
    gerarPreviewTextoSeiAction,
    type TextoSeiPreviewPayload,
    type TextoSeiPreviewResponse,
} from "@/actions/textos-sei";
import type { CodigoCargo, DescricoesCargosBase } from "@/utils/portarias/cargoIndicado";
import { useBuscarDescricoesCargosParaPortaria } from "./useBuscarDescricoesCargosParaPortaria";

export type PedidoPreviewTextoSei = Omit<TextoSeiPreviewPayload, "dados"> & {
    // Códigos de cargo que `montarDados` vai consultar.
    codigosCargos: CodigoCargo[];
    montarDados: (descricoes: DescricoesCargosBase) => Record<string, string>;
};

/**
 * Gera a prévia do texto SEI de uma portaria: busca as descrições dos cargos,
 * monta as variáveis e pede o texto ao backend. Devolve `null`, já avisando o
 * usuário, quando a consulta dos cargos ou a prévia falham.
 */
export function useGerarPreviewTextoSei() {
    const buscarDescricoesCargos = useBuscarDescricoesCargosParaPortaria();
    const notification = useAppNotification();
    const [gerandoPreview, setGerandoPreview] = useState(false);

    const gerarPreview = useCallback(
        async ({
            codigosCargos,
            montarDados,
            ...pedido
        }: PedidoPreviewTextoSei): Promise<TextoSeiPreviewResponse | null> => {
            setGerandoPreview(true);
            try {
                const descricoes = await buscarDescricoesCargos(codigosCargos);
                if (!descricoes) return null;

                const result = await gerarPreviewTextoSeiAction({ ...pedido, dados: montarDados(descricoes) });
                if (!result.success) {
                    notification.error({ title: `Erro ao gerar o texto da portaria: ${result.error}` });
                    return null;
                }
                return result.data;
            } finally {
                setGerandoPreview(false);
            }
        },
        [buscarDescricoesCargos, notification]
    );

    return { gerandoPreview, gerarPreview };
}
