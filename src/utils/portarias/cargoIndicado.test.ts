import { describe, it, expect } from "vitest";
import type { DesignacaoResponse } from "@/types/designacao";
import {
    CARGO_NAO_CADASTRADO,
    codigosCargosDaDesignacao,
    type DescricoesCargosBase,
    montarCargo,
    montarCargoDaDesignacao,
    montarCargoIndicado,
    montarCargoIndicadoDaDesignacao,
    normalizarCodigoCargo,
} from "./cargoIndicado";

const descricoes: DescricoesCargosBase = {
    "3255": "Professor de Ensino Fundamental II e Médio",
    "3212": "Professor de Educação Infantil",
    "4906": "Auxiliar Técnico de Educação",
    "3379": "Coordenador Pedagógico",
    "3360": "Diretor de Escola",
};

const professorFundII = {
    codigoCargoBase: 3255,
    categoria: "3",
};

describe("normalizarCodigoCargo", () => {
    it.each([
        [3360, "3360"],
        ["3360", "3360"],
        [" 03360 ", "3360"],
    ])("normaliza %j para %j", (codigo, esperado) => {
        expect(normalizarCodigoCargo(codigo)).toBe(esperado);
    });

    it.each([null, undefined, "", "   ", 0, "0"])("trata %j como sem código", (codigo) => {
        expect(normalizarCodigoCargo(codigo)).toBeNull();
    });
});

describe("montarCargo", () => {
    it("usa a descrição cadastrada em maiúsculo", () => {
        expect(montarCargo(3360, descricoes)).toBe("DIRETOR DE ESCOLA");
    });

    it("indica cargo não cadastrado quando a busca não encontrou o código", () => {
        expect(montarCargo(9999, { "9999": null })).toBe(CARGO_NAO_CADASTRADO);
    });

    it("indica cargo não cadastrado quando não há código", () => {
        expect(montarCargo(null, descricoes)).toBe(CARGO_NAO_CADASTRADO);
    });

    it("lança erro quando a descrição do código não foi carregada", () => {
        expect(() => montarCargo(9999, descricoes)).toThrow("A descrição do cargo 9999 não foi carregada.");
    });
});

describe("montarCargoIndicado", () => {
    it("exibe a categoria em maiúsculo logo após o cargo base de professor", () => {
        expect(montarCargoIndicado(professorFundII, descricoes)).toBe(
            "PROFESSOR DE ENSINO FUNDAMENTAL II E MÉDIO - CATEGORIA 3"
        );
        expect(montarCargoIndicado({ ...professorFundII, categoria: "b" }, descricoes)).toBe(
            "PROFESSOR DE ENSINO FUNDAMENTAL II E MÉDIO - CATEGORIA B"
        );
    });

    it("aplica a mesma regra para outros cargos de professor", () => {
        expect(montarCargoIndicado({ codigoCargoBase: 3212, categoria: "3" }, descricoes)).toBe(
            "PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA 3"
        );
    });

    it("aceita o código do cargo como texto", () => {
        expect(montarCargoIndicado({ ...professorFundII, codigoCargoBase: "3255" }, descricoes)).toContain(
            "- CATEGORIA 3"
        );
    });

    it("não exibe a categoria quando o cargo base não é de professor", () => {
        expect(montarCargoIndicado({ codigoCargoBase: 4906, categoria: "3" }, descricoes)).toBe(
            "AUXILIAR TÉCNICO DE EDUCAÇÃO"
        );
    });

    it("não exibe a categoria quando o professor não tem categoria cadastrada", () => {
        expect(montarCargoIndicado({ ...professorFundII, categoria: "  " }, descricoes)).toBe(
            "PROFESSOR DE ENSINO FUNDAMENTAL II E MÉDIO"
        );
    });

    it("usa o cargo sobreposto, sem categoria, quando o indicado possui um", () => {
        const dados = { ...professorFundII, codigoCargoSobreposto: 3379, possuiCargoSobreposto: true };
        expect(montarCargoIndicado(dados, descricoes)).toBe("COORDENADOR PEDAGÓGICO");
    });

    it("trata função/atividade como sem cargo sobreposto", () => {
        const dados = { ...professorFundII, codigoCargoSobreposto: 3379, possuiCargoSobreposto: false };
        expect(montarCargoIndicado(dados, descricoes)).toBe(
            "PROFESSOR DE ENSINO FUNDAMENTAL II E MÉDIO - CATEGORIA 3"
        );
    });

    it("usa o cargo base quando o sobreposto não tem código", () => {
        const dados = { ...professorFundII, codigoCargoSobreposto: null, possuiCargoSobreposto: true };
        expect(montarCargoIndicado(dados, descricoes)).toBe(
            "PROFESSOR DE ENSINO FUNDAMENTAL II E MÉDIO - CATEGORIA 3"
        );
    });

    it("indica cargo não cadastrado, sem categoria", () => {
        expect(montarCargoIndicado(professorFundII, { "3255": null })).toBe(CARGO_NAO_CADASTRADO);
    });

    it("indica cargo não cadastrado sem dados do cargo", () => {
        expect(montarCargoIndicado({}, descricoes)).toBe(CARGO_NAO_CADASTRADO);
    });
});

describe("portarias que partem de uma designação", () => {
    const designacao = {
        cargo_vaga: 3360,
        titular_codigo_cargo_base: 3379,
        indicado_codigo_cargo_base: 3212,
        indicado_codigo_cargo_sobreposto: 3379,
        indicado_possui_cargo_sobreposto: false,
        indicado_categoria: "3",
    } as unknown as DesignacaoResponse;

    it("usa o cargo da vaga em CARGO", () => {
        expect(montarCargoDaDesignacao(designacao, descricoes)).toBe("DIRETOR DE ESCOLA");
    });

    it.each([null, undefined, 0])(
        "usa titular_codigo_cargo_base quando cargo_vaga é %j",
        (cargo_vaga) => {
            const antiga = { ...designacao, cargo_vaga } as unknown as DesignacaoResponse;
            expect(montarCargoDaDesignacao(antiga, descricoes)).toBe("COORDENADOR PEDAGÓGICO");
            expect(codigosCargosDaDesignacao(antiga)[0]).toBe(3379);
        }
    );

    it("monta CARGO_INDICADO com os dados do indicado gravados na designação", () => {
        expect(montarCargoIndicadoDaDesignacao(designacao, descricoes)).toBe(
            "PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA 3"
        );
        const comSobreposto = { ...designacao, indicado_possui_cargo_sobreposto: true } as DesignacaoResponse;
        expect(montarCargoIndicadoDaDesignacao(comSobreposto, descricoes)).toBe("COORDENADOR PEDAGÓGICO");
    });

    it("lista os códigos do cargo da vaga e do cargo exibido do indicado", () => {
        expect(codigosCargosDaDesignacao(designacao)).toEqual(["3360", 3212]);
    });

    it("não quebra sem designação", () => {
        expect(codigosCargosDaDesignacao(undefined)).toEqual([undefined, undefined]);
        expect(montarCargoDaDesignacao(undefined, {})).toBe(CARGO_NAO_CADASTRADO);
        expect(montarCargoIndicadoDaDesignacao(undefined, {})).toBe(CARGO_NAO_CADASTRADO);
    });
});
