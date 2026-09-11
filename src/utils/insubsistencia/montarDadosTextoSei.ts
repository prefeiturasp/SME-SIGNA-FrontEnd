import type { DesignacaoResponse } from "@/types/designacao";
import type { formSchemaInsubsistenciaData } from "@/app/pages/insubsistencia/schema";
import {
    formatarDataPtBr,
    formatarRF,
    nameToCamelCase,
    nameToCamelCaseUe,
} from "@/utils/portarias/formatadores";

/**
 * Monta o dicionário de variáveis para a prévia do texto SEI de uma
 * insubsistência (tornar insubsistente uma designação ou cessação),
 * usando as mesmas chaves de `ModeloPortaria.Variavel` no backend —
 * quem consome é o endpoint `textos-sei/preview/`.
 *
 * Os dados do servidor indicado vêm sempre da designação de origem,
 * mesmo quando a insubsistência é sobre a cessação — é a mesma pessoa.
 * DIPLOMA não tem campo equivalente hoje e fica vazio.
 */
export function montarDadosTextoSeiInsubsistencia(
    designacao: DesignacaoResponse | undefined,
    insubsistencia: formSchemaInsubsistenciaData["insubsistencia"]
): Record<string, string> {
    return {
        PORTARIA:
            insubsistencia.numero_portaria && insubsistencia.ano
                ? `${insubsistencia.numero_portaria}/${insubsistencia.ano}`
                : "",
        NUMERO_SEI: insubsistencia.numero_sei ?? "",
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
        DATA_INICIAL: formatarDataPtBr(designacao?.data_inicio),
        PERIODO: designacao?.data_fim
            ? `${formatarDataPtBr(designacao.data_inicio)} a ${formatarDataPtBr(designacao.data_fim)}`
            : "por tempo indeterminado",
        DIPLOMA: "",
    };
}
