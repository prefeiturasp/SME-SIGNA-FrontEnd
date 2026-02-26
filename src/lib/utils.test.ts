import { describe, it, expect } from "vitest";
import { cn, numberToBRL, isValidCPF } from "./utils";

describe("cn", () => {
    it("combina classes simples", () => {
        expect(cn("a", "b")).toBe("a b");
    });
    it("remove falsy mas mantém duplicadas", () => {
        expect(cn("a", false, null, undefined, "b", "a")).toBe("a b a");
    });
    it("aceita array de classes", () => {
        expect(cn(["a", "b"], "c")).toBe("a b c");
    });
    it("retorna string vazia se nada válido", () => {
        expect(cn(null, false, undefined)).toBe("");
    });
});

describe("numberToBRL", () => {
    it("formata número inteiro", () => {
        expect(numberToBRL(1234)).toBe("R$ 1.234,00");
    });
    it("formata número decimal", () => {
        expect(numberToBRL(1234.56)).toBe("R$ 1.234,56");
    });
    it("formata zero", () => {
        expect(numberToBRL(0)).toBe("R$ 0,00");
    });
    it("formata número negativo", () => {
        expect(numberToBRL(-10.5)).toBe("-R$ 10,50");
    });
});

describe("isValidCPF", () => {
    it("retorna true para CPF válido", () => {
        expect(isValidCPF("52998224725")).toBe(true);
        expect(isValidCPF("39053344705")).toBe(true);
    });
    it("retorna false para CPF inválido", () => {
        expect(isValidCPF("12345678900")).toBe(false);
        expect(isValidCPF("11111111111")).toBe(false);
        expect(isValidCPF("00000000000")).toBe(false);
        expect(isValidCPF("52998224724")).toBe(false);
    });
    it("retorna false para strings com menos de 11 dígitos", () => {
        expect(isValidCPF("1234567890")).toBe(false);
        expect(isValidCPF("")).toBe(false);
    });
    it("ignora caracteres não numéricos", () => {
        expect(isValidCPF("529.982.247-25")).toBe(true);
        expect(isValidCPF("390.533.447-05")).toBe(true);
    });
    it("retorna false para entradas não numéricas ou tipos diferentes de string", () => {
        // @ts-expect-error testando tipos errados
        expect(isValidCPF(undefined)).toBe(false);
        // @ts-expect-error testando tipos errados
        expect(isValidCPF(null)).toBe(false);
        // @ts-expect-error testando tipos errados
        expect(isValidCPF({})).toBe(false);
        expect(isValidCPF("palavraqualquer")).toBe(false);
    });

    it("retorna false para CPF com dígitos repetidos (todos 9)", () => {
        expect(isValidCPF("99999999999")).toBe(false);
    });

    it("valida corretamente CPF onde o resto dá 10 ou 11 e vira 0", () => {
        expect(isValidCPF("168.995.350-09")).toBe(true);
    });

    it("retorna false quando o resto do primeiro dígito verificador é 10", () => {
        expect(isValidCPF("00000000611")).toBe(false);
    });

    it("retorna false quando o resto do segundo dígito verificador é 10", () => {
        expect(isValidCPF("00000028101")).toBe(false);
    });
});
