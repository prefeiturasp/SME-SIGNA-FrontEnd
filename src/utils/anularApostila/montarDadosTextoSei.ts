import type { DesignacaoResponse } from "@/types/designacao";
import type { formSchemaAnularApostilaTornarSemEfeitoData } from "@/app/pages/anular-apostila/schema";
import {
    formatarDataPtBr,
    formatarRF,
    nameToCamelCase,
    nameToCamelCaseUe,
} from "@/utils/portarias/formatadores";

/** Ato que foi apostilado (designação ou cessação de origem da apostila). */
export interface AtoApostilado {
    portaria?: string;
    numero_portaria?: number | null;
    ano_vigente?: string;
    doc?: string;
    sei_numero?: string;
}

/**
 * Monta o dicionário de variáveis para a prévia do texto SEI de uma
 * anulação de apostila, usando as mesmas chaves de
 * `ModeloPortaria.Variavel` no backend — quem consome é o endpoint
 * `textos-sei/preview/`.
 *
 * Além das variáveis padrão, a anulação precisa descrever o ato que foi
 * apostilado e o texto da apostila. Essas chaves (`PORTARIA_APOSTILADA`,
 * `DOC_APOSTILADO`, `NUMERO_SEI_APOSTILADO`, `DRE` e `TEXTO_APOSTILA`)
 * ainda não estão no enum `ModeloPortaria.Variavel`, mas a substituição
 * do backend é genérica (`[[CHAVE]]` → valor), então funcionam desde que
 * o modelo cadastrado as utilize.
 *
 * DIPLOMA e PERIODO não têm campo equivalente no formulário de anulação
 * e ficam vazios; TIPO_DE_CARGO idem.
 */
export function montarDadosTextoSeiAnularApostila(
    designacao: DesignacaoResponse | undefined,
    atoApostilado: AtoApostilado | null | undefined,
    anulacao: formSchemaAnularApostilaTornarSemEfeitoData["apostila_insubsistencia"]
): Record<string, string> {
    const portariaApostilada =
        atoApostilado?.portaria ?? atoApostilado?.numero_portaria ?? "";

    return {
        PORTARIA:
            anulacao.portaria && anulacao.ano
                ? `${anulacao.portaria}/${anulacao.ano}`
                : "",
        NUMERO_SEI: anulacao.numero_sei ?? "",
        NOME_SERVIDOR: designacao?.indicado_nome_servidor ?? "",
        NUMERO_RF: formatarRF(designacao?.indicado_rf ?? ""),
        VINCULO:
            designacao?.indicado_vinculo == null
                ? ""
                : String(designacao.indicado_vinculo),
        CARGO: nameToCamelCase(designacao?.indicado_cargo_sobreposto ?? ""),
        CARGO_DESIGNACAO: nameToCamelCase(
            designacao?.indicado_cargo_sobreposto ?? ""
        ),
        CATEGORIA: designacao?.indicado_categoria ?? "",
        UNIDADE: nameToCamelCaseUe(designacao?.indicado_lotacao ?? ""),
        UNIDADE_PROPONENTE: nameToCamelCaseUe(
            designacao?.unidade_proponente ?? ""
        ),
        TIPO_DE_CARGO: "",
        DATA_INICIAL: formatarDataPtBr(anulacao.doc),
        PERIODO: "",
        DIPLOMA: "",

        // Específicas da anulação de apostila
        PORTARIA_APOSTILADA:
            portariaApostilada && atoApostilado?.ano_vigente
                ? `${portariaApostilada}/${atoApostilado.ano_vigente}`
                : String(portariaApostilada),
        DOC_APOSTILADO: atoApostilado?.doc
            ? formatarDataPtBr(atoApostilado.doc)
            : "",
        NUMERO_SEI_APOSTILADO: atoApostilado?.sei_numero ?? "",
        DRE: designacao?.dre_nome ?? "",
        TEXTO_APOSTILA: anulacao.texto_para_apostila ?? "",
    };
}
