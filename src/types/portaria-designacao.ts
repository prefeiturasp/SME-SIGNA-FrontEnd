 

export type PortariaDesignacao = {
    numero_portaria: string;
    ano_vigente: string;
    sei_numero: string;
    doc: string;
    data_inicio: string;
    data_fim: string | null;
    carater_excepcional: boolean;
    impedimento_substituicao: string | null;
    motivo_afastamento: string;
    pendencias: string;
  }
     