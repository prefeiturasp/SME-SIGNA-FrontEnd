export type AtualizarEmailRequest = {
    new_email: string;
};

export type Servidor = {
    rf: string;
    nome: string;
    nome_servidor?: string;
    nome_civil?: string;
    esta_afastado: boolean;
    vinculo_cargo_sobreposto: number;
    lotacao_cargo_sobreposto: string;
    cargo_base: string;
    funcao_atividade: string;
    cargo_sobreposto: string;
    cursos_titulos: string;
    dre: string;
    codigo_estrutura_hierarquica: string;
    local_de_exercicio?: string;
    laudo_medico?: string;
    local_de_servico?: string;
  }
  
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

 
 export type PesquisaUnidade = {
    dre: string;
    lotacao: string;
    estrutura_hierarquica: string;
 };

export type DesignacaoUnidadeResult =
    | { success: true; data: DesignacaoUnidadeResponse }
    | { success: false; error: string; field?: string };


