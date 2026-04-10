import { DesignacaoData } from "@/types/designacao";
import {
    montarTrechoSubstituicao,
    montarTrechoFinal,
    montarAutoridade,
} from "./regrasPortaria";

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

    return {
        portaria: `${data?.portaria_designacao}/${data?.ano}`,
        ano: data?.ano,
        sei: data?.numero_sei,
        dre: data?.dre_nome,
        autoridade: montarAutoridade(data),
        nome_indicado: data?.servidorIndicado?.nome_civil,
        rf: data?.servidorIndicado?.rf,
        vinculo: data?.servidorIndicado?.vinculo,
        cargo_base: data?.servidorIndicado?.cargo_base,
        lotacao_indicado: data?.servidorIndicado?.lotacao,
        cargo_indicado,
        ue: data?.ue_nome,
        eh: data?.codigo_hierarquico,
        trecho_substituicao: montarTrechoSubstituicao(data),
        trecho_final: montarTrechoFinal(data),
    };
}