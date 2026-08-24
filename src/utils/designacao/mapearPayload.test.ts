import { describe, it, expect } from "vitest";
import { mapearPayloadDesignacao } from "./mapearPayload";
import type { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";

// ── Helpers ──────────────────────────────────────

const servidorIndicado = {
    nome_civil: "João Silva",
    nome_servidor: "SILVA, JOÃO",
    rf: "123456",
    vinculo: 1,
    cargo_base: "Professor",
    cd_cargo_base: 10,
    lotacao: "EMEF Teste",
    cargo_sobreposto_funcao_atividade: "Diretor",
    cd_cargo_sobreposto_funcao_atividade: 20,
    cursos_titulos: "-",
    laudo_medico: "-",
    local_de_exercicio: "Escola A",
    local_de_servico: "DRE Centro",
};

const dadosTitular = {
    nome_civil: "Maria Souza",
    nome_servidor: "SOUZA, MARIA",
    rf: "654321",
    vinculo: 1,
    cargo_base: "Coordenador",
    cd_cargo_base: 11,
    lotacao: "EMEF Outra",
    cargo_sobreposto_funcao_atividade: "Vice-Diretor",
    cd_cargo_sobreposto_funcao_atividade: 77,
    cursos_titulos: "-",
    laudo_medico: "-",
    local_de_exercicio: "Escola B",
    local_de_servico: "DRE Sul",
};

const formBase: FormDesignacaoEServidorIndicado = {
    dre_nome: "DRE Centro",
    ue_nome: "EMEF Teste",
    codigo_hierarquico: "001",
    servidorIndicado,
    portaria_designacao: "42",
    ano: "2024",
    numero_sei: "SEI-001",
    doc: "DOC-001",
    a_partir_de: new Date("2024-01-15T00:00:00"),
    designacao_data_final: new Date("2024-12-31T00:00:00"),
    carater_especial: "sim",
    com_afastamento: "nao",
    motivo_afastamento: "",
    com_pendencia: "nao",
    motivo_pendencia: "",
    tipo_cargo: "vago",
    cargo_vago_selecionado: null,
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
        expect(result?.indicado_vinculo).toBe(1);
        expect(result?.indicado_cargo_base).toBe("Professor");
        expect(result?.indicado_lotacao).toBe("EMEF Teste");
        expect(result?.indicado_cargo_sobreposto).toBe("Diretor");
        expect(result?.indicado_local_exercicio).toBe("Escola A");
        expect(result?.indicado_local_servico).toBe("DRE Centro");
    });

    it("converte campos opcionais null do indicado (integração SME) para string vazia", () => {
        // Regressão: mesmo bug do titular, agora para servidorIndicado — mas só
        // nos campos onde o backend aceita blank (CharField com default="",
        // allow_blank=True): nome_civil, cargo_sobreposto e local_servico.
        const result = mapearPayloadDesignacao({
            ...formBase,
            servidorIndicado: {
                ...servidorIndicado,
                nome_civil: null,
                cargo_sobreposto_funcao_atividade: null,
                local_de_servico: null,
            } as unknown as typeof servidorIndicado,
        });

        expect(result?.indicado_nome_civil).toBe("");
        expect(result?.indicado_cargo_sobreposto).toBe("");
        expect(result?.indicado_local_servico).toBe("");
    });

    it("repassa local_de_exercicio null do indicado sem transformar (backend aplica o default)", () => {
        // Diferente dos demais campos opcionais, o backend rejeita blank ("")
        // em indicado_local_exercicio (CharField blank=False), mas aceita
        // null — nesse caso é o próprio backend que resolve para
        // "Indisponível", então o mapper não deve inventar um valor aqui.
        const result = mapearPayloadDesignacao({
            ...formBase,
            servidorIndicado: {
                ...servidorIndicado,
                local_de_exercicio: null,
            } as unknown as typeof servidorIndicado,
        });

        expect(result?.indicado_local_exercicio).toBeNull();
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
        expect(result?.titular_vinculo).toBe(1);
        expect(result?.titular_cargo_base).toBe("Coordenador");
        expect(result?.titular_lotacao).toBe("EMEF Outra");
        expect(result?.titular_cargo_sobreposto).toBe("Vice-Diretor");
        expect(result?.titular_local_exercicio).toBe("Escola B");
        expect(result?.titular_local_servico).toBe("DRE Sul");
    });

    it("converte campos null do titular (integração SME) para string vazia", () => {
        // Regressão: a integração SME pode retornar null nesses campos, mas o
        // backend usa CharField(blank=True, default="") sem allow_null=True,
        // local_de_exercicio é exceção: o
        // backend aceita null nesse campo e resolve o default sozinho.
        const result = mapearPayloadDesignacao({
            ...formBase,
            dadosTitular: {
                ...dadosTitular,
                nome_civil: null,
                nome_servidor: null,
                cargo_base: null,
                lotacao: null,
                cargo_sobreposto_funcao_atividade: null,
                local_de_exercicio: null,
                local_de_servico: null,
            } as unknown as typeof dadosTitular,
        });

        expect(result?.titular_nome_civil).toBe("");
        expect(result?.titular_nome_servidor).toBe("");
        expect(result?.titular_cargo_base).toBe("");
        expect(result?.titular_lotacao).toBe("");
        expect(result?.titular_cargo_sobreposto).toBe("");
        expect(result?.titular_local_exercicio).toBeNull();
        expect(result?.titular_local_servico).toBe("");
    });

    it("omite campos do titular quando dadosTitular é null/undefined", () => {
        const result = mapearPayloadDesignacao({ ...formBase, dadosTitular: null });

        expect(result).not.toHaveProperty("titular_nome_civil");
        expect(result).not.toHaveProperty("titular_rf");
        expect(result).not.toHaveProperty("titular_lotacao");
    });

    it("formata data_inicio e data_fim a partir de objeto Date", () => {
        const result = mapearPayloadDesignacao({ ...formBase });

        expect(result?.data_inicio).toBe("2024-01-15");
        expect(result?.data_fim).toBe("2024-12-31");
    });

    // As datas do formulário são persistidas em localStorage (DesignacaoContext) via
    // JSON.stringify/parse, o que desfaz `Date` em string — por isso `formatarData`
    // aceita `unknown` e os casos abaixo simulam esse valor "corrompido" pela
    // serialização, fora do que o schema declara.

    it("formata data a partir de string ISO (valor reidratado do localStorage)", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            a_partir_de: "2024-01-15T00:00:00",
            designacao_data_final: "2024-12-31T00:00:00",
        } as unknown as FormDesignacaoEServidorIndicado);

        expect(result?.data_inicio).toBe("2024-01-15");
        expect(result?.data_fim).toBe("2024-12-31");
    });

    it("formata data a partir de objeto com método .format() (dayjs/moment)", () => {
        const mockDayjs = { format: (fmt: string) => "2024-06-01" };

        const result = mapearPayloadDesignacao({
            ...formBase,
            a_partir_de: mockDayjs,
            designacao_data_final: mockDayjs,
        } as unknown as FormDesignacaoEServidorIndicado);

        expect(result?.data_inicio).toBe("2024-06-01");
        expect(result?.data_fim).toBe("2024-06-01");
    });

    it("retorna null para datas quando valor é null/undefined", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            a_partir_de: null,
            designacao_data_final: undefined,
        } as unknown as FormDesignacaoEServidorIndicado);

        expect(result?.data_inicio).toBeNull();
        expect(result?.data_fim).toBeNull();
    });

    it("retorna null para datas quando valor nao e suportado", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            a_partir_de: 12345,
            designacao_data_final: { value: "2024-01-01" },
        } as unknown as FormDesignacaoEServidorIndicado);

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
        const result = mapearPayloadDesignacao({
            ...formBase,
            motivo_afastamento: undefined,
            motivo_pendencia: undefined,
        });

        expect(result?.motivo_afastamento).toBeNull();
        expect(result?.pendencias).toBeNull();
    });

    it("converte tipo_vaga para uppercase", () => {
        const result = mapearPayloadDesignacao({ ...formBase, tipo_cargo: "vago" });

        expect(result?.tipo_vaga).toBe("VAGO");
    });

    // ── getCargoVaga ──────────────────────────────

    it("retorna cargo_vaga undefined quando tipo_cargo não é 'vago' nem 'disponivel'", () => {
        // Valor fora do enum atual: cenário de dado legado/corrompido vindo do
        // localStorage, que a função trata defensivamente.
        const result = mapearPayloadDesignacao({
            ...formBase,
            tipo_cargo: "substituto",
        } as unknown as FormDesignacaoEServidorIndicado);

        expect(result?.cargo_vaga).toBeUndefined();
    });

    it("usa cargo_vago_selecionado.id quando tipo_cargo é 'vago' e é objeto com .id", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            tipo_cargo: "vago",
            cargo_vago_selecionado: { id: 99, label: "Cargo 99" },
        });

        expect(result?.cargo_vaga).toBe(99);
    });

    it("usa Number(cargo_vago_selecionado) quando tipo_cargo é 'vago' e é string", () => {
        // Formato legado do campo (antes de virar { id, label }), mantido como
        // fallback defensivo em getCargoVaga.
        const result = mapearPayloadDesignacao({
            ...formBase,
            tipo_cargo: "vago",
            cargo_vago_selecionado: "99",
        } as unknown as FormDesignacaoEServidorIndicado);

        expect(result?.cargo_vaga).toBe(99);
    });

    it("retorna undefined quando tipo_cargo é 'vago' e cargo_vago_selecionado é null", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            tipo_cargo: "vago",
            cargo_vago_selecionado: null,
        });

        expect(result?.cargo_vaga).toBeUndefined();
    });

    it("usa cd_cargo_sobreposto_funcao_atividade do titular quando tipo_cargo é 'disponivel'", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            tipo_cargo: "disponivel",
            dadosTitular,
        });

        expect(result?.cargo_vaga).toBe(77);
    });

    it("retorna undefined quando tipo_cargo é 'disponivel' mas dadosTitular não tem cd_cargo_sobreposto", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            tipo_cargo: "disponivel",
            dadosTitular: {
                ...dadosTitular,
                cd_cargo_sobreposto_funcao_atividade: undefined,
            } as unknown as typeof dadosTitular,
        });

        expect(result?.cargo_vaga).toBeUndefined();
    });

    it("retorna undefined quando tipo_cargo é 'disponivel' e dadosTitular é null", () => {
        const result = mapearPayloadDesignacao({
            ...formBase,
            tipo_cargo: "disponivel",
            dadosTitular: null,
        });

        expect(result?.cargo_vaga).toBeUndefined();
    });
});
