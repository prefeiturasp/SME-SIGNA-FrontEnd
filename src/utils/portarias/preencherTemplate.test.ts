import { describe, it, expect } from "vitest";
import { preencherTemplate } from "./preencherTemplate";

describe("preencherTemplate", () => {
    it("substitui o placeholder pelo valor correspondente", () => {
        const template = "Olá {{nome}}!";
        const dados = { nome: "João" };

        const resultado = preencherTemplate(template, dados);

        expect(resultado).toBe("Olá João!");
    });

    it("retorna ____ quando o valor não existe", () => {
        const template = "Olá {{nome}}!";
        const dados = {};

        const resultado = preencherTemplate(template, dados);

        expect(resultado).toBe("Olá ____!");
    });

    it("retorna ____ quando o valor é null", () => {
        const template = "Nome: {{nome}}";
        const dados = { nome: null };

        const resultado = preencherTemplate(template, dados);

        expect(resultado).toBe("Nome: ____");
    });

    it("retorna ____ quando o valor é string vazia", () => {
        const template = "Nome: {{nome}}";
        const dados = { nome: "" };

        const resultado = preencherTemplate(template, dados);

        expect(resultado).toBe("Nome: ____");
    });

    it("substitui múltiplos placeholders", () => {
        const template = "{{saudacao}} {{nome}}";
        const dados = { saudacao: "Olá", nome: "Maria" };

        const resultado = preencherTemplate(template, dados);

        expect(resultado).toBe("Olá Maria");
    });

    it("ignora espaços dentro das chaves", () => {
        const template = "Olá {{ nome }}!";
        const dados = { nome: "Carlos" };

        const resultado = preencherTemplate(template, dados);

        expect(resultado).toBe("Olá Carlos!");
    });
});