import type { DesignacaoResponse } from "@/types/designacao";
import type { formSchemaCessacaoData } from "@/app/pages/cessacao/schema";
import {
    formatarDataPtBr,
    formatarRF,
    nameToCamelCaseUe,
} from "@/utils/portarias/formatadores";
import {
    montarCargoDaDesignacao,
    montarCargoIndicadoDaDesignacao,
} from "@/utils/portarias/cargoIndicado";

/**
 * Monta o dicionário de variáveis para a prévia do texto SEI de uma
 * cessação, usando as mesmas chaves de `ModeloPortaria.Variavel` no
 * backend — quem consome é o endpoint `textos-sei/preview/`.
 *
 * DIPLOMA e PERIODO não têm campo equivalente hoje no formulário de
 * cessação e ficam vazios; TIPO_DE_CARGO idem (cessação não tem
 * conceito de tipo de vaga).
 */
export function montarDadosTextoSeiCessacao(
    designacao: DesignacaoResponse | undefined,
    cessacao: formSchemaCessacaoData["cessacao"]
): Record<string, string> {
    return {
        PORTARIA:
            cessacao.numero_portaria && cessacao.ano
                ? `${cessacao.numero_portaria}/${cessacao.ano}`
                : "",
        NUMERO_SEI: cessacao.numero_sei ?? "",
        NOME_SERVIDOR: designacao?.indicado_nome_servidor ?? "",
        NUMERO_RF: formatarRF(designacao?.indicado_rf ?? ""),
        VINCULO:
            designacao?.indicado_vinculo == null
                ? ""
                : String(designacao.indicado_vinculo),
        CARGO: montarCargoDaDesignacao(designacao),
        CARGO_DESIGNACAO: montarCargoDaDesignacao(designacao),
        CARGO_INDICADO: montarCargoIndicadoDaDesignacao(designacao),
        CATEGORIA: designacao?.indicado_categoria ?? "",
        UNIDADE: nameToCamelCaseUe(designacao?.indicado_lotacao ?? ""),
        UNIDADE_PROPONENTE: nameToCamelCaseUe(
            designacao?.unidade_proponente ?? ""
        ),
        TIPO_DE_CARGO: "",
        DATA_INICIAL: formatarDataPtBr(cessacao.data_inicio),
        PERIODO: "",
        DIPLOMA: "",
    };
}
