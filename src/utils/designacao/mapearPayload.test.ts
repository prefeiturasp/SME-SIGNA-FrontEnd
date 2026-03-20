import { describe, it, expect } from "vitest";
import { mapearPayloadDesignacao } from "./mapearPayload";

// ── Helpers ──────────────────────────────────────

const servidorIndicado = {
    nome_civil: "João Silva",
    nome_servidor: "SILVA, JOÃO",
    rf: "123456",
    vinculo: "Efetivo",
    cargo_base: "Professor",
    lotacao: "EMEF Teste",
    cargo_sobreposto_funcao_atividade: "Diretor",
    local_de_exercicio: "Escola A",
    local_de_servico: "DRE Centro",
};

const dadosTitular = {
    nome_civil: "Maria Souza",
    nome_servidor: "SOUZA, MARIA",
    rf: "654321",
    vinculo: "Efetivo",
    cargo_base: "Coordenador",
    lotacao: "EMEF Outra",
    cargo_sobreposto_funcao_atividade: "Vice-Diretor",
    local_de_exercicio: "Escola B",
    local_de_servico: "DRE Sul",
};

const formBase = {
    dre_nome: "DRE Centro",
    ue_nome: "EMEF Teste",
    codigo_hierarquico: "001",
    servidorIndicado,
    portaria_designacao: "42",
    ano: "2024",
    numero_sei: "SEI-001",
    doc: "DOC-001",
    a_partir_de: "2024-01-15T00:00:00",
    designacao_data_final: "2024-12-31T00:00:00",
    carater_especial: "sim",
    com_afastamento: "nao",
    motivo_afastamento: null,
    com_pendencia: "nao",
    motivo_pendencia: null,
    tipo_cargo: "substituto",
    cargo_vago_selecionado: null,
    cargo_vaga: "10",
};

// ── Testes ───────────────────────────────────────

