import { DesignacaoData, DesignacaoResponse, ListagemPortariasResponse } from "@/types/designacao";
import { formatarRF, nameToCamelCase, nameToCamelCaseUe } from "./formatadores";

function formatarData(data?: string | Date) {
    if (!data) return "____";

    const date = typeof data === "string" ? new Date(data) : data;

    return date.toLocaleDateString("pt-BR");
}

export function montarTrechoSubstituicaoLaudaCessacao(data: ListagemPortariasResponse, cargo_vaga_display:string): string {

    const inicio = formatarData(data?.designacao.data_inicio);

    let base =""
    
    // CARGO VAGO
    if (data?.designacao.tipo_vaga === "VAGO") {
        // para exercer o cargo de Coordenador Pedagógico, na EMEF Pracinhas da FEB, a partir de 03/03/2026.
        base = `para exercer o cargo de ${nameToCamelCase(cargo_vaga_display ?? "____")}, na ${nameToCamelCaseUe(data?.designacao?.unidade_proponente ?? "____")}`;
        return `${base}, a partir de ${inicio}`;
    }

    if (!data.designacao.titular_rf) return "";


    const nomeTitular = (
        data.designacao.titular_nome_civil?.trim()
            ? data.designacao.titular_nome_civil
            : data.designacao.titular_nome_servidor ?? "____"
    ).toUpperCase();

    base = `para substituir o (a) Sr.(a) ${nomeTitular ?? "____"}, ${nameToCamelCase(data.designacao.titular_cargo_base ?? "____")}, registro nº ${formatarRF(data.designacao.titular_rf ?? "____")
        }, vínculo ${data.designacao.titular_vinculo ?? "____"}, na ${nameToCamelCaseUe(data.designacao.unidade_proponente ?? "____")}`;


    return `${base}, a partir de ${inicio}`;
}

export function montarTrechoSubstituicaoLaudaDesignacao(data: ListagemPortariasResponse): string {

    const inicio = formatarData(data?.designacao.data_inicio);
    const fim = formatarData(data?.designacao.data_fim);

    let base =""
    
    // CARGO VAGO
    if (data?.designacao.tipo_vaga === "VAGO") {
        base = `cargo vago, previsto na Lei 14.660/2007`;
        if (data?.designacao.data_fim) {    
            return `${base}, no período de ${inicio} a ${fim}`;
        }
        return `${base}, a partir de ${inicio}`;
    }



    if (!data.designacao.titular_rf) return "";


    const nomeTitular = (
        data.designacao.titular_nome_civil?.trim()
            ? data.designacao.titular_nome_civil
            : data.designacao.titular_nome_servidor ?? "____"
    ).toUpperCase();

    base = `em substituição a ${nomeTitular ?? "____"}, Registro nº ${formatarRF(data.designacao.titular_rf ?? "____")
        }, Vínculo ${data.designacao.titular_vinculo ?? "____"}, ${nameToCamelCase(data.designacao.titular_cargo_base ?? "____")}`;



    if (data?.designacao.impedimento_substituicao) {
        return `${base}, ${data?.designacao.impedimento_substituicao.toLowerCase()}, no período de ${inicio}  a ${fim}`;
    }

    if (data?.designacao.data_fim) {
        
        return `${base}, no período de ${inicio} a ${fim}`;
    }

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




export function montarTrechoUnidade(data: ListagemPortariasResponse): string {


    if (data?.designacao?.indicado_lotacao?.replace(/\s+/g, '') === data?.designacao?.unidade_proponente?.replace(/\s+/g, '')) {
        return `na referida Unidade`;
    }

    // PADRÃO
    return `no ${nameToCamelCaseUe(data?.designacao.unidade_proponente ?? "")}, da ${data.designacao.dre_nome ?? "____"}`;
}








export function montarTrechoParaSubstituir(data: DesignacaoData): string {

    const indicado = data?.servidorIndicado;
    const inicio = formatarData(data?.a_partir_de);

    // CARGO VAGO
    if (data?.tipo_cargo === "vago") {
        return `para exercer o cargo de ${nameToCamelCase(indicado?.cargo_base ?? "____")} na ${indicado?.lotacao ?? "____"}, a partir de ${inicio}`;
    }

    const titular = data?.dadosTitular;

    if (!titular) return "";

    const nomeTitular = (
        titular?.nome_civil?.trim()
            ? titular.nome_civil
            : titular?.nome_servidor ?? "____"
    ).toUpperCase();

    const base = `para substituir o(a) Sr.(a) ${nomeTitular ?? "____"}, ${nameToCamelCase(titular?.cargo_base ?? "____")}, registro nº ${formatarRF(titular?.rf ?? "____")
        }, Vínculo ${titular?.vinculo ?? "____"}`;

    return `${base}, na ${indicado?.lotacao ?? "____"}, a partir de ${inicio}`;
}






export function montarPeriodoInsubsistencia(data: DesignacaoResponse): string {

    let periodo_insubsistencia = "";



    if (data?.data_fim) {
        periodo_insubsistencia = " no período de " + formatarData(data?.data_inicio ?? "") + " a " + formatarData(data?.data_fim ?? "");
    } else {
        periodo_insubsistencia = " a partir de " + formatarData(data?.data_inicio ?? "");
    }


    return periodo_insubsistencia;
}