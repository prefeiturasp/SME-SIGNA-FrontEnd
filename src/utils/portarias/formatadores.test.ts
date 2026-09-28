import { describe, it, expect } from "vitest";
import { nameToCamelCase, nameToCamelCaseUe, formatarRF, formatarDataPtBr } from "./formatadores";

describe("nameToCamelCase", () => {
    it("deve formatar nome simples corretamente", () => {
        expect(nameToCamelCase("joao silva")).toBe("Joao Silva");
    });

    it("deve manter preposições minúsculas (exceto primeira palavra)", () => {
        expect(nameToCamelCase("joao da silva")).toBe("Joao da Silva");
    });

    it("deve capitalizar a primeira palavra mesmo se for preposição", () => {
        expect(nameToCamelCase("da silva")).toBe("Da Silva");
    });

    it("deve remover espaços extras", () => {
        expect(nameToCamelCase("  joao   da   silva  ")).toBe("Joao da Silva");
    });

    it("deve retornar string vazia se input for vazio", () => {
        expect(nameToCamelCase("")).toBe("");
    });
});

describe("nameToCamelCaseUe", () => {
    it("deve parar de considerar sigla após hífen separado (remove o hífen)", () => {
        expect(nameToCamelCaseUe("EMEF - JOAO DA SILVA")).toBe("EMEF  Joao da Silva");
    });

    it("deve tratar hífen junto com palavra e capitalizar o restante", () => {
        expect(nameToCamelCaseUe("EMEF-JOAO DA SILVA")).toBe("EMEF-JOAO da Silva");
    });

    it("deve funcionar sem siglas", () => {
        expect(nameToCamelCaseUe("joao da silva")).toBe("Joao da Silva");
    });

    it("deve retornar vazio se input for vazio", () => {
        expect(nameToCamelCaseUe("")).toBe("");
    });
});

describe("formatarRF", () => {
    it("deve formatar RF com 7 dígitos", () => {
        expect(formatarRF("1234567")).toBe("123.456.7");
    });

    it("deve formatar RF com 6 dígitos", () => {
        expect(formatarRF("123456")).toBe("123.456");
    });

    it("deve formatar RF com até 3 dígitos sem ponto", () => {
        expect(formatarRF("123")).toBe("123");
    });

    it("deve ignorar caracteres não numéricos", () => {
        expect(formatarRF("123.456-7")).toBe("123.456.7");
    });

    it("deve retornar vazio se input for vazio", () => {
        expect(formatarRF("")).toBe("");
    });
});

describe("formatarDataPtBr", () => {
    it("formata data ISO (YYYY-MM-DD) para pt-BR sem deslocar por fuso horário", () => {
        expect(formatarDataPtBr("2026-08-31")).toBe("31/08/2026");
    });

    it("formata data ISO com horário para pt-BR", () => {
        expect(formatarDataPtBr("2026-08-31T00:00:00")).toBe("31/08/2026");
    });

    it("formata objeto Date para pt-BR", () => {
        expect(formatarDataPtBr(new Date(2026, 7, 31))).toBe("31/08/2026");
    });

    it("retorna '-' quando o valor é nulo, indefinido ou vazio", () => {
        expect(formatarDataPtBr(null)).toBe("-");
        expect(formatarDataPtBr(undefined)).toBe("-");
        expect(formatarDataPtBr("")).toBe("-");
    });

    it("retorna '-' quando o valor não é uma data válida", () => {
        expect(formatarDataPtBr("DOC")).toBe("-");
    });
});