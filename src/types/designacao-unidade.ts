export type AtualizarEmailRequest = {
  new_email: string;
};

export type Servidor = {
    rf: string;
    nome_servidor?: string;
    nome_civil?: string;
    vinculo: number;
    lotacao: string;
    cd_cargo_base: number;
    cargo_base: string;
    cd_cargo_sobreposto_funcao_atividade: number;
    cargo_sobreposto_funcao_atividade: string;
    cursos_titulos: string;       
    codigo_hierarquia?: string;
    lotacao_cargo_base?: string;
    laudo_medico: string;
    local_de_servico: string;
    local_de_exercicio: string;
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
  codigo_hierarquico: string;
  funcionarios_unidade: { [codigo: string]: Cargo };
  cargos: CargoSelect[];
  turmas: {
    total: number;
    por_turno: {
      [turno: string]: number;
    };
  };
};

export type PesquisaUnidade = {
  dre: string;
  lotacao: string;
  estrutura_hierarquica: string;
};

export type DesignacaoUnidadeResult =
  | { success: true; data: DesignacaoUnidadeResponse }
  | { success: false; error: string; field?: string };


