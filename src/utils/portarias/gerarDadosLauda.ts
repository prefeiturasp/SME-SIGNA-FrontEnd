import { DesignacaoData, DesignacaoResponse, ListagemPortariasResponse } from "@/types/designacao";

import { nameToCamelCase, formatarRF, nameToCamelCaseUe } from "@/utils/portarias/formatadores";
import { montarTrechoSubstituicaoLaudaDesignacao,     montarTrechoFinal,

    montarTrechoParaSubstituir,
    montarPeriodoInsubsistencia,
    montarTrechoUnidade,
    montarTrechoSubstituicaoLaudaCessacao,} from "./regrasLauda";
import { formatarData } from "@/lib/utils";

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

function getCargoIndicadoNew(data: ListagemPortariasResponse, cargo_vaga_display:string): string | undefined {
    

    if (data?.designacao.tipo_vaga !== "VAGO") {
        return data?.designacao.titular_cargo_base;
    }   

    return cargo_vaga_display;
}

export function gerarDadosLaudaDesignacao(data: ListagemPortariasResponse,cargo_vaga_display:string) {
    const cargo_indicado = getCargoIndicadoNew(data, cargo_vaga_display);

    const nome_indicado =
        data?.designacao?.indicado_nome_civil?.trim()
            ? data.designacao.indicado_nome_civil
            : data?.designacao?.indicado_nome_servidor;

    return {
        dre: data.designacao.dre_nome,
        portaria: `${data?.portaria}/${data?.ano}`,
        ano: data?.ano,
        sei: data?.numero_sei,

        vinculo: data?.designacao?.indicado_vinculo,
        nome_indicado: nome_indicado?.toUpperCase(),

        cargo_base: nameToCamelCase(data?.designacao.indicado_cargo_base ?? ""),
        lotacao_indicado: nameToCamelCaseUe(data?.designacao?.indicado_lotacao ?? ""),
        
        cargo_indicado: nameToCamelCase(cargo_indicado ?? ""),
        ue: nameToCamelCaseUe(data?.designacao.unidade_proponente ?? ""),
        eh: data?.designacao.codigo_hierarquico,
        trecho_substituicao: montarTrechoSubstituicaoLaudaDesignacao(data),
        trecho_final: montarTrechoFinal(data),

        trecho_unidade:montarTrechoUnidade(data),
        
        
        rf: formatarRF(data?.designacao.indicado_rf ?? ""),
        
        
        
        
        
        
        
    };
}

export function gerarDadosLaudaCessacao(data: ListagemPortariasResponse,cargo_vaga_display:string) {
    const cargo_indicado = getCargoIndicadoNew(data, cargo_vaga_display);

    const nome_indicado =
    data?.designacao?.indicado_nome_civil?.trim()
        ? data.designacao.indicado_nome_civil
        : data?.designacao?.indicado_nome_servidor;

    return {
        dre: data.designacao.dre_nome,
        portaria: `${data?.portaria}/${data?.ano}`,
        ano: data?.ano,
        sei: data?.numero_sei,
        doc: data?.doc ? formatarData(data.doc): "____" ,
        vinculo: data?.designacao?.indicado_vinculo,
        nome_indicado: nome_indicado?.toUpperCase(),
        cargo_base: nameToCamelCase(data?.designacao?.indicado_cargo_base ?? ""),        
        tipo_cessacao: data?.cessacao?.a_pedido  ? "a pedido" : "de ofício",


        portaria_designacao:data?.designacao?.portaria,
        doc_designacao:data?.designacao?.doc ? formatarData(data.designacao.doc): "____" ,
        sei_designacao:data?.designacao?.numero_sei,
        


        cargo_indicado: nameToCamelCase(cargo_indicado ?? ""),
        trecho_para_substituir:montarTrechoSubstituicaoLaudaCessacao(data, cargo_vaga_display),
        
        ue: nameToCamelCaseUe(data?.designacao?.unidade_proponente ?? ""),       
        

     
        
        rf: formatarRF(data?.designacao.indicado_rf ?? ""),

        
        
        
        
        
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