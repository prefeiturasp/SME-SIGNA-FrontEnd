import { describe, it, expect } from "vitest";
import { montarDadosTextoSeiAnularApostila } from "./montarDadosTextoSei";
import type { DesignacaoResponse } from "@/types/designacao";
import { CARGO_NAO_CADASTRADO, type DescricoesCargosBase } from "@/utils/portarias/cargoIndicado";
import type { formSchemaAnularApostilaTornarSemEfeitoData } from "@/app/pages/anular-apostila/schema";

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
    dre_nome: "DRE BUTANTÃ",
} as unknown as DesignacaoResponse;

const atoApostilado = {
    portaria: "42",
    ano_vigente: "2024",
    doc: "2024-06-10",
    sei_numero: "SEI-APOSTILADO",
};

const anulacaoBase: formSchemaAnularApostilaTornarSemEfeitoData["apostila_insubsistencia"] = {
    portaria: "99",
    ano: "2026",
    numero_sei: "SEI-ANULACAO",
    doc: new Date("2026-03-02T00:00:00"),
    observacao: "obs",
    texto_para_apostila: "É a presente portaria apostilada",
};

describe("montarDadosTextoSeiAnularApostila", () => {
    it("monta PORTARIA a partir dos dados da própria anulação", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase, descricoesCargos);
        expect(result.PORTARIA).toBe("99/2026");
        expect(result.NUMERO_SEI).toBe("SEI-ANULACAO");
    });

    it("descreve o ato apostilado nas variáveis específicas da anulação", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase, descricoesCargos);
        expect(result.PORTARIA_APOSTILADA).toBe("42/2024");
        expect(result.DOC_APOSTILADO).toBe("10/06/2024");
        expect(result.NUMERO_SEI_APOSTILADO).toBe("SEI-APOSTILADO");
    });

    it("usa numero_portaria quando o ato apostilado não tem o campo portaria", () => {
        const result = montarDadosTextoSeiAnularApostila(
            designacaoBase,
            { numero_portaria: 77, ano_vigente: "2023" },
            anulacaoBase,
            descricoesCargos
        );
        expect(result.PORTARIA_APOSTILADA).toBe("77/2023");
    });

    it("leva a DRE e o texto da apostila", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase, descricoesCargos);
        expect(result.DRE).toBe("DRE BUTANTÃ");
        expect(result.TEXTO_APOSTILA).toBe("É a presente portaria apostilada");
    });

    it("usa os dados do servidor indicado da designação de origem", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase, descricoesCargos);
        expect(result.NOME_SERVIDOR).toBe("SILVA, JOÃO");
        expect(result.NUMERO_RF).toBe("123.456.7");
        expect(result.VINCULO).toBe("1");
    });

    it("devolve vazio nos campos sem equivalente no formulário de anulação", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase, descricoesCargos);
        expect(result.PERIODO).toBe("");
        expect(result.DIPLOMA).toBe("");
        expect(result.TIPO_DE_CARGO).toBe("");
    });

    it("não quebra quando não há designação nem ato apostilado", () => {
        const result = montarDadosTextoSeiAnularApostila(undefined, null, anulacaoBase, descricoesCargos);
        expect(result.NOME_SERVIDOR).toBe("");
        expect(result.DRE).toBe("");
        expect(result.PORTARIA_APOSTILADA).toBe("");
        expect(result.DOC_APOSTILADO).toBe("");
        expect(result.NUMERO_SEI_APOSTILADO).toBe("");
    });

    describe("cargos em Gestão de cargos base", () => {
        const montar = (designacao: DesignacaoResponse, desc: DescricoesCargosBase = descricoesCargos) =>
            montarDadosTextoSeiAnularApostila(designacao, atoApostilado, anulacaoBase, desc);
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
