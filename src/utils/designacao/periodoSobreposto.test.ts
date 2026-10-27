import { describe, it, expect } from "vitest";
import {
    CODIGO_PERIODO_SOBREPOSTO,
    interpretarErroPeriodoSobreposto,
    MENSAGEM_PERIODO_SOBREPOSTO,
} from "./periodoSobreposto";

const mensagemBackend =
    "Já existe designação em substituição a este titular, para este cargo nesta unidade, vigente até 31/01/2024. A nova designação só pode iniciar a partir do dia seguinte ao término da anterior (01/02/2024).";

describe("interpretarErroPeriodoSobreposto", () => {
    it("retorna a mensagem do backend quando o código é periodo_sobreposto", () => {
        expect(
            interpretarErroPeriodoSobreposto({
                data_inicio: [mensagemBackend],
                codes: { data_inicio: [CODIGO_PERIODO_SOBREPOSTO] },
            })
        ).toBe(mensagemBackend);
    });

    it("usa a mensagem padrão quando o backend não envia o texto", () => {
        expect(
            interpretarErroPeriodoSobreposto({
                codes: { data_inicio: [CODIGO_PERIODO_SOBREPOSTO] },
            })
        ).toBe(MENSAGEM_PERIODO_SOBREPOSTO);
    });

    it("aceita código e mensagem como string simples", () => {
        expect(
            interpretarErroPeriodoSobreposto({
                data_inicio: mensagemBackend,
                codes: { data_inicio: CODIGO_PERIODO_SOBREPOSTO },
            })
        ).toBe(mensagemBackend);
    });

    it.each([
        ["sem corpo", undefined],
        ["corpo nulo", null],
        ["sem codes", { data_inicio: ["Data inválida."] }],
        ["codes não é objeto", { codes: "periodo_sobreposto" }],
        ["outro código em data_inicio", { codes: { data_inicio: ["invalid"] } }],
        ["código em outro campo", { codes: { data_fim: [CODIGO_PERIODO_SOBREPOSTO] } }],
    ])("retorna null quando não é sobreposição (%s)", (_caso, data) => {
        expect(interpretarErroPeriodoSobreposto(data as never)).toBeNull();
    });
});
