export type AtualizarEmailRequest = {
    new_email: string;
};

export type Servidor = {
    rf: string;
    nome: string;
    esta_afastado: boolean;
    vinculo_cargo_sobreposto: string;
    lotacao_cargo_sobreposto: string;
    cargo_base: string;
    funcao_atividade: string;
    cargo_sobreposto: string;
    cursos_titulos: string;
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

  
  type Turma = {
    por_turno: {
      integral: string;
      manha: string;
      tarde: string;
      noite: string;
      vespertino: string;
      
    };
    total: number;
  };
  


export type DesignacaoUnidadeResponse = {
  funcionarios_unidade: { [codigo: string]: Cargo };
  cargos: CargoSelect[];
  turmas: Turma[];
};

 
 

export type DesignacaoUnidadeResult =
    | { success: true; data: DesignacaoUnidadeResponse }
    | { success: false; error: string; field?: string };
