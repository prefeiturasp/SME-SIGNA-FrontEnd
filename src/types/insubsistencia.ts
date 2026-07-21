import { Cessacao, DesignacaoResponse } from "./designacao";


// Payload para escrita (POST /v2/insubsistencias/)
export interface InsubsistenciaBody {
    ato_pai: number;
    numero_portaria: string;
    ano_vigente: string;
    sei_numero: string;
    doc?: string;
    observacoes?: string;
    texto_apostila?: string;
}


export interface InsubsistenciaBaseRead {
    id: number;
    numero_portaria: string;
    ano_vigente: string;
    sei_numero: string;
    doc: string;
    observacoes: string;
    texto_apostila: string;
    doc_do_ato_insubstituido: string;
}
// Formato retornado pela API quando aninhado numa designação

export interface InsubsistenciaRead extends InsubsistenciaBaseRead {
    criado_em: string;
    status: string;
    observacao: string;
    designacao: DesignacaoResponse;
    cessacao: Cessacao;
    insubsistencia: InsubsistenciaBaseRead;
    ato_apostilado: string;
    ato_apostilado_display: string;
    tipo_insubsistencia: string;
    tipo: string;
}
 

// Formato retornado pela API quando aninhado numa cessação
export interface InsubsistenciaCessacaoRead {
    id: number;
    observacoes: string;
}
