import { DesignacaoData } from "@/types/designacao";

function formatarData(data?: string | Date) {
    if (!data) return "____";

    const date = typeof data === "string" ? new Date(data) : data;

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

    const base = `em substituição a ${titular?.nome_civil || "____"}, Registro nº ${titular?.rf || "____"
        }, Vínculo ${titular?.vinculo || "____"}, ${titular?.cargo_base || "____"}, ${titular?.tipo_vinculo || "efetivo"
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

    // CASO PADRÃO
    return `${base}, a partir de ${inicio}`;
}

export function montarTrechoFinal(data: DesignacaoData): string {

    // to-do: arrumar quando ids vierem do banco e textos
    // CARGO VAGO
    if (data?.tipo_cargo === "vago") {
        return `portando diploma de Pedagogia e experiência de 3 anos no Magistério.`;
    }

    // LICENÇA MÉDICA
    if (data?.impedimento_substituicao === "2") {
        return `portando diploma de Pedagogia e com no mínimo 6 anos de experiência no Magistério, sendo 3 anos em cargos / funções de gestão educacional previstos na Lei 14.660/2007.`;
    }

    // FÉRIAS
    if (data?.impedimento_substituicao === "4") {
        return `dentre integrantes da carreira de Auxiliar Técnico de Educação.`;
    }

    // PADRÃO
    return `portando diploma de Pedagogia e experiência de 3 anos no Magistério.`;
}

export function montarAutoridade(data: DesignacaoData): string {
    if (data?.impedimento_substituicao === "4") {
        return "O Chefe de Gabinete, no uso de suas atribuições legais,";
    }

    return "O Secretário Municipal de Educação, no uso de suas atribuições legais,";
}