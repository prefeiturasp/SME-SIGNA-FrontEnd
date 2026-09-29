import { describe, it, expect } from "vitest";
import { montarDadosTextoSeiDesignacao } from "./montarDadosTextoSei";
import type { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";

const servidorIndicado = {
    nome_civil: "",
    nome_servidor: "SILVA, JOÃO",
    rf: "1234567",
    vinculo: 1,
    cargo_base: "PROFESSOR",
    cargo_sobreposto_funcao_atividade: "DIRETOR DE ESCOLA",
    lotacao: "EMEF TESTE",
    categoria: "A",
};

const formBase = {
    servidorIndicado,
    portaria_designacao: "42",
    ano: "2024",
    numero_sei: "SEI-001",
    ue_nome: "EMEF PROPONENTE",
    tipo_cargo: "vago",
    a_partir_de: new Date("2024-01-15T00:00:00"),
} as unknown as FormDesignacaoEServidorIndicado;

describe("montarDadosTextoSeiDesignacao", () => {
    it("monta PORTARIA combinando número e ano", () => {
        const result = montarDadosTextoSeiDesignacao(formBase);
        expect(result.PORTARIA).toBe("42/2024");
    });

    it("usa nome_servidor quando nome_civil está vazio, em maiúsculas", () => {
        const result = montarDadosTextoSeiDesignacao(formBase);
        expect(result.NOME_SERVIDOR).toBe("SILVA, JOÃO");
    });

    it("prioriza nome_civil quando preenchido", () => {
        const result = montarDadosTextoSeiDesignacao({
            ...formBase,
            servidorIndicado: { ...servidorIndicado, nome_civil: "joão da silva" } as FormDesignacaoEServidorIndicado["servidorIndicado"],
        });
        expect(result.NOME_SERVIDOR).toBe("JOÃO DA SILVA");
    });

    it("formata o RF do indicado", () => {
        const result = montarDadosTextoSeiDesignacao(formBase);
        expect(result.NUMERO_RF).toBe("123.456.7");
    });

    it("usa o cargo vago selecionado quando tipo_cargo é vago", () => {
        const result = montarDadosTextoSeiDesignacao({
            ...formBase,
            cargo_vago_selecionado: { id: 1, label: "DIRETOR DE ESCOLA" },
        });
        expect(result.CARGO).toBe("Diretor de Escola");
    });

    it("usa cargo do titular quando tipo_cargo é disponível", () => {
        const result = montarDadosTextoSeiDesignacao({
            ...formBase,
            tipo_cargo: "disponivel",
            dadosTitular: { cargo_base: "COORDENADOR PEDAGÓGICO" } as FormDesignacaoEServidorIndicado["dadosTitular"],
        });
        expect(result.CARGO).toBe("Coordenador Pedagógico");
    });

    it("monta período com data final quando presente", () => {
        const result = montarDadosTextoSeiDesignacao({
            ...formBase,
            designacao_data_final: new Date("2024-12-31T00:00:00"),
        });
        expect(result.PERIODO).toContain("a");
        expect(result.PERIODO).not.toBe("por tempo indeterminado");
    });

    it("usa 'por tempo indeterminado' quando não há data final", () => {
        const result = montarDadosTextoSeiDesignacao(formBase);
        expect(result.PERIODO).toBe("por tempo indeterminado");
    });

    it("retorna string vazia para campos sem dado disponível hoje (DIPLOMA)", () => {
        const result = montarDadosTextoSeiDesignacao(formBase);
        expect(result.DIPLOMA).toBe("");
    });

    it("não quebra quando servidorIndicado está ausente", () => {
        const result = montarDadosTextoSeiDesignacao({
            portaria_designacao: "42",
            ano: "2024",
        });
        expect(result.NOME_SERVIDOR).toBe("");
        expect(result.NUMERO_RF).toBe("");
    });
});
