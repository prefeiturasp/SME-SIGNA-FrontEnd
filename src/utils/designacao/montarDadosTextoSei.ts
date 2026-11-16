import type { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";
import {
    formatarDataPtBr,
    formatarRF,
    nameToCamelCase,
    nameToCamelCaseUe,
} from "@/utils/portarias/formatadores";
import {
    codigoCargoIndicado,
    type CodigoCargo,
    type DadosCargoIndicado,
    type DescricoesCargosBase,
    montarCargo,
    montarCargoIndicado,
} from "@/utils/portarias/cargoIndicado";
import { codigoCargoDoTitular, codigoCargoVagoSelecionado } from "@/utils/designacao/mapearPayload";

// Mesma regra do passo 2: no cargo disponível, a vaga é o cargo do titular.
function codigoCargoASerOcupado(data: FormDesignacaoEServidorIndicado | null | undefined): CodigoCargo {
    if (data?.tipo_cargo === "vago") {
        return codigoCargoVagoSelecionado(data.cargo_vago_selecionado);
    }
    return codigoCargoDoTitular(data?.dadosTitular);
}

function dadosCargoIndicado(data: FormDesignacaoEServidorIndicado | null | undefined): DadosCargoIndicado {
    return {
        codigoCargoBase: data?.servidorIndicado?.cd_cargo_base,
        codigoCargoSobreposto: data?.servidorIndicado?.cd_cargo_sobreposto_funcao_atividade,
        possuiCargoSobreposto: data?.servidorIndicado?.possui_cargo_sobreposto,
        categoria: data?.servidorIndicado?.categoria,
    };
}

/** Códigos de cargo que `montarDadosTextoSeiDesignacao` consulta em Gestão de cargos base. */
export function codigosCargosTextoSeiDesignacao(
    data: FormDesignacaoEServidorIndicado | null | undefined
): CodigoCargo[] {
    return [codigoCargoASerOcupado(data), codigoCargoIndicado(dadosCargoIndicado(data))];
}

/**
 * Monta o dicionário de variáveis para a prévia do texto SEI de uma
 * designação, usando as mesmas chaves de `ModeloPortaria.Variavel` no
 * backend — quem consome é o endpoint `textos-sei/preview/`.
 *
 * DIPLOMA não tem campo equivalente hoje no formulário de designação e
 * fica vazio; TIPO_DE_CARGO, CARGO_DESIGNACAO e PERIODO são melhor
 * esforço, sem confirmação contra o texto real cadastrado no modelo.
 *
 * `descricoes` precisa trazer os códigos de `codigosCargosTextoSeiDesignacao`.
 */
export function montarDadosTextoSeiDesignacao(
    data: FormDesignacaoEServidorIndicado,
    descricoes: DescricoesCargosBase
): Record<string, string> {
    const nomeIndicado = data?.servidorIndicado?.nome_civil?.trim()
        ? data.servidorIndicado.nome_civil
        : data?.servidorIndicado?.nome_servidor;

    const cargoASerOcupado = montarCargo(codigoCargoASerOcupado(data), descricoes);

    return {
        PORTARIA:
            data?.portaria_designacao && data?.ano
                ? `${data.portaria_designacao}/${data.ano}`
                : "",
        NUMERO_SEI: data?.numero_sei ?? "",
        NOME_SERVIDOR: (nomeIndicado ?? "").toUpperCase(),
        NUMERO_RF: formatarRF(data?.servidorIndicado?.rf ?? ""),
        VINCULO:
            data?.servidorIndicado?.vinculo == null
                ? ""
                : String(data.servidorIndicado.vinculo),
        CARGO: cargoASerOcupado,
        CARGO_DESIGNACAO: cargoASerOcupado,
        CARGO_INDICADO: montarCargoIndicado(dadosCargoIndicado(data), descricoes),
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
