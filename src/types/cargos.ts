export interface ICargoType {
    codigoCargo: number;
    nomeCargo: string;  
}

export interface CargoVigente {
    codigoCargo: number | null;
    nomeCargo: string;
    quantidade_designacoes_vigentes: number;
}
