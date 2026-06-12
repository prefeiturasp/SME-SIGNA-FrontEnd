import { DesignacaoData } from "@/types/designacao";
import { formatarRF, nameToCamelCase } from "./formatadores";

function formatarData(data?: string | Date) {
    if (!data) return "____";

    let date: Date;
    if (typeof data === "string") {
        date = data.length === 10 ? new Date(data + "T00:00:00") : new Date(data);
    } else {
        date = data;
    }

    return date.toLocaleDateString("pt-BR");
}

export function montarTrechoSubstituicao(data: DesignacaoData): string {

    // CARGO VAGO
    if (data?.tipo_cargo === "vago") {
        const inicio = formatarData(data?.a_partir_de);
        return `cargo vago, previsto na Lei 14.660/2007, a partir de ${inicio}`;
    }

    const titular = data?.dadosTitular;

    if (!titular) return "";

    const inicio = formatarData(data?.a_partir_de);
    const fim = formatarData(data?.designacao_data_final);
    const nomeTitular = (
        titular?.nome_civil?.trim()
            ? titular.nome_civil
            : titular?.nome_servidor ?? "____"
    ).toUpperCase();

    const base = `em substituição a ${nomeTitular ?? "____"}, Registro nº ${formatarRF(titular?.rf ?? "____")
        }, Vínculo ${titular?.vinculo ?? "____"}, ${nameToCamelCase(titular?.cargo_base ?? "____")}, ${titular?.tipo_vinculo ?? "efetivo"
        }`;


    // to-do: arrumar quando ids vierem do banco
    // LICENÇA MÉDICA
    if (data?.impedimento_substituicao === "2") {
        return `${base}, por licença médica, no período de ${inicio} a ${fim}`;
    }

    // FÉRIAS
    if (data?.impedimento_substituicao === "4") {
        return `${base}, por férias, no período de ${inicio} a ${fim}`;
    }

    // QUALQUER OUTRO IMPEDIMENTO COM PERÍODO DEFINIDO
    if (data?.impedimento_substituicao && data?.designacao_data_final) {
        const motivo = data?.impedimento_label ? `, ${String(data.impedimento_label).toLowerCase()},` : "";
        return `${base}${motivo} no período de ${inicio} a ${fim}`;
    }

    // CASO PADRÃO
    return `${base}, a partir de ${inicio}`;
}

export function montarTrechoFinal(data: DesignacaoData): string {

    // to-do: arrumar quando ids vierem do banco e textos
    // CARGO VAGO
    if (data?.tipo_cargo === "vago") {
        return `portando diploma de Pedagogia e experiência de 3 anos no Magistério.`;
    }

    // FÉRIAS
    if (data?.impedimento_substituicao === "4") {
        return `dentre integrantes da carreira de Auxiliar Técnico de Educação.`;
    }

    // SUBSTITUIÇÃO COM IMPEDIMENTO LEGAL (período definido + impedimento)
    if (data?.impedimento_substituicao && data?.designacao_data_final) {
        return `portando diploma de Pedagogia e experiência de 3 anos no Magistério.`;
    }

    // LICENÇA MÉDICA (sem data_final — fallback)
    if (data?.impedimento_substituicao === "2") {
        return `portando diploma de Pedagogia e com no mínimo 6 anos de experiência no Magistério, sendo 3 anos em cargos / funções de gestão educacional previstos na Lei 14.660/2007.`;
    }

    // PADRÃO
    return `portando diploma de Pedagogia e experiência de 3 anos no Magistério.`;
}

export function montarAutoridade(data: DesignacaoData): string {
    if (data?.impedimento_substituicao === "4") {
        return "O Chefe de Gabinete";
    }

    return "O Secretário Municipal de Educação";
}