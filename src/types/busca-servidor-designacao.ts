 

export interface BuscaServidorDesignacaoBody {
    nome: string;
    rf: string;
    vinculo_cargo_sobreposto: string;
    lotacao_cargo_sobreposto: string;
    cargo_base: string;
    funcao_atividade: string;
    cargo_sobreposto: string;
    cursos_titulos: string;
    dre: string;
    unidade: string;
    codigo: string;
  }
export interface ResumoDesignacaoBody {
    nome_da_unidade: string;
    estrutura_hierarquica?: string;
    turmas?: string;
    funcionarios_da_unidade?: string;
    assistente_de_diretor_escolar?: string;
    secretario_da_escola?: string;
    funcao_atividade?: string;
    cargo_sobreposto?: string;
    modulos?: string;
  };