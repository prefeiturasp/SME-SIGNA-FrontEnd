import dayjs from "dayjs";
import type { Servidor } from "@/types/designacao-unidade";

// Regras de substituição do Diretor de Escola. Espelham
// `DesignacaoService._validar_substituicao_diretor` no backend: qualquer
// divergência faz o front bloquear algo que o backend aceita (ou o contrário).
export const CODIGO_CARGO_DIRETOR = 3360;
// Assistente de Diretor substitui o Diretor informalmente por até 15 dias,
// por isso nunca pode ser designado formalmente para o cargo.
export const CODIGO_CARGO_ASSISTENTE_DIRETOR = 3085;
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
export const CODIGO_ASSISTENTE_DIRETOR = "assistente_diretor";
export const CODIGO_INDICADO_NAO_PROFESSOR = "indicado_nao_professor";

export const MENSAGEM_PERIODO_INSUFICIENTE = `A designação para substituição do Diretor deve ter período de ${SUBSTITUICAO_DIRETOR_MIN_DIAS} a ${SUBSTITUICAO_DIRETOR_MAX_DIAS} dias.`;
export const MENSAGEM_ELEICAO_NECESSARIA = `A substituição do Diretor não pode ultrapassar ${SUBSTITUICAO_DIRETOR_MAX_DIAS} dias. É necessária a realização de eleição para o cargo de Diretor.`;
export const MENSAGEM_DATA_FINAL_OBRIGATORIA = "Para substituição do Diretor, a data final é obrigatória.";
export const MENSAGEM_UNIDADE_DIFERENTE = "O professor designado para substituir o Diretor deve ser da mesma unidade escolar.";
export const MENSAGEM_INDICADO_NAO_PROFESSOR = "Somente professor pode ser designado para substituir o Diretor.";
export const MENSAGEM_ASSISTENTE_DIRETOR = "O servidor não pode ser designado para o cargo de Diretor por já possuir o cargo sobreposto de Assistente de Diretor.";

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
    naoProfessor: boolean;
    unidadeDiferente: boolean;
    assistenteDiretor: boolean;
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

// Só o cargo sobreposto conta: 3085 como função/atividade não bloqueia.
export function ehAssistenteDiretor(indicado: IndicadoSubstituicao | null | undefined): boolean {
    if (!indicado?.possui_cargo_sobreposto) return false;
    const codigo = indicado.cd_cargo_sobreposto_funcao_atividade;
    if (codigo === null || codigo === undefined || String(codigo).trim() === "") return false;
    return Number(codigo) === CODIGO_CARGO_ASSISTENTE_DIRETOR;
}

// Ignora espaços e zeros à esquerda: o EOL devolve "090450" ou 90450.
function normalizarCodigoUe(valor: string | number | null | undefined): string {
    return String(valor ?? "").trim().replace(/^0+/, "");
}

// Algum código de UE ausente também bloqueia, como no backend.
export function deOutraUnidade(
    indicado: IndicadoSubstituicao | null | undefined,
    codigoUe: string | number | null | undefined
): boolean {
    const ue = normalizarCodigoUe(codigoUe);
    return !ue || normalizarCodigoUe(indicado?.cd_ue_lotacao) !== ue;
}

export function avaliarSubstituicaoDiretor(
    dados: DadosSubstituicaoDiretor
): AvaliacaoSubstituicaoDiretor {
    const dias = contarDiasPeriodo(dados.dataInicio, dados.dataFim);

    if (!ehCargoDiretor(dados.cargoVaga)) {
        return {
            aplica: false,
            dias,
            erroPeriodo: null,
            naoProfessor: false,
            unidadeDiferente: false,
            assistenteDiretor: false,
            bloqueado: false,
        };
    }

    // O backend verifica o AD antes das demais regras e para ali; o front
    // segue a mesma ordem para que só a mensagem do AD apareça.
    if (ehAssistenteDiretor(dados.indicado)) {
        return {
            aplica: true,
            dias,
            erroPeriodo: null,
            naoProfessor: false,
            unidadeDiferente: false,
            assistenteDiretor: true,
            bloqueado: true,
        };
    }

    const erroPeriodo = validarPeriodoSubstituicaoDiretor(dias);
    // Período e indicado aparecem em blocos diferentes da tela, então são
    // avaliados juntos. Entre as regras do indicado vale a ordem do backend:
    // a unidade só é conferida para quem é professor.
    const naoProfessor = !ehProfessor(dados.indicado);
    const unidadeDiferente = !naoProfessor && deOutraUnidade(dados.indicado, dados.codigoUe);

    return {
        aplica: true,
        dias,
        erroPeriodo,
        naoProfessor,
        unidadeDiferente,
        assistenteDiretor: false,
        bloqueado: erroPeriodo !== null || naoProfessor || unidadeDiferente,
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

    if (primeiroValor(codes.indicado_codigo_cargo_sobreposto) === CODIGO_ASSISTENTE_DIRETOR) {
        const detail = typeof data?.detail === "string" ? data.detail : undefined;
        return {
            indicado:
                primeiroValor(data?.indicado_codigo_cargo_sobreposto) ?? detail ?? MENSAGEM_ASSISTENTE_DIRETOR,
        };
    }

    const erros: ErrosBackendSubstituicaoDiretor = {};
    const codigoDataFim = primeiroValor(codes.data_fim);
    const mensagemDataFim = primeiroValor(data?.data_fim);

    if (codigoDataFim === CODIGO_ELEICAO_NECESSARIA) {
        erros.eleicao = mensagemDataFim ?? MENSAGEM_ELEICAO_NECESSARIA;
    } else if (codigoDataFim === CODIGO_PERIODO_INSUFICIENTE) {
        erros.dataFim = mensagemDataFim ?? MENSAGEM_PERIODO_INSUFICIENTE;
    }

    // `indicado_nao_professor` vem no campo do cargo considerado (sobreposto ou base).
    const campoNaoProfessor = ["indicado_codigo_cargo_sobreposto", "indicado_codigo_cargo_base"].find(
        (campo) => primeiroValor(codes[campo]) === CODIGO_INDICADO_NAO_PROFESSOR
    );

    if (campoNaoProfessor) {
        erros.indicado = primeiroValor(data?.[campoNaoProfessor]) ?? MENSAGEM_INDICADO_NAO_PROFESSOR;
    } else if (primeiroValor(codes.indicado_codigo_ue_lotacao) === CODIGO_UNIDADE_DIFERENTE) {
        erros.indicado = primeiroValor(data?.indicado_codigo_ue_lotacao) ?? MENSAGEM_UNIDADE_DIFERENTE;
    }

    return Object.keys(erros).length > 0 ? erros : null;
}
