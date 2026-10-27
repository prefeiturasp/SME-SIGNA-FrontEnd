export interface ICargoType {
    codigoCargo: number;
    nomeCargo: string;  
}

export interface CargoDesignacoes {
    codigoCargo: number | null;
    nomeCargo: string;
    quantidade_designacoes: number;
}
