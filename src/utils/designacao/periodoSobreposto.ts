// Bloqueio de sobreposição de períodos entre substituições do mesmo titular,
// no mesmo cargo e unidade. A regra fica só no backend
// (`DesignacaoService._validar_sobreposicao`), pois depende das designações já
// cadastradas; o front apenas interpreta o erro 400 que ele devolve.
export const CODIGO_PERIODO_SOBREPOSTO = "periodo_sobreposto";

export const MENSAGEM_PERIODO_SOBREPOSTO =
    "Já existe designação em substituição a este titular, para este cargo nesta unidade, no período informado. A nova designação só pode iniciar a partir do dia seguinte ao término da anterior.";

type CorpoErroBackend = {
    codes?: Record<string, unknown>;
    [campo: string]: unknown;
};

function primeiroValor(valor: unknown): string | undefined {
    const item = Array.isArray(valor) ? valor[0] : valor;
    return typeof item === "string" ? item : undefined;
}

// Lê `codes.data_inicio` da resposta 400 do backend. O texto vem em
// `data.data_inicio[0]`, com as datas do conflito; se faltar, usa a mensagem padrão.
export function interpretarErroPeriodoSobreposto(
    data: CorpoErroBackend | null | undefined
): string | null {
    const codes = data?.codes;
    if (!codes || typeof codes !== "object") return null;
    if (primeiroValor(codes.data_inicio) !== CODIGO_PERIODO_SOBREPOSTO) return null;

    return primeiroValor(data?.data_inicio) ?? MENSAGEM_PERIODO_SOBREPOSTO;
}
