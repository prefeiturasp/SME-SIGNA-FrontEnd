import dayjs from "dayjs";

// Designação com início futuro precisa de data final ("Até"). Espelha
// `DesignacaoService._validar_data_futura_sem_periodo` no backend: o front
// bloqueia antes de enviar e também interpreta o erro 400, caso o backend
// recuse primeiro.
export const CODIGO_DATA_FUTURA_SEM_PERIODO = "data_futura_sem_periodo";

export const MENSAGEM_DATA_FUTURA_SEM_PERIODO =
    'Não é possível criar uma designação com data futura sem informar a data "Até".';

// Início depois de hoje e sem data final. Início hoje ou no passado pode
// continuar sem "Até".
export function ehDataFuturaSemPeriodo(
    dataInicio: unknown,
    dataFim: unknown,
    hoje: Date = new Date()
): boolean {
    if (!dataInicio || dataFim) return false;

    const inicio = dayjs(dataInicio as string | Date).startOf("day");
    if (!inicio.isValid()) return false;

    return inicio.isAfter(dayjs(hoje).startOf("day"));
}

type CorpoErroBackend = {
    codes?: Record<string, unknown>;
    [campo: string]: unknown;
};

function primeiroValor(valor: unknown): string | undefined {
    const item = Array.isArray(valor) ? valor[0] : valor;
    return typeof item === "string" ? item : undefined;
}

// Lê `codes.data_fim` da resposta 400 do backend. O texto vem em
// `data.data_fim[0]`; se faltar, usa a mensagem padrão.
export function interpretarErroDataFuturaSemPeriodo(
    data: CorpoErroBackend | null | undefined
): string | null {
    const codes = data?.codes;
    if (!codes || typeof codes !== "object") return null;
    if (primeiroValor(codes.data_fim) !== CODIGO_DATA_FUTURA_SEM_PERIODO) return null;

    return primeiroValor(data?.data_fim) ?? MENSAGEM_DATA_FUTURA_SEM_PERIODO;
}
