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
    sei_numero: string;
    doc: string;
    status: string;
    observacao: string;
    criado_em: string;
    designacao: Partial<DesignacaoResponse>;
    cessacao: Partial<Cessacao>;
}