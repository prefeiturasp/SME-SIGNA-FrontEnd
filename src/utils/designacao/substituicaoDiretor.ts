import dayjs from "dayjs";
import type { Servidor } from "@/types/designacao-unidade";

// Regras de substituição do Diretor de Escola. Espelham
// `DesignacaoService._validar_substituicao_diretor` no backend: qualquer
// divergência faz o front bloquear algo que o backend aceita (ou o contrário).
export const CODIGO_CARGO_DIRETOR = 3360;
export const SUBSTITUICAO_DIRETOR_MIN_DIAS = 16;
export const SUBSTITUICAO_DIRETOR_MAX_DIAS = 30;

// Códigos EOL de cargos de professor (`CODIGOS_CARGO_PROFESSOR` no backend).
// Não comparar por nome: há cargos como "Profissional Eng..." que não são professores.
export const CODIGOS_CARGO_PROFESSOR: ReadonlySet<number> = new Set([
    // Educação Infantil e Ensino Fundamental I
    3212, 3213, 3239, 3875,
    // Ensino Fundamental II e Médio
    3255, 3263, 3271, 3280, 3298, 3301, 3336, 3344, 3760, 3808, 3816, 3840,
    3859, 3867, 3868, 3869, 3870, 3871, 3873, 3874, 3876, 3877, 3878, 3879,
    3880, 3881, 3882, 3883,
    // Adjuntos
    3395, 3409, 3425, 3433, 3441, 3450, 3468,
    // Substitutos
    3220, 3247,
    // Nomenclatura antiga (1º e 2º grau)
    3131, 3310,
]);

export const CODIGO_ELEICAO_NECESSARIA = "eleicao_necessaria";
export const CODIGO_PERIODO_INSUFICIENTE = "periodo_insuficiente";
export const CODIGO_UNIDADE_DIFERENTE = "unidade_diferente";

export const MENSAGEM_PERIODO_INSUFICIENTE = `A designação para substituição do Diretor deve ter período de ${SUBSTITUICAO_DIRETOR_MIN_DIAS} a ${SUBSTITUICAO_DIRETOR_MAX_DIAS} dias.`;
export const MENSAGEM_ELEICAO_NECESSARIA = `A substituição do Diretor não pode ultrapassar ${SUBSTITUICAO_DIRETOR_MAX_DIAS} dias. É necessária a realização de eleição para o cargo de Diretor.`;
export const MENSAGEM_DATA_FINAL_OBRIGATORIA = "Para substituição do Diretor, a data final é obrigatória.";
export const MENSAGEM_UNIDADE_DIFERENTE = "O professor designado para substituir o Diretor deve ser da mesma unidade escolar.";

export type ErroPeriodoSubstituicaoDiretor =
    | typeof CODIGO_ELEICAO_NECESSARIA
    | typeof CODIGO_PERIODO_INSUFICIENTE;

type IndicadoSubstituicao = Pick<
    Servidor,
    "cd_cargo_base" | "cd_cargo_sobreposto_funcao_atividade" | "possui_cargo_sobreposto" | "cd_ue_lotacao"
>;

export type DadosSubstituicaoDiretor = {
    cargoVaga: number | null | undefined;
    // `unknown` porque as datas podem vir como string após passar pelo localStorage.
    dataInicio: unknown;
    dataFim: unknown;
    indicado: IndicadoSubstituicao | null | undefined;
    // Código da UE da designação (campo `ue`), não o nome.
    codigoUe: string | number | null | undefined;
};

export type AvaliacaoSubstituicaoDiretor = {
    aplica: boolean;
    dias: number | null;
    erroPeriodo: ErroPeriodoSubstituicaoDiretor | null;
    unidadeDiferente: boolean;
    bloqueado: boolean;
};

export function ehCargoDiretor(cargoVaga: number | null | undefined): boolean {
    return cargoVaga === CODIGO_CARGO_DIRETOR;
}

// Conta o primeiro e o último dia: de 01/01 a 16/01 são 16 dias.
export function contarDiasPeriodo(dataInicio: unknown, dataFim: unknown): number | null {
    if (!dataInicio || !dataFim) return null;

    const inicio = dayjs(dataInicio as string | Date).startOf("day");
    const fim = dayjs(dataFim as string | Date).startOf("day");
    if (!inicio.isValid() || !fim.isValid()) return null;

    return fim.diff(inicio, "day") + 1;
}

