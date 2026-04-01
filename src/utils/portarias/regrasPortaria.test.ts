import { describe, it, expect } from "vitest";
import {
    montarTrechoSubstituicao,
    montarTrechoFinal,
    montarAutoridade
} from "./regrasPortaria";

describe("montarTrechoSubstituicao", () => {

    it("retorna texto para cargo vago com data string", () => {
        const data: any = {
            tipo_cargo: "vago",
            a_partir_de: "2025-03-01"
        };

        const resultado = montarTrechoSubstituicao(data);

        expect(resultado).toContain("cargo vago");
        expect(resultado).toContain("a partir de");
    });

    it("aceita data como objeto Date", () => {
        const data: any = {
            tipo_cargo: "vago",
            a_partir_de: new Date("2025-03-01")
        };

        const resultado = montarTrechoSubstituicao(data);

        expect(resultado).toContain("cargo vago");
    });

    it("retorna string vazia quando não há titular", () => {
        const data: any = {
            tipo_cargo: "titular",
            a_partir_de: "2025-03-01"
        };

        const resultado = montarTrechoSubstituicao(data);

        expect(resultado).toBe("");
    });

    it("retorna substituição padrão quando não há impedimento", () => {
        const data: any = {
            tipo_cargo: "titular",
            a_partir_de: "2025-03-01",
            dadosTitular: {
                nome_civil: "Maria Souza",
                rf: "123456",
                vinculo: "Efetivo",
                cargo_base: "Diretora",
                tipo_vinculo: "efetivo"
            }
        };

        const resultado = montarTrechoSubstituicao(data);

        expect(resultado).toContain("em substituição a Maria Souza");
        expect(resultado).toContain("a partir de");
    });

    it("usa ____ quando dados do titular estão ausentes", () => {
        const data: any = {
            tipo_cargo: "titular",
            a_partir_de: "2025-03-01",
            dadosTitular: {}
        };

        const resultado = montarTrechoSubstituicao(data);

        expect(resultado).toContain("____");
    });

    it("retorna texto para licença médica", () => {
        const data: any = {
            impedimento_substituicao: "2",
            a_partir_de: "2025-03-01",
            designacao_data_final: "2025-03-10",
            dadosTitular: {
                nome_civil: "Maria Souza",
                rf: "123456",
                vinculo: "Efetivo",
                cargo_base: "Diretora",
                tipo_vinculo: "efetivo"
            }
        };

        const resultado = montarTrechoSubstituicao(data);

        expect(resultado).toContain("licença médica");
        expect(resultado).toContain("no período de");
    });

    it("retorna texto para férias", () => {
        const data: any = {
            impedimento_substituicao: "4",
            a_partir_de: "2025-03-01",
            designacao_data_final: "2025-03-10",
            dadosTitular: {
                nome_civil: "Maria Souza",
                rf: "123456",
                vinculo: "Efetivo",
                cargo_base: "Diretora",
                tipo_vinculo: "efetivo"
            }
        };

        const resultado = montarTrechoSubstituicao(data);

        expect(resultado).toContain("férias");
    });

});

describe("montarTrechoFinal", () => {

    it("retorna texto para cargo vago", () => {
        const data: any = { tipo_cargo: "vago" };

        const resultado = montarTrechoFinal(data);

        expect(resultado).toBe(
            "portando diploma de Pedagogia e experiência de 3 anos no Magistério."
        );
    });

    it("retorna texto para licença médica", () => {
        const data: any = { impedimento_substituicao: "2" };

        const resultado = montarTrechoFinal(data);

        expect(resultado).toContain("6 anos de experiência");
    });

    it("retorna texto para férias", () => {
        const data: any = { impedimento_substituicao: "4" };

        const resultado = montarTrechoFinal(data);

        expect(resultado).toContain("Auxiliar Técnico de Educação");
    });

    it("retorna texto padrão quando não há regra específica", () => {
        const data: any = {
            tipo_cargo: "titular",
            impedimento_substituicao: "1"
        };

        const resultado = montarTrechoFinal(data);

        expect(resultado).toBe(
            "portando diploma de Pedagogia e experiência de 3 anos no Magistério."
        );
    });

});

describe("montarAutoridade", () => {

    it("retorna Chefe de Gabinete quando impedimento for férias", () => {
        const data: any = { impedimento_substituicao: "4" };

        const resultado = montarAutoridade(data);

        expect(resultado).toContain("Chefe de Gabinete");
    });

    it("retorna Secretário Municipal de Educação no caso padrão", () => {
        const data: any = {};

        const resultado = montarAutoridade(data);

        expect(resultado).toContain("Secretário Municipal de Educação");
    });

});