describe("mapearPayloadDesignacao", () => {
    it("retorna null se form for null ou undefined", () => {
        expect(mapearPayloadDesignacao(null)).toBeNull();
        expect(mapearPayloadDesignacao(undefined)).toBeNull();
    });

    it("mapeia os campos do indicado corretamente", () => {
        const result = mapearPayloadDesignacao({ ...formBase });

        expect(result?.indicado_nome_civil).toBe("João Silva");
        expect(result?.indicado_nome_servidor).toBe("SILVA, JOÃO");
        expect(result?.indicado_rf).toBe("123456");
        expect(result?.indicado_vinculo).toBe("Efetivo");
        expect(result?.indicado_cargo_base).toBe("Professor");
        expect(result?.indicado_lotacao).toBe("EMEF Teste");
        expect(result?.indicado_cargo_sobreposto).toBe("Diretor");
        expect(result?.indicado_local_exercicio).toBe("Escola A");
        expect(result?.indicado_local_servico).toBe("DRE Centro");
    });

    it("mapeia os campos gerais do form corretamente", () => {
        const result = mapearPayloadDesignacao({ ...formBase });

        expect(result?.dre_nome).toBe("DRE Centro");
        expect(result?.unidade_proponente).toBe("EMEF Teste");
        expect(result?.codigo_hierarquico).toBe("001");
        expect(result?.numero_portaria).toBe("42");
        expect(result?.ano_vigente).toBe("2024");
        expect(result?.sei_numero).toBe("SEI-001");
        expect(result?.doc).toBe("DOC-001");
    });

    it("inclui campos do titular quando dadosTitular está presente", () => {
        const result = mapearPayloadDesignacao({ ...formBase, dadosTitular });

        expect(result?.titular_nome_civil).toBe("Maria Souza");
        expect(result?.titular_nome_servidor).toBe("SOUZA, MARIA");
        expect(result?.titular_rf).toBe("654321");
        expect(result?.titular_vinculo).toBe("Efetivo");
        expect(result?.titular_cargo_base).toBe("Coordenador");
        expect(result?.titular_lotacao).toBe("EMEF Outra");
        expect(result?.titular_cargo_sobreposto).toBe("Vice-Diretor");
        expect(result?.titular_local_exercicio).toBe("Escola B");
        expect(result?.titular_local_servico).toBe("DRE Sul");
    });

    it("omite campos do titular quando dadosTitular é null/undefined", () => {
        const result = mapearPayloadDesignacao({ ...formBase, dadosTitular: null });

        expect(result).not.toHaveProperty("titular_nome_civil");
        expect(result).not.toHaveProperty("titular_rf");
        expect(result).not.toHaveProperty("titular_lotacao");
    });

    it("formata data_inicio e data_fim a partir de string ISO", () => {
        const result = mapearPayloadDesignacao({ ...formBase });

        expect(result?.data_inicio).toBe("2024-01-15");
        expect(result?.data_fim).toBe("2024-12-31");
    });

    it("formata data a partir de objeto Date", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            a_partir_de: new Date("2024-03-10T00:00:00Z"),
            designacao_data_final: new Date("2024-11-20T00:00:00Z"),
        });

        expect(result?.data_inicio).toBe("2024-03-10");
        expect(result?.data_fim).toBe("2024-11-20");
    });

    it("formata data a partir de objeto com método .format() (dayjs/moment)", () => {
        const mockDayjs = { format: (fmt: string) => "2024-06-01" };

        const result = mapearPayloadDesignacao({
            ...formBase,
            a_partir_de: mockDayjs,
            designacao_data_final: mockDayjs,
        });

        expect(result?.data_inicio).toBe("2024-06-01");
        expect(result?.data_fim).toBe("2024-06-01");
    });

    it("retorna null para datas quando valor é null/undefined", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            a_partir_de: null,
            designacao_data_final: undefined,
        });

        expect(result?.data_inicio).toBeNull();
        expect(result?.data_fim).toBeNull();
    });

    it("mapeia carater_excepcional como boolean", () => {
        const comCarater = mapearPayloadDesignacao({ ...formBase, carater_especial: "sim" });
        const semCarater = mapearPayloadDesignacao({ ...formBase, carater_especial: "nao" });

        expect(comCarater?.carater_excepcional).toBe(true);
        expect(semCarater?.carater_excepcional).toBe(false);
    });

    it("mapeia com_afastamento como boolean", () => {
        const com = mapearPayloadDesignacao({ ...formBase, com_afastamento: "sim" });
        const sem = mapearPayloadDesignacao({ ...formBase, com_afastamento: "nao" });

        expect(com?.com_afastamento).toBe(true);
        expect(sem?.com_afastamento).toBe(false);
    });

    it("mapeia possui_pendencia como boolean", () => {
        const com = mapearPayloadDesignacao({ ...formBase, com_pendencia: "sim" });
        const sem = mapearPayloadDesignacao({ ...formBase, com_pendencia: "nao" });

        expect(com?.possui_pendencia).toBe(true);
        expect(sem?.possui_pendencia).toBe(false);
    });

    it("usa motivo_afastamento e pendencias quando presentes", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            motivo_afastamento: "Férias",
            motivo_pendencia: "Processo pendente",
        });

        expect(result?.motivo_afastamento).toBe("Férias");
        expect(result?.pendencias).toBe("Processo pendente");
    });

    it("retorna null para motivo_afastamento e pendencias quando ausentes", () => {
        const result = mapearPayloadDesignacao({ ...formBase });

        expect(result?.motivo_afastamento).toBeNull();
        expect(result?.pendencias).toBeNull();
    });

    it("converte tipo_vaga para uppercase", () => {
        const result = mapearPayloadDesignacao({ ...formBase, tipo_cargo: "substituto" });

        expect(result?.tipo_vaga).toBe("SUBSTITUTO");
    });

    it("usa cargo_vago_selecionado quando presente como objeto com .id", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            cargo_vago_selecionado: { id: 99 },
        });

        expect(result?.cargo_vaga).toBe(99);
    });

    it("usa cargo_vago_selecionado quando presente como string", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            cargo_vago_selecionado: "99",
        });

        expect(result?.cargo_vaga).toBe(99);
    });

    it("faz parseInt de cargo_vaga quando cargo_vago_selecionado é null/falsy", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            cargo_vago_selecionado: null,
            cargo_vaga: "10",
        });

        expect(result?.cargo_vaga).toBe(10);
    });

    it("retorna 3360 para cargo_vaga quando dadosTitular está presente", () => {
        const result = mapearPayloadDesignacao({ ...formBase, dadosTitular });

        expect(result?.cargo_vaga).toBe(3360);
    });

    it("define impedimento_substituicao como 'FERIAS'", () => {
        const result = mapearPayloadDesignacao({ ...formBase });

        expect(result?.impedimento_substituicao).toBe("FERIAS");
    });
});