import { describe, it, expect } from "vitest";
import { montarDadosTextoSeiAnularApostila } from "./montarDadosTextoSei";
import type { DesignacaoResponse } from "@/types/designacao";
import type { formSchemaAnularApostilaTornarSemEfeitoData } from "@/app/pages/anular-apostila/schema";

const designacaoBase = {
    indicado_nome_servidor: "SILVA, JOÃO",
    indicado_rf: "1234567",
    indicado_vinculo: 1,
    indicado_cargo_sobreposto: "DIRETOR DE ESCOLA",
    indicado_categoria: "A",
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
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase);
        expect(result.PORTARIA).toBe("99/2026");
        expect(result.NUMERO_SEI).toBe("SEI-ANULACAO");
    });

    it("descreve o ato apostilado nas variáveis específicas da anulação", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase);
        expect(result.PORTARIA_APOSTILADA).toBe("42/2024");
        expect(result.DOC_APOSTILADO).toBe("10/06/2024");
        expect(result.NUMERO_SEI_APOSTILADO).toBe("SEI-APOSTILADO");
    });

    it("usa numero_portaria quando o ato apostilado não tem o campo portaria", () => {
        const result = montarDadosTextoSeiAnularApostila(
            designacaoBase,
            { numero_portaria: 77, ano_vigente: "2023" },
            anulacaoBase
        );
        expect(result.PORTARIA_APOSTILADA).toBe("77/2023");
    });

    it("leva a DRE e o texto da apostila", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase);
        expect(result.DRE).toBe("DRE BUTANTÃ");
        expect(result.TEXTO_APOSTILA).toBe("É a presente portaria apostilada");
    });

    it("usa os dados do servidor indicado da designação de origem", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase);
        expect(result.NOME_SERVIDOR).toBe("SILVA, JOÃO");
        expect(result.NUMERO_RF).toBe("123.456.7");
        expect(result.VINCULO).toBe("1");
        expect(result.CARGO).toBe("Diretor de Escola");
    });

    it("devolve vazio nos campos sem equivalente no formulário de anulação", () => {
        const result = montarDadosTextoSeiAnularApostila(designacaoBase, atoApostilado, anulacaoBase);
        expect(result.PERIODO).toBe("");
        expect(result.DIPLOMA).toBe("");
        expect(result.TIPO_DE_CARGO).toBe("");
    });

    it("não quebra quando não há designação nem ato apostilado", () => {
        const result = montarDadosTextoSeiAnularApostila(undefined, null, anulacaoBase);
        expect(result.NOME_SERVIDOR).toBe("");
        expect(result.DRE).toBe("");
        expect(result.PORTARIA_APOSTILADA).toBe("");
        expect(result.DOC_APOSTILADO).toBe("");
        expect(result.NUMERO_SEI_APOSTILADO).toBe("");
    });
});
