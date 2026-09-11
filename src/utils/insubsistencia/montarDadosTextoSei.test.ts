import { describe, it, expect } from "vitest";
import { montarDadosTextoSeiInsubsistencia } from "./montarDadosTextoSei";
import type { DesignacaoResponse } from "@/types/designacao";
import type { formSchemaInsubsistenciaData } from "@/app/pages/insubsistencia/schema";

const designacaoBase = {
    indicado_nome_servidor: "SILVA, JOÃO",
    indicado_rf: "1234567",
    indicado_vinculo: 1,
    indicado_cargo_sobreposto: "DIRETOR DE ESCOLA",
    indicado_categoria: "A",
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
        const result = montarDadosTextoSeiInsubsistencia(designacaoBase, insubsistenciaBase);
        expect(result.PORTARIA).toBe("100/2024");
    });

    it("usa o nome do servidor indicado da designação de origem", () => {
        const result = montarDadosTextoSeiInsubsistencia(designacaoBase, insubsistenciaBase);
        expect(result.NOME_SERVIDOR).toBe("SILVA, JOÃO");
    });

    it("usa 'por tempo indeterminado' quando não há data_fim", () => {
        const result = montarDadosTextoSeiInsubsistencia(designacaoBase, insubsistenciaBase);
        expect(result.PERIODO).toBe("por tempo indeterminado");
    });

    it("monta período fechado quando há data_fim", () => {
        const result = montarDadosTextoSeiInsubsistencia(
            { ...designacaoBase, data_fim: "2024-12-31" } as unknown as DesignacaoResponse,
            insubsistenciaBase
        );
        expect(result.PERIODO).toBe("15/01/2024 a 31/12/2024");
    });

    it("não quebra quando designacao é undefined", () => {
        const result = montarDadosTextoSeiInsubsistencia(undefined, insubsistenciaBase);
        expect(result.NOME_SERVIDOR).toBe("");
        expect(result.NUMERO_RF).toBe("");
        expect(result.PERIODO).toBe("por tempo indeterminado");
    });
});
