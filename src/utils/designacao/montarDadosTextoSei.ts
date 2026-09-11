import type { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";
import {
    formatarDataPtBr,
    formatarRF,
    nameToCamelCase,
    nameToCamelCaseUe,
} from "@/utils/portarias/formatadores";

function getCargoIndicado(
    data: FormDesignacaoEServidorIndicado
): string | undefined {
    const cargo = data?.cargo_vago_selecionado;

    if (data?.tipo_cargo !== "vago") {
        return data?.dadosTitular?.cargo_base;
    }

    if (typeof cargo === "string") {
        return cargo;
    }

    return cargo?.label;
}

/**
 * Monta o dicionário de variáveis para a prévia do texto SEI de uma
 * designação, usando as mesmas chaves de `ModeloPortaria.Variavel` no
 * backend — quem consome é o endpoint `textos-sei/preview/`.
 *
 * DIPLOMA não tem campo equivalente hoje no formulário de designação e
 * fica vazio; TIPO_DE_CARGO, CARGO_DESIGNACAO e PERIODO são melhor
 * esforço, sem confirmação contra o texto real cadastrado no modelo.
 */
export function montarDadosTextoSeiDesignacao(
    data: FormDesignacaoEServidorIndicado
): Record<string, string> {
    const nomeIndicado = data?.servidorIndicado?.nome_civil?.trim()
        ? data.servidorIndicado.nome_civil
        : data?.servidorIndicado?.nome_servidor;

    const cargoIndicado = nameToCamelCase(getCargoIndicado(data) ?? "");

    return {
        PORTARIA:
            data?.portaria_designacao && data?.ano
                ? `${data.portaria_designacao}/${data.ano}`
                : "",
        NUMERO_SEI: data?.numero_sei ?? "",
        NOME_SERVIDOR: (nomeIndicado ?? "").toUpperCase(),
        NUMERO_RF: formatarRF(data?.servidorIndicado?.rf ?? ""),
        VINCULO:
            data?.servidorIndicado?.vinculo != null
                ? String(data.servidorIndicado.vinculo)
                : "",
        CARGO: cargoIndicado,
        CARGO_DESIGNACAO: cargoIndicado,
        CATEGORIA: data?.servidorIndicado?.categoria ?? "",
        UNIDADE: nameToCamelCaseUe(data?.servidorIndicado?.lotacao ?? ""),
        UNIDADE_PROPONENTE: nameToCamelCaseUe(data?.ue_nome ?? ""),
        TIPO_DE_CARGO: data?.tipo_cargo ? nameToCamelCase(data.tipo_cargo) : "",
        DATA_INICIAL: formatarDataPtBr(data?.a_partir_de),
        PERIODO: data?.designacao_data_final
            ? `${formatarDataPtBr(data?.a_partir_de)} a ${formatarDataPtBr(data.designacao_data_final)}`
            : "por tempo indeterminado",
        DIPLOMA: "",
    };
}
