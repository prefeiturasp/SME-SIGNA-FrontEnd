import { describe, it, expect } from "vitest";
import { montarDadosTextoSeiCessacao } from "./montarDadosTextoSei";
import type { DesignacaoResponse } from "@/types/designacao";
import type { formSchemaCessacaoData } from "@/app/pages/cessacao/schema";
import { EnumCheckbox } from "@/components/ui/FieldsForm";

const designacaoBase = {
    indicado_nome_servidor: "SILVA, JOÃO",
    indicado_rf: "1234567",
    indicado_vinculo: 1,
    indicado_cargo_sobreposto: "DIRETOR DE ESCOLA",
    indicado_categoria: "A",
    indicado_lotacao: "EMEF TESTE",
    unidade_proponente: "EMEF PROPONENTE",
} as unknown as DesignacaoResponse;

const cessacaoBase: formSchemaCessacaoData["cessacao"] = {
    numero_portaria: "42",
    ano: "2024",
    numero_sei: "SEI-CESSACAO",
    a_pedido: EnumCheckbox.NAO,
    data_inicio: new Date("2024-06-10T00:00:00"),
    remocao: EnumCheckbox.NAO,
    aposentadoria: EnumCheckbox.NAO,
};

describe("montarDadosTextoSeiCessacao", () => {
    it("monta PORTARIA a partir dos dados da própria cessação", () => {
        const result = montarDadosTextoSeiCessacao(designacaoBase, cessacaoBase);
        expect(result.PORTARIA).toBe("42/2024");
    });

    it("usa o nome do servidor indicado da designação de origem", () => {
        const result = montarDadosTextoSeiCessacao(designacaoBase, cessacaoBase);
        expect(result.NOME_SERVIDOR).toBe("SILVA, JOÃO");
    });

    it("formata o RF do indicado", () => {
        const result = montarDadosTextoSeiCessacao(designacaoBase, cessacaoBase);
        expect(result.NUMERO_RF).toBe("123.456.7");
    });

    it("usa a data de início da própria cessação em DATA_INICIAL", () => {
        const result = montarDadosTextoSeiCessacao(designacaoBase, cessacaoBase);
        expect(result.DATA_INICIAL).toBe("10/06/2024");
    });

    it("não quebra quando designacao é undefined", () => {
        const result = montarDadosTextoSeiCessacao(undefined, cessacaoBase);
        expect(result.NOME_SERVIDOR).toBe("");
        expect(result.NUMERO_RF).toBe("");
    });
});