export function validarPeriodoSubstituicaoDiretor(
    dias: number | null
): ErroPeriodoSubstituicaoDiretor | null {
    if (dias === null || dias > SUBSTITUICAO_DIRETOR_MAX_DIAS) return CODIGO_ELEICAO_NECESSARIA;
    if (dias < SUBSTITUICAO_DIRETOR_MIN_DIAS) return CODIGO_PERIODO_INSUFICIENTE;
    return null;
}

// Cargo considerado: o sobreposto, quando houver; senão, o cargo base.
// Função/atividade não conta como cargo (`possui_cargo_sobreposto` false).
export function ehProfessor(indicado: IndicadoSubstituicao | null | undefined): boolean {
    const codigo = indicado?.possui_cargo_sobreposto
        ? indicado.cd_cargo_sobreposto_funcao_atividade
        : indicado?.cd_cargo_base;
    if (codigo === null || codigo === undefined || String(codigo).trim() === "") return false;
    return CODIGOS_CARGO_PROFESSOR.has(Number(codigo));
}

// Ignora espaços e zeros à esquerda: o EOL devolve "090450" ou 90450.
function normalizarCodigoUe(valor: string | number | null | undefined): string {
    return String(valor ?? "").trim().replace(/^0+/, "");
}

// Professor com algum código de UE ausente também é bloqueado, como no backend.
export function professorDeOutraUnidade(
    indicado: IndicadoSubstituicao | null | undefined,
    codigoUe: string | number | null | undefined
): boolean {
    if (!ehProfessor(indicado)) return false;
    const ue = normalizarCodigoUe(codigoUe);
    return !ue || normalizarCodigoUe(indicado?.cd_ue_lotacao) !== ue;
}

export function avaliarSubstituicaoDiretor(
    dados: DadosSubstituicaoDiretor
): AvaliacaoSubstituicaoDiretor {
    const dias = contarDiasPeriodo(dados.dataInicio, dados.dataFim);

    if (!ehCargoDiretor(dados.cargoVaga)) {
        return { aplica: false, dias, erroPeriodo: null, unidadeDiferente: false, bloqueado: false };
    }

    const erroPeriodo = validarPeriodoSubstituicaoDiretor(dias);
    const unidadeDiferente = professorDeOutraUnidade(dados.indicado, dados.codigoUe);

    return {
        aplica: true,
        dias,
        erroPeriodo,
        unidadeDiferente,
        bloqueado: erroPeriodo !== null || unidadeDiferente,
    };
}

export type ErrosBackendSubstituicaoDiretor = {
    eleicao?: string;
    dataFim?: string;
    indicado?: string;
};

type CorpoErroBackend = {
    codes?: Record<string, unknown>;
    [campo: string]: unknown;
};

function primeiroValor(valor: unknown): string | undefined {
    const item = Array.isArray(valor) ? valor[0] : valor;
    return typeof item === "string" ? item : undefined;
}

// Lê `codes` da resposta 400 do backend. O texto vem em `data[campo][0]`;
// se faltar, usa a mensagem padrão da regra.
export function interpretarErrosSubstituicaoDiretor(
    data: CorpoErroBackend | null | undefined
): ErrosBackendSubstituicaoDiretor | null {
    const codes = data?.codes;
    if (!codes || typeof codes !== "object") return null;

    const erros: ErrosBackendSubstituicaoDiretor = {};
    const codigoDataFim = primeiroValor(codes.data_fim);
    const mensagemDataFim = primeiroValor(data?.data_fim);

    if (codigoDataFim === CODIGO_ELEICAO_NECESSARIA) {
        erros.eleicao = mensagemDataFim ?? MENSAGEM_ELEICAO_NECESSARIA;
    } else if (codigoDataFim === CODIGO_PERIODO_INSUFICIENTE) {
        erros.dataFim = mensagemDataFim ?? MENSAGEM_PERIODO_INSUFICIENTE;
    }

    if (primeiroValor(codes.indicado_codigo_ue_lotacao) === CODIGO_UNIDADE_DIFERENTE) {
        erros.indicado = primeiroValor(data?.indicado_codigo_ue_lotacao) ?? MENSAGEM_UNIDADE_DIFERENTE;
    }

    return Object.keys(erros).length > 0 ? erros : null;
}
