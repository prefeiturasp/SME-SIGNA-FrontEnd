import { describe, it, expect } from "vitest";
import { montarDadosTextoSeiInsubsistencia } from "./montarDadosTextoSei";
import type { DesignacaoResponse } from "@/types/designacao";
import { CARGO_NAO_CADASTRADO, type DescricoesCargosBase } from "@/utils/portarias/cargoIndicado";
import type { formSchemaInsubsistenciaData } from "@/app/pages/insubsistencia/schema";

const descricoesCargos: DescricoesCargosBase = {
    "3379": "Coordenador Pedagógico",
    "3212": "Professor de Educação Infantil",
    "3360": "Diretor de Escola",
    "3085": "Assistente de Diretor de Escola",
};

const designacaoBase = {
    indicado_nome_servidor: "SILVA, JOÃO",
    indicado_rf: "1234567",
    indicado_vinculo: 1,
    indicado_cargo_base: "PROFESSOR DE EDUCACAO INFANTIL",
    indicado_codigo_cargo_base: 3212,
    indicado_cargo_sobreposto: "",
    indicado_possui_cargo_sobreposto: false,
    indicado_categoria: "3",
    cargo_vaga: 3379,
    cargo_vaga_display: "COORDENADOR PEDAGOGICO",
    indicado_lotacao: "EMEF TESTE",
    unidade_proponente: "EMEF PROPONENTE",
    data_inicio: "2024-01-15",
    data_fim: null,
} as unknown as DesignacaoResponse;

const insubsistenciaBase: formSchemaInsubsistenciaData["insubsistencia"] = {
    numero_portaria: "100",
    ano: "2024",
    numero_sei: "SEI-INSUB",
    doc: "",
    observacoes: "",
    tipo_insubsistencia: "designacao",
};

describe("montarDadosTextoSeiInsubsistencia", () => {
    it("monta PORTARIA a partir dos dados da própria insubsistência", () => {
        const result = montarDadosTextoSeiInsubsistencia(designacaoBase, insubsistenciaBase, descricoesCargos);
        expect(result.PORTARIA).toBe("100/2024");
    });

    it("usa o nome do servidor indicado da designação de origem", () => {
        const result = montarDadosTextoSeiInsubsistencia(designacaoBase, insubsistenciaBase, descricoesCargos);
        expect(result.NOME_SERVIDOR).toBe("SILVA, JOÃO");
    });

    it("usa 'por tempo indeterminado' quando não há data_fim", () => {
        const result = montarDadosTextoSeiInsubsistencia(designacaoBase, insubsistenciaBase, descricoesCargos);
        expect(result.PERIODO).toBe("por tempo indeterminado");
    });

    it("monta período fechado quando há data_fim", () => {
        const result = montarDadosTextoSeiInsubsistencia(
            { ...designacaoBase, data_fim: "2024-12-31" } as unknown as DesignacaoResponse,
            insubsistenciaBase,
            descricoesCargos
        );
        expect(result.PERIODO).toBe("15/01/2024 a 31/12/2024");
    });

    it("não quebra quando designacao é undefined", () => {
        const result = montarDadosTextoSeiInsubsistencia(undefined, insubsistenciaBase, descricoesCargos);
        expect(result.NOME_SERVIDOR).toBe("");
        expect(result.NUMERO_RF).toBe("");
        expect(result.PERIODO).toBe("por tempo indeterminado");
    });

    describe("cargos em Gestão de cargos base", () => {
        const montar = (designacao: DesignacaoResponse, desc: DescricoesCargosBase = descricoesCargos) =>
            montarDadosTextoSeiInsubsistencia(designacao, insubsistenciaBase, desc);
        const com = (campos: Record<string, unknown>) =>
            ({ ...designacaoBase, ...campos }) as unknown as DesignacaoResponse;

        it("usa a descrição cadastrada do cargo da vaga, em maiúsculo, em CARGO e CARGO_DESIGNACAO", () => {
            const result = montar(designacaoBase);
            expect(result.CARGO).toBe("COORDENADOR PEDAGÓGICO");
            expect(result.CARGO_DESIGNACAO).toBe("COORDENADOR PEDAGÓGICO");
        });

        it("usa titular_codigo_cargo_base em CARGO quando a designação antiga não tem cargo_vaga", () => {
            expect(montar(com({ cargo_vaga: null, titular_codigo_cargo_base: 3360 })).CARGO).toBe("DIRETOR DE ESCOLA");
        });

        it("indica cargo não cadastrado em CARGO e CARGO_INDICADO, sem categoria", () => {
            const result = montar(designacaoBase, { "3379": null, "3212": null });
            expect(result.CARGO).toBe(CARGO_NAO_CADASTRADO);
            expect(result.CARGO_DESIGNACAO).toBe(CARGO_NAO_CADASTRADO);
            expect(result.CARGO_INDICADO).toBe(CARGO_NAO_CADASTRADO);
        });

        it("monta CARGO_INDICADO com a categoria em maiúsculo após o cargo base de professor", () => {
            expect(montar(designacaoBase).CARGO_INDICADO).toBe("PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA 3");
            expect(montar(com({ indicado_categoria: "a" })).CARGO_INDICADO).toBe(
                "PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA A"
            );
        });

        it("não exibe categoria quando o cargo base do indicado não é de professor", () => {
            expect(montar(com({ indicado_codigo_cargo_base: 3360 })).CARGO_INDICADO).toBe("DIRETOR DE ESCOLA");
        });

        it("monta CARGO_INDICADO com o sobreposto gravado na designação, sem categoria", () => {
            const designacao = com({ indicado_codigo_cargo_sobreposto: 3085, indicado_possui_cargo_sobreposto: true });
            expect(montar(designacao).CARGO_INDICADO).toBe("ASSISTENTE DE DIRETOR DE ESCOLA");
        });

        it("não trata função/atividade como sobreposto em CARGO_INDICADO", () => {
            const designacao = com({ indicado_codigo_cargo_sobreposto: 3085, indicado_possui_cargo_sobreposto: false });
            expect(montar(designacao).CARGO_INDICADO).toBe("PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA 3");
        });
    });
});
