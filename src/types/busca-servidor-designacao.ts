 

export interface BuscaServidorDesignacaoBody {
    servidor: string;
    rf: string;
    vinculo: string;
    lotacao: string;
    cargo_base: string;
    aulas_atribuidas: string;
    funcao: string;
    cargo_sobreposto: string;
    cursos_titulos: string;
    estagio_probatorio: string;
    aprovado_em_concurso: string;
    laudo_medico: string;
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