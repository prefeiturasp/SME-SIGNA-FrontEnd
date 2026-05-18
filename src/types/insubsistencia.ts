// Payload para escrita (POST /v2/insubsistencias/)
export interface InsubsistenciaBody {
    ato_pai: number;
    numero_portaria: string;
    ano_vigente: string;
    sei_numero: string;
    doc?: string;
    observacoes?: string;
}

// Formato retornado pela API quando aninhado numa designação
export interface InsubsistenciaRead {
    id: number;
    numero_portaria: string;
    ano_vigente: string;
    sei_numero: string;
    doc: string;
    observacoes: string;
    criado_em: string;
}

// Formato retornado pela API quando aninhado numa cessação
export interface InsubsistenciaCessacaoRead {
    id: number;
    observacoes: string;
}
