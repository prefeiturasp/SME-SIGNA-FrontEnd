import { DesignacaoData } from "@/types/designacao";
import {
    montarTrechoSubstituicao,
    montarTrechoFinal,
    montarAutoridade
} from "./regrasPortaria";

export function gerarDadosPortaria(data: DesignacaoData) {

    const cargo_indicado =
        data?.tipo_cargo === "vago"
            ? data?.cargo_vago_selecionado
            : data?.dadosTitular?.cargo_base;

    return {
        portaria: data?.portaria_designacao,
        ano: data?.ano,
        sei: data?.numero_sei,
        dre: data?.dre_nome,
        autoridade: montarAutoridade(data),
        nome: data?.servidorIndicado?.nome_civil,
        rf: data?.servidorIndicado?.rf,
        vinculo: data?.servidorIndicado?.vinculo,
        cargo_base: data?.servidorIndicado?.cargo_base,
        lotacao_indicado: data?.servidorIndicado?.lotacao,
        cargo_indicado,
        ue: data?.ue_nome,
        eh: data?.codigo_estrutura_hierarquica,
        trecho_substituicao: montarTrechoSubstituicao(data),
        trecho_final: montarTrechoFinal(data)
    };
}