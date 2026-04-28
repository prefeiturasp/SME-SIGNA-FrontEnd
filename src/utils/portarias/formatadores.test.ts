import { describe, it, expect } from "vitest";
import { nameToCamelCase, nameToCamelCaseUe, formatarRF } from "./formatadores";

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
    it("deve parar de considerar sigla após hífen", () => {
        expect(nameToCamelCaseUe("EMEF - JOAO DA SILVA")).toBe("EMEF - Joao da Silva");
    });

    it("deve tratar hífen junto com palavra", () => {
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