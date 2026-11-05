import { describe, it, expect } from "vitest";
import { montarCargoIndicado } from "./cargoIndicado";

const professorFundII = {
    cargoBase: "PROFESSOR DE ENSINO FUNDAMENTAL II E MEDIO",
    codigoCargoBase: 3255,
    categoria: "3",
};

describe("montarCargoIndicado", () => {
    it("exibe a categoria logo após o cargo base de professor", () => {
        expect(montarCargoIndicado(professorFundII)).toBe(
            "Professor de Ensino Fundamental Ii e Medio - Categoria 3"
        );
    });

    it("aplica a mesma regra para outros cargos de professor", () => {
        const result = montarCargoIndicado({
            cargoBase: "PROFESSOR DE EDUCACAO INFANTIL E ENSINO FUNDAMENTAL I",
            codigoCargoBase: 3212,
            categoria: "3",
        });
        expect(result).toBe("Professor de Educacao Infantil e Ensino Fundamental I - Categoria 3");
    });

    it("aceita o código do cargo como texto", () => {
        const result = montarCargoIndicado({ ...professorFundII, codigoCargoBase: "3255" });
        expect(result).toContain("- Categoria 3");
    });

    it("não exibe a categoria quando o cargo base não é de professor", () => {
        const result = montarCargoIndicado({
            cargoBase: "AUXILIAR TECNICO DE EDUCACAO",
            codigoCargoBase: 4906,
            categoria: "3",
        });
        expect(result).toBe("Auxiliar Tecnico de Educacao");
    });

    it("não exibe a categoria quando o professor não tem categoria cadastrada", () => {
        expect(montarCargoIndicado({ ...professorFundII, categoria: "" })).toBe(
            "Professor de Ensino Fundamental Ii e Medio"
        );
    });

    it("usa o cargo sobreposto, sem categoria, quando o indicado possui um", () => {
        const result = montarCargoIndicado({
            ...professorFundII,
            cargoSobreposto: "COORDENADOR PEDAGOGICO",
            possuiCargoSobreposto: true,
        });
        expect(result).toBe("Coordenador Pedagogico");
    });

    it("trata função/atividade como sem cargo sobreposto", () => {
        const result = montarCargoIndicado({
            ...professorFundII,
            cargoSobreposto: "PROFESSOR ORIENTADOR DE INFORMATICA EDUCATIVA",
            possuiCargoSobreposto: false,
        });
        expect(result).toBe("Professor de Ensino Fundamental Ii e Medio - Categoria 3");
    });

    it("usa o cargo base quando o sobreposto está vazio", () => {
        const result = montarCargoIndicado({
            ...professorFundII,
            cargoSobreposto: "",
            possuiCargoSobreposto: true,
        });
        expect(result).toBe("Professor de Ensino Fundamental Ii e Medio - Categoria 3");
    });

    it("retorna vazio sem dados do cargo", () => {
        expect(montarCargoIndicado({})).toBe("");
    });
});
