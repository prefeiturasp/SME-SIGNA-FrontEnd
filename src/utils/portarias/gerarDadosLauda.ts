import { DesignacaoData, DesignacaoResponse } from "@/types/designacao";

import { nameToCamelCase, formatarRF, nameToCamelCaseUe } from "@/utils/portarias/formatadores";
import { montarTrechoSubstituicaoLauda,     montarTrechoFinal,

    montarTrechoParaSubstituir,
    montarPeriodoInsubsistencia,} from "./regrasLauda";

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

export function gerarDadosLaudaDesignacao(data: DesignacaoData) {
    const cargo_indicado = getCargoIndicado(data);

    const nome_indicado =
        data?.servidorIndicado?.nome_civil?.trim()
            ? data.servidorIndicado.nome_civil
            : data?.servidorIndicado?.nome_servidor;

    return {
        dre: data?.dre_nome,
        portaria: `${data?.portaria_designacao}/${data?.ano}`,
        ano: data?.ano,
        sei: data?.numero_sei,
        vinculo: data?.servidorIndicado?.vinculo,
        nome_indicado: nome_indicado?.toUpperCase(),
        cargo_base: nameToCamelCase(data?.servidorIndicado?.cargo_base ?? ""),
        lotacao_indicado: nameToCamelCaseUe(data?.servidorIndicado?.lotacao ?? ""),
        
        cargo_indicado: nameToCamelCase(cargo_indicado ?? ""),
        ue: nameToCamelCaseUe(data?.ue_nome ?? ""),       
        eh: data?.codigo_hierarquico,
        trecho_substituicao: montarTrechoSubstituicaoLauda(data),
        trecho_final: montarTrechoFinal(data),


        
        
        rf: formatarRF(data?.servidorIndicado?.rf ?? ""),
        
        
        
        
        
        
        
    };
}

export function gerarDadosLaudaCessacao(data: any) {
    const cargo_indicado = getCargoIndicado(data);

    const nome_indicado =
        data?.servidorIndicado?.nome_civil?.trim()
            ? data.servidorIndicado.nome_civil
            : data?.servidorIndicado?.nome_servidor;

    return {
        dre: data?.dre_nome,
        portaria: `${data?.portaria_designacao}/${data?.ano}`,
        ano: data?.ano,
        sei: data?.numero_sei,
        vinculo: data?.servidorIndicado?.vinculo,
        nome_indicado: nome_indicado?.toUpperCase(),
        cargo_base: nameToCamelCase(data?.servidorIndicado?.cargo_base ?? ""),        
        tipo_cessacao: data?.a_pedido === "sim" ? "a pedido" : "de ofício",


        portaria_designacao:"123",
        doc_designacao:"10/01/2026",
        sei_designacao:"123",
        trecho_para_substituir:montarTrechoParaSubstituir(data),


        cargo_indicado: nameToCamelCase(cargo_indicado ?? ""),
        ue: nameToCamelCaseUe(data?.ue_nome ?? ""),       
        

     
        
        
        
        
        
        
        
    };
}



export function gerarDadosInsubsistenciaDesignacao(data: DesignacaoResponse) {
    // const cargo_indicado = getCargoIndicado(data);

    const nome_indicado =
        data?.indicado_nome_civil?.trim()
            ? data.indicado_nome_civil
            : data?.indicado_nome_servidor;

    return {
        doc: data.insubsistencia?.doc ?? "-",
        portaria: data.insubsistencia?.numero_portaria ?? "-",
        ano: data.insubsistencia?.ano_vigente ?? "-",
        sei: data.insubsistencia?.sei_numero ?? "-",

        
        dre: data.dre_nome ?? "-",    
        portaria_designacao: data.numero_portaria ?? "-",        
        doc_designacao: data.doc ?? "-",
        sei_designacao: data.sei_numero ?? "-",
    

        portaria_cessacao: data.cessacao?.numero_portaria ?? "-",
        doc_cessacao: data.cessacao?.doc ?? "-",
        sei_cessacao: data.cessacao?.sei_numero ?? "-",
        

        nome_indicado: nome_indicado,
        rf: formatarRF(data?.indicado_rf ?? "-"),
        vinculo: data?.indicado_vinculo.toString() ?? "-",
        cargo_base: nameToCamelCase(data?.indicado_cargo_base ?? "-"),
        cargo: nameToCamelCase(data?.indicado_cargo_sobreposto ?? "-"),
        ue: nameToCamelCaseUe(data?.indicado_local_exercicio ?? "-"), // NAO TEM TIPO DA ESCOLA NO BANCO!! VER COMO ARRUMAR
        periodo: montarPeriodoInsubsistencia(data)
                   
        
    };
}



export function gerarDadosInsubsistenciaCessacao(data: DesignacaoResponse) {
    // const cargo_indicado = getCargoIndicado(data);

    const nome_indicado =
        data?.indicado_nome_civil?.trim()
            ? data.indicado_nome_civil
            : data?.indicado_nome_servidor;

    return {
        ano_cessacao: data.cessacao?.ano_vigente ?? "-",

        portaria_cessacao: data.cessacao?.numero_portaria ?? "-",
        doc_cessacao: data.cessacao?.doc ?? "-",
        sei_cessacao: data.cessacao?.sei_numero ?? "-",

        doc_insubsistencia: data.cessacao?.insubsistencia?.doc ?? "-",
        portaria_insubsistencia: data.cessacao?.insubsistencia?.numero_portaria ?? "-",
        ano_insubsistencia: data.cessacao?.insubsistencia?.ano_vigente ?? "-",
        sei_insubsistencia: data.cessacao?.insubsistencia?.sei_numero ?? "-",

        
        dre: data.dre_nome ?? "-",    
        portaria_designacao: data.numero_portaria ?? "-",        
        doc_designacao: data.doc ?? "-",
        sei_designacao: data.sei_numero ?? "-",
    

  
        

        nome_indicado: nome_indicado,
        rf: formatarRF(data?.indicado_rf ?? "-"),
        vinculo: data?.indicado_vinculo.toString() ?? "-",
        cargo_base: nameToCamelCase(data?.indicado_cargo_base ?? "-"),
        cargo: nameToCamelCase(data?.indicado_cargo_sobreposto ?? "-"),
        ue: nameToCamelCaseUe(data?.indicado_local_exercicio ?? "-"), // NAO TEM TIPO DA ESCOLA NO BANCO!! VER COMO ARRUMAR
        periodo: montarPeriodoInsubsistencia(data)
                   
        
    };
}