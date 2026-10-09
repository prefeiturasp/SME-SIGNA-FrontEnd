export type AtualizarEmailRequest = {
  new_email: string;
};

export type Servidor = {
  rf: string;
  nome_servidor: string;
  nome_civil?: string;
  vinculo: number;
  lotacao: string;
  cd_cargo_base: number;
  cargo_base: string;
  cd_cargo_sobreposto_funcao_atividade: number;
  cargo_sobreposto_funcao_atividade: string;
  // Diz se `cd_cargo_sobreposto_funcao_atividade` é cargo sobreposto (true) ou função/atividade (false).
  possui_cargo_sobreposto?: boolean;
  // Código da UE de lotação (do cargo sobreposto, se houver; senão do cargo base).
  cd_ue_lotacao?: string | number | null;
  cursos_titulos: string;
  codigo_hierarquia?: string;
  lotacao_cargo_base?: string;
  laudo_medico: string;
  local_de_servico: string;
  local_de_exercicio: string;
  categoria?: string;
}



type Cargo = {
  codigo_cargo: number;
  nome_cargo: string;
  modulo: number;
  // Calculado no backend (RF único, desconsidera afastados).
  quantidade_servidores: number;
  // true quando a quantidade de servidores no cargo excede o módulo da unidade.
  excedente: boolean;
  servidores: Servidor[];
};

type CargoSelect = {

  nomeCargo: string;
  codigoCargo: string;
};

type TurnoTurma = {
  turno: string;
  total: number;
  cicloAlfabetizacao: number;
  cicloInterdisciplinar: number;
  cicloAutoral: number;
  semCiclo: number;
  cicloBasicoEja: number;
  cicloComplementarEja: number;
  cicloFinalEja: number;
  cicloBercarioI: number;
  cicloBercarioII: number;
  cicloMiniGrupoI: number;
  cicloMiniGrupoII: number;
  cicloInfantil: number;
};

export type DesignacaoUnidadeResponse = {
  codigo_hierarquico: string;
  funcionarios_unidade: { [codigo: string]: Cargo };
  cargos: CargoSelect[];
  turmas: {
    total: number;
    turnos: TurnoTurma[];
  };
  spi: {
    tipo: string;
    total: number;
    turnos: TurnoTurma[];
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


