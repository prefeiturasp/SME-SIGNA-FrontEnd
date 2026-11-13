import { describe, expect, it } from "vitest";
import {
    CODIGO_DATA_FUTURA_SEM_PERIODO,
    MENSAGEM_DATA_FUTURA_SEM_PERIODO,
    ehDataFuturaSemPeriodo,
    interpretarErroDataFuturaSemPeriodo,
} from "./dataFuturaSemPeriodo";

const HOJE = new Date(2026, 10, 13, 15, 30);

describe("ehDataFuturaSemPeriodo", () => {
    it("bloqueia início futuro sem data final", () => {
        expect(ehDataFuturaSemPeriodo(new Date(2026, 10, 14), null, HOJE)).toBe(true);
        expect(ehDataFuturaSemPeriodo(new Date(2026, 10, 14), undefined, HOJE)).toBe(true);
    });

    it("permite início futuro com data final", () => {
        expect(ehDataFuturaSemPeriodo(new Date(2026, 10, 14), new Date(2026, 10, 30), HOJE)).toBe(false);
    });

    it("permite início hoje, mesmo em horário anterior, sem data final", () => {
        expect(ehDataFuturaSemPeriodo(new Date(2026, 10, 13, 0, 0), null, HOJE)).toBe(false);
        expect(ehDataFuturaSemPeriodo(new Date(2026, 10, 13, 23, 59), null, HOJE)).toBe(false);
    });

    it("permite início no passado sem data final", () => {
        expect(ehDataFuturaSemPeriodo(new Date(2026, 9, 1), null, HOJE)).toBe(false);
    });

    it("aceita datas em texto, como vêm do contexto salvo", () => {
        expect(ehDataFuturaSemPeriodo(new Date(2026, 10, 20).toISOString(), "", HOJE)).toBe(true);
    });

    it("não bloqueia sem data de início ou com data inválida", () => {
        expect(ehDataFuturaSemPeriodo(null, null, HOJE)).toBe(false);
        expect(ehDataFuturaSemPeriodo("data-invalida", null, HOJE)).toBe(false);
    });
});

describe("interpretarErroDataFuturaSemPeriodo", () => {
    it("retorna a mensagem do backend quando o código é data_futura_sem_periodo", () => {
        expect(
            interpretarErroDataFuturaSemPeriodo({
                codes: { data_fim: [CODIGO_DATA_FUTURA_SEM_PERIODO] },
                data_fim: ["Mensagem do backend"],
            })
        ).toBe("Mensagem do backend");
    });

    it("usa a mensagem padrão quando o backend não envia o texto", () => {
        expect(
            interpretarErroDataFuturaSemPeriodo({
                codes: { data_fim: CODIGO_DATA_FUTURA_SEM_PERIODO },
            })
        ).toBe(MENSAGEM_DATA_FUTURA_SEM_PERIODO);
    });

    it("ignora outros códigos e respostas sem codes", () => {
        expect(interpretarErroDataFuturaSemPeriodo({ codes: { data_fim: ["eleicao_necessaria"] } })).toBeNull();
        expect(interpretarErroDataFuturaSemPeriodo({ detail: "erro" })).toBeNull();
        expect(interpretarErroDataFuturaSemPeriodo(null)).toBeNull();
    });
});
