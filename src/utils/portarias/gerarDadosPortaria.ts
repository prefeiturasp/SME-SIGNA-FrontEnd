import { DesignacaoData } from "@/types/designacao";
import {
    montarTrechoSubstituicao,
    montarTrechoFinal,
    montarAutoridade,
} from "./regrasPortaria";
import { nameToCamelCase, formatarRF, nameToCamelCaseUe } from "@/utils/portarias/formatadores";

function getCargoIndicado(data: DesignacaoData): string | undefined {
    const cargo = data?.cargo_vago_selecionado;

    if (data?.tipo_cargo !== "vago") {
        return data?.dadosTitular?.cargo_base;
    }

    if (typeof cargo === "string") {
        return cargo;
    }

    return cargo?.label;
}

export function gerarDadosPortaria(data: DesignacaoData) {
    const cargo_indicado = getCargoIndicado(data);

    const nome_indicado =
        data?.servidorIndicado?.nome_civil?.trim()
            ? data.servidorIndicado.nome_civil
            : data?.servidorIndicado?.nome_servidor;

    return {
        portaria: `${data?.portaria_designacao}/${data?.ano}`,
        ano: data?.ano,
        sei: data?.numero_sei,
        dre: data?.dre_nome,
        autoridade: montarAutoridade(data),
        nome_indicado: nome_indicado?.toUpperCase(),
        rf: formatarRF(data?.servidorIndicado?.rf ?? ""),
        vinculo: data?.servidorIndicado?.vinculo,
        cargo_base: nameToCamelCase(data?.servidorIndicado?.cargo_base ?? ""),
        lotacao_indicado: nameToCamelCaseUe(data?.servidorIndicado?.lotacao ?? ""),
        cargo_indicado: nameToCamelCase(cargo_indicado ?? ""),
        ue: nameToCamelCaseUe(data?.ue_nome ?? ""),
        eh: data?.codigo_hierarquico,
        trecho_substituicao: montarTrechoSubstituicao(data),
        trecho_final: montarTrechoFinal(data),
        trecho_unidade: montarTrechoUnidade(data?.servidorIndicado?.lotacao ?? "", data?.ue_nome ?? "", data?.dre_nome ?? ""),
    };
}

export function montarTrechoUnidade(indicado_lotacao:string, unidade_proponente:string,dre_nome:string): string {


    if (indicado_lotacao?.replace(/\s+/g, '') === unidade_proponente?.replace(/\s+/g, '')) {
        return `na referida Unidade`;
    }
    console.log("indicado_lotacao", indicado_lotacao);
    console.log("unidade_proponente", unidade_proponente);
     // PADRÃO
    return `na ${nameToCamelCaseUe(unidade_proponente ?? "")}, da ${dre_nome ?? "____"}`;
}