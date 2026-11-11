import { describe, it, expect } from "vitest";
import { codigosCargosTextoSeiDesignacao, montarDadosTextoSeiDesignacao } from "./montarDadosTextoSei";
import type { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";
import { CARGO_NAO_CADASTRADO, type DescricoesCargosBase } from "@/utils/portarias/cargoIndicado";

type Indicado = FormDesignacaoEServidorIndicado["servidorIndicado"];
type Titular = FormDesignacaoEServidorIndicado["dadosTitular"];

const descricoes: DescricoesCargosBase = {
    "3212": "Professor de Educação Infantil",
    "3360": "Diretor de Escola",
    "3379": "Coordenador Pedagógico",
    "3085": "Assistente de Diretor de Escola",
};

const servidorIndicado = {
    nome_civil: "",
    nome_servidor: "SILVA, JOÃO",
    rf: "1234567",
    vinculo: 1,
    cargo_base: "PROFESSOR",
    cd_cargo_base: 3212,
    cargo_sobreposto_funcao_atividade: "DIRETOR DE ESCOLA",
    cd_cargo_sobreposto_funcao_atividade: 3360,
    possui_cargo_sobreposto: false,
    lotacao: "EMEF TESTE",
    categoria: "3",
} as unknown as Indicado;

const formBase = {
    servidorIndicado,
    portaria_designacao: "42",
    ano: "2024",
    numero_sei: "SEI-001",
    ue_nome: "EMEF PROPONENTE",
    tipo_cargo: "vago",
    cargo_vago_selecionado: { id: 3379, label: "Coordenador (label da tela)" },
    a_partir_de: new Date("2024-01-15T00:00:00"),
} as unknown as FormDesignacaoEServidorIndicado;

function montar(form: FormDesignacaoEServidorIndicado, desc: DescricoesCargosBase = descricoes) {
    return montarDadosTextoSeiDesignacao(form, desc);
}

function comIndicado(indicado: Partial<NonNullable<Indicado>>): FormDesignacaoEServidorIndicado {
    return { ...formBase, servidorIndicado: { ...servidorIndicado, ...indicado } as Indicado };
}

function disponivelComTitular(titular: Partial<NonNullable<Titular>>): FormDesignacaoEServidorIndicado {
    return { ...formBase, tipo_cargo: "disponivel", cargo_vago_selecionado: null, dadosTitular: titular as Titular };
}

describe("montarDadosTextoSeiDesignacao", () => {
    it("monta PORTARIA combinando número e ano", () => {
        expect(montar(formBase).PORTARIA).toBe("42/2024");
    });

    it("usa nome_servidor quando nome_civil está vazio, em maiúsculas", () => {
        expect(montar(formBase).NOME_SERVIDOR).toBe("SILVA, JOÃO");
    });

    it("prioriza nome_civil quando preenchido", () => {
        expect(montar(comIndicado({ nome_civil: "joão da silva" })).NOME_SERVIDOR).toBe("JOÃO DA SILVA");
    });

    it("formata o RF do indicado", () => {
        expect(montar(formBase).NUMERO_RF).toBe("123.456.7");
    });

    describe("CARGO e CARGO_DESIGNACAO", () => {
        it("usam a descrição cadastrada do cargo vago selecionado, em maiúsculo, e não o label da tela", () => {
            const result = montar(formBase);
            expect(result.CARGO).toBe("COORDENADOR PEDAGÓGICO");
            expect(result.CARGO_DESIGNACAO).toBe("COORDENADOR PEDAGÓGICO");
        });

        it("usam o cargo base do titular no cargo disponível quando ele não tem sobreposto", () => {
            const result = montar(
                disponivelComTitular({
                    cd_cargo_base: 3360,
                    possui_cargo_sobreposto: false,
                    cd_cargo_sobreposto_funcao_atividade: 3085,
                })
            );
            expect(result.CARGO).toBe("DIRETOR DE ESCOLA");
            expect(result.CARGO_DESIGNACAO).toBe("DIRETOR DE ESCOLA");
        });

        it("usam o cargo sobreposto do titular no cargo disponível quando ele tem um", () => {
            const result = montar(
                disponivelComTitular({
                    cd_cargo_base: 3212,
                    possui_cargo_sobreposto: true,
                    cd_cargo_sobreposto_funcao_atividade: 3360,
                })
            );
            expect(result.CARGO).toBe("DIRETOR DE ESCOLA");
        });

        it("indicam cargo não cadastrado quando o código não está em Gestão", () => {
            const result = montar(
                { ...formBase, cargo_vago_selecionado: { id: 9999, label: "Cargo X" } },
                { ...descricoes, "9999": null }
            );
            expect(result.CARGO).toBe(CARGO_NAO_CADASTRADO);
            expect(result.CARGO_DESIGNACAO).toBe(CARGO_NAO_CADASTRADO);
        });
    });

    describe("CARGO_INDICADO", () => {
        it("traz a categoria em maiúsculo após o cargo base de professor", () => {
            expect(montar(formBase).CARGO_INDICADO).toBe("PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA 3");
            expect(montar(comIndicado({ categoria: "a" })).CARGO_INDICADO).toBe(
                "PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA A"
            );
        });

        it("usa o cargo sobreposto, sem categoria, quando o indicado possui um", () => {
            expect(montar(comIndicado({ possui_cargo_sobreposto: true })).CARGO_INDICADO).toBe("DIRETOR DE ESCOLA");
        });

        it("não trata função/atividade como sobreposto", () => {
            expect(montar(comIndicado({ possui_cargo_sobreposto: false })).CARGO_INDICADO).toBe(
                "PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA 3"
            );
        });

        it("indica cargo não cadastrado, sem categoria", () => {
            expect(montar(formBase, { ...descricoes, "3212": null }).CARGO_INDICADO).toBe(CARGO_NAO_CADASTRADO);
        });
    });

    it("não gera o texto quando a descrição de um cargo não foi carregada", () => {
        expect(() => montar(formBase, { "3212": "Professor" })).toThrow("3379");
    });

    it("monta período com data final quando presente", () => {
        const result = montar({ ...formBase, designacao_data_final: new Date("2024-12-31T00:00:00") });
        expect(result.PERIODO).toContain("a");
        expect(result.PERIODO).not.toBe("por tempo indeterminado");
    });

    it("usa 'por tempo indeterminado' quando não há data final", () => {
        expect(montar(formBase).PERIODO).toBe("por tempo indeterminado");
    });

    it("retorna string vazia para campos sem dado disponível hoje (DIPLOMA)", () => {
        expect(montar(formBase).DIPLOMA).toBe("");
    });

    it("não quebra quando servidorIndicado está ausente", () => {
        const result = montar({ portaria_designacao: "42", ano: "2024" });
        expect(result.NOME_SERVIDOR).toBe("");
        expect(result.NUMERO_RF).toBe("");
        expect(result.CARGO_INDICADO).toBe(CARGO_NAO_CADASTRADO);
    });
});

describe("codigosCargosTextoSeiDesignacao", () => {
    it("lista o cargo vago selecionado e o cargo exibido do indicado", () => {
        expect(codigosCargosTextoSeiDesignacao(formBase)).toEqual([3379, 3212]);
    });

    it("lista o sobreposto do titular e do indicado quando eles têm um", () => {
        const form = {
            ...disponivelComTitular({
                cd_cargo_base: 3212,
                possui_cargo_sobreposto: true,
                cd_cargo_sobreposto_funcao_atividade: 3379,
            }),
            servidorIndicado: { ...servidorIndicado, possui_cargo_sobreposto: true } as Indicado,
        };
        expect(codigosCargosTextoSeiDesignacao(form)).toEqual([3379, 3360]);
    });
});
