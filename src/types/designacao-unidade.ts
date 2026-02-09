export type AtualizarEmailRequest = {
    new_email: string;
};

type Servidor = {
    rf: string;
    nome: string;
    esta_afastado: boolean;
    cargoSobreposto: string | null;
  };
  
  type Cargo = {
    codigo_cargo: number;
    nome_cargo: string;
    modulo: string;
    servidores: Servidor[];
  };

  type CargoSelect = {
    
    nomeCargo: string;
    codigoCargo: string;
  };

  
  
  

export type DesignacaoUnidadeResponse = {
  funcionarios_unidade: { [codigo: string]: Cargo };
  cargos: CargoSelect[];
};

 
export interface ErrorResponse {
  detail: string;
}


export type DesignacaoUnidadeResult =
    | { success: true; data: DesignacaoUnidadeResponse }
    | { success: false; error: string; field?: string };
