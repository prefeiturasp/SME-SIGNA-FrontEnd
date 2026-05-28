import { DesignacaoData, DesignacaoResponse } from "@/types/designacao";
import { formatarRF, nameToCamelCase } from "./formatadores";

function formatarData(data?: string | Date) {
    if (!data) return "____";

    const date = typeof data === "string" ? new Date(data) : data;

    return date.toLocaleDateString("pt-BR");
}

export function montarTrechoSubstituicaoLauda(data: DesignacaoData): string {

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

 





export function montarTrechoParaSubstituir(data: DesignacaoData): string {
 
    const indicado = data?.servidorIndicado;
    const inicio = formatarData(data?.a_partir_de);

    // CARGO VAGO
    if (data?.tipo_cargo === "vago") {        
        return `para exercer o cargo de ${nameToCamelCase(indicado?.cargo_base ?? "____")} na ${indicado?.lotacao?? "____"}, a partir de ${inicio}`;
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
 
    return `${base}, na ${indicado?.lotacao?? "____"}, a partir de ${inicio}`;
}






export function montarPeriodoInsubsistencia(data: DesignacaoResponse): string {

    let periodo_insubsistencia = "";
     
    
  
    if(data?.data_fim){
      periodo_insubsistencia = " no período de "+formatarData(data?.data_inicio ?? "")+" a "+formatarData(data?.data_fim ?? "");
    } else {
      periodo_insubsistencia = " a partir de "+formatarData(data?.data_inicio ?? "");
    }
 

    return periodo_insubsistencia;
}