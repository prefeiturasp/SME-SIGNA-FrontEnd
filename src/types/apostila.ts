import { Cessacao, DesignacaoResponse } from "./designacao";

export interface ApostilaBody {
    ato_pai: number;
    sei_numero: string;
    doc?: string;
    observacao?: string;
    alteracoes?: {
        campo_alterado: string;
        valor_novo: string;
    }[];
}

 
export interface ApostilaInsubsistenciasBody {
    ato_pai: number;
    numero_portaria: string;
    sei_numero: string;
    doc?: string;
    ano_vigente?: string;
    observacoes?: string;
    texto_apostila?: string;
}

// Formato retornado pela API (leitura)
export interface ApostilaRead {
    id: number;
    sei_numero: string;
    doc: string;
    status: string;
    observacao: string;
    criado_em: string;
}


export interface ApostilaDetailRead {
    id: number;    
    numero_portaria: string;
    tipo: string;
    ato_apostilado: string;
    ato_apostilado_display: string;
    sei_numero: string;
    doc: string;
    status: string;
    observacao: string;
    criado_em: string;
    designacao: DesignacaoResponse;
    cessacao: Cessacao;
}