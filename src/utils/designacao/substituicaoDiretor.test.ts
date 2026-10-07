import { describe, it, expect } from "vitest";
import {
    avaliarSubstituicaoDiretor,
    contarDiasPeriodo,
    ehAssistenteDiretor,
    ehProfessor,
    interpretarErrosSubstituicaoDiretor,
    MENSAGEM_ASSISTENTE_DIRETOR,
    MENSAGEM_ELEICAO_NECESSARIA,
    MENSAGEM_INDICADO_NAO_PROFESSOR,
    deOutraUnidade,
    validarPeriodoSubstituicaoDiretor,
} from "./substituicaoDiretor";

// Professor de Ed. Infantil (3212), lotado na UE 090450, sem cargo sobreposto.
const professorMesmaUnidade = {
    cd_cargo_base: 3212,
    cd_cargo_sobreposto_funcao_atividade: 0,
    possui_cargo_sobreposto: false,
    cd_ue_lotacao: "090450",
};

function avaliar(overrides: Partial<Parameters<typeof avaliarSubstituicaoDiretor>[0]> = {}) {
    return avaliarSubstituicaoDiretor({
        cargoVaga: 3360,
        dataInicio: new Date(2026, 0, 1),
        dataFim: new Date(2026, 0, 16),
        indicado: professorMesmaUnidade,
        codigoUe: "090450",
        ...overrides,
    });
}

describe("contarDiasPeriodo", () => {
    it("conta o primeiro e o último dia", () => {
        expect(contarDiasPeriodo(new Date(2026, 0, 1), new Date(2026, 0, 16))).toBe(16);
        expect(contarDiasPeriodo(new Date(2026, 0, 1), new Date(2026, 0, 1))).toBe(1);
    });

    it("aceita datas serializadas pelo localStorage", () => {
        expect(contarDiasPeriodo("2026-01-01T03:00:00.000Z", "2026-01-30T03:00:00.000Z")).toBe(30);
    });

    it("retorna null sem alguma das datas", () => {
        expect(contarDiasPeriodo(new Date(2026, 0, 1), null)).toBeNull();
        expect(contarDiasPeriodo(undefined, new Date(2026, 0, 1))).toBeNull();
    });
});

describe("validarPeriodoSubstituicaoDiretor", () => {
    it.each([
        [16, null],
        [30, null],
        [15, "periodo_insuficiente"],
        [31, "eleicao_necessaria"],
        [null, "eleicao_necessaria"],
    ])("%s dias → %s", (dias, esperado) => {
        expect(validarPeriodoSubstituicaoDiretor(dias)).toBe(esperado);
    });
});

describe("ehProfessor / deOutraUnidade", () => {
    it("usa o cargo sobreposto quando possui_cargo_sobreposto é true", () => {
        expect(
            ehProfessor({ ...professorMesmaUnidade, cd_cargo_sobreposto_funcao_atividade: 3379, possui_cargo_sobreposto: true })
        ).toBe(false);
    });

    it("ignora função/atividade e usa o cargo base", () => {
        expect(
            ehProfessor({ ...professorMesmaUnidade, cd_cargo_sobreposto_funcao_atividade: 3379, possui_cargo_sobreposto: false })
        ).toBe(true);
    });

    it("não usa o nome: 2666 (Profissional Eng...) não é professor", () => {
        expect(ehProfessor({ ...professorMesmaUnidade, cd_cargo_base: 2666 })).toBe(false);
    });

    it("aceita código como texto", () => {
        expect(ehProfessor({ ...professorMesmaUnidade, cd_cargo_base: " 3212 " as unknown as number })).toBe(true);
    });

    it("compara códigos de UE ignorando espaços e zeros à esquerda", () => {
        expect(deOutraUnidade({ ...professorMesmaUnidade, cd_ue_lotacao: 90450 }, " 090450 ")).toBe(false);
        expect(deOutraUnidade(professorMesmaUnidade, "090451")).toBe(true);
    });

    it("bloqueia quando falta algum dos códigos de UE", () => {
        expect(deOutraUnidade(professorMesmaUnidade, "")).toBe(true);
        expect(deOutraUnidade({ ...professorMesmaUnidade, cd_ue_lotacao: null }, "090450")).toBe(true);
    });
});

describe("avaliarSubstituicaoDiretor (cenários da especificação)", () => {
    it("1. Diretor com 16 e com 30 dias: libera", () => {
        expect(avaliar().bloqueado).toBe(false);
        expect(avaliar({ dataFim: new Date(2026, 0, 30) }).bloqueado).toBe(false);
    });

    it("2. Diretor com 15 dias: erro de período", () => {
        const r = avaliar({ dataFim: new Date(2026, 0, 15) });
        expect(r.erroPeriodo).toBe("periodo_insuficiente");
        expect(r.bloqueado).toBe(true);
    });

    it("3. Diretor com 31 dias ou sem data fim: eleição", () => {
        expect(avaliar({ dataFim: new Date(2026, 0, 31) }).erroPeriodo).toBe("eleicao_necessaria");
        expect(avaliar({ dataFim: null }).erroPeriodo).toBe("eleicao_necessaria");
    });

    it("4. professor de outra UE: bloqueia", () => {
        const r = avaliar({ codigoUe: "019999" });
        expect(r.unidadeDiferente).toBe(true);
        expect(r.bloqueado).toBe(true);
    });

    it("5. professor da mesma UE: libera", () => {
        expect(avaliar({ codigoUe: "90450" }).bloqueado).toBe(false);
    });

    it("5b. não professor (Secretário 3182), mesma UE: bloqueia", () => {
        const r = avaliar({ indicado: { ...professorMesmaUnidade, cd_cargo_base: 3182 } });
        expect(r).toMatchObject({ naoProfessor: true, unidadeDiferente: false, bloqueado: true });
    });

    it("6. Profissional Eng... (2666): bloqueia como não professor", () => {
        const r = avaliar({ indicado: { ...professorMesmaUnidade, cd_cargo_base: 2666 }, codigoUe: "019999" });
        expect(r).toMatchObject({ naoProfessor: true, unidadeDiferente: false, bloqueado: true });
    });

    it("7. base professor + sobreposto Coordenador (3379): bloqueia como não professor", () => {
        const r = avaliar({
            indicado: { ...professorMesmaUnidade, cd_cargo_sobreposto_funcao_atividade: 3379, possui_cargo_sobreposto: true },
        });
        expect(r).toMatchObject({ naoProfessor: true, bloqueado: true });
    });

    it("8. base professor + função/atividade, mesma UE: libera", () => {
        const r = avaliar({
            indicado: { ...professorMesmaUnidade, cd_cargo_sobreposto_funcao_atividade: 3379, possui_cargo_sobreposto: false },
        });
        expect(r.bloqueado).toBe(false);
    });

    it("8b. base professor + função/atividade, outra UE: bloqueia por unidade", () => {
        const r = avaliar({
            indicado: { ...professorMesmaUnidade, cd_cargo_sobreposto_funcao_atividade: 3379, possui_cargo_sobreposto: false },
            codigoUe: "019999",
        });
        expect(r).toMatchObject({ naoProfessor: false, unidadeDiferente: true });
    });

    it("9. outro cargo de vaga (3182): nenhuma regra se aplica", () => {
        const r = avaliar({ cargoVaga: 3182, dataFim: null, codigoUe: "019999" });
        expect(r).toMatchObject({ aplica: false, erroPeriodo: null, unidadeDiferente: false, bloqueado: false });
    });
});

describe("Assistente de Diretor (cargo sobreposto 3085)", () => {
    const assistenteDiretor = {
        ...professorMesmaUnidade,
        cd_cargo_sobreposto_funcao_atividade: 3085,
        possui_cargo_sobreposto: true,
    };

    it("ehAssistenteDiretor considera só o cargo sobreposto", () => {
        expect(ehAssistenteDiretor(assistenteDiretor)).toBe(true);
        expect(ehAssistenteDiretor({ ...assistenteDiretor, cd_cargo_sobreposto_funcao_atividade: "3085" as unknown as number })).toBe(true);
        expect(ehAssistenteDiretor({ ...assistenteDiretor, possui_cargo_sobreposto: false })).toBe(false);
        expect(ehAssistenteDiretor({ ...assistenteDiretor, cd_cargo_sobreposto_funcao_atividade: 3379 })).toBe(false);
        expect(ehAssistenteDiretor(null)).toBe(false);
    });

    it("AD + vaga de Diretor: bloqueia, mesmo com período de 10 dias", () => {
        const r = avaliar({ indicado: assistenteDiretor, dataFim: new Date(2026, 0, 10) });
        expect(r).toMatchObject({ aplica: true, assistenteDiretor: true, bloqueado: true });
    });

    it("AD tem prioridade sobre as regras de período e unidade", () => {
        const r = avaliar({ indicado: assistenteDiretor, dataFim: new Date(2026, 0, 31), codigoUe: "019999" });
        expect(r).toMatchObject({
            assistenteDiretor: true,
            erroPeriodo: null,
            naoProfessor: false,
            unidadeDiferente: false,
            bloqueado: true,
        });
    });

    it("AD + outra vaga: não bloqueia", () => {
        const r = avaliar({ cargoVaga: 3182, indicado: assistenteDiretor });
        expect(r).toMatchObject({ assistenteDiretor: false, bloqueado: false });
    });

    it("3085 como função/atividade (possui_cargo_sobreposto false): não bloqueia", () => {
        const r = avaliar({ indicado: { ...assistenteDiretor, possui_cargo_sobreposto: false } });
        expect(r).toMatchObject({ assistenteDiretor: false, bloqueado: false });
    });
});

describe("interpretarErrosSubstituicaoDiretor", () => {
    it("lê os códigos em lista, como o backend envia", () => {
        expect(
            interpretarErrosSubstituicaoDiretor({
                codes: { data_fim: ["eleicao_necessaria"] },
                data_fim: ["Texto do backend"],
            })
        ).toEqual({ eleicao: "Texto do backend" });
    });

    it("aceita código como string e usa a mensagem padrão quando falta o texto", () => {
        expect(interpretarErrosSubstituicaoDiretor({ codes: { data_fim: "eleicao_necessaria" } })).toEqual({
            eleicao: MENSAGEM_ELEICAO_NECESSARIA,
        });
    });

    it("mapeia periodo_insuficiente e unidade_diferente", () => {
        expect(
            interpretarErrosSubstituicaoDiretor({
                codes: { data_fim: ["periodo_insuficiente"], indicado_codigo_ue_lotacao: ["unidade_diferente"] },
                data_fim: ["Período"],
                indicado_codigo_ue_lotacao: ["Unidade"],
            })
        ).toEqual({ dataFim: "Período", indicado: "Unidade" });
    });

    it("mapeia assistente_diretor para o indicado, priorizando o texto do campo", () => {
        expect(
            interpretarErrosSubstituicaoDiretor({
                codes: { indicado_codigo_cargo_sobreposto: ["assistente_diretor"], data_fim: ["eleicao_necessaria"] },
                indicado_codigo_cargo_sobreposto: ["Texto do campo"],
                detail: "Texto do detail",
            })
        ).toEqual({ indicado: "Texto do campo" });
    });

    it("assistente_diretor sem texto no campo usa detail e, na falta, a mensagem padrão", () => {
        expect(
            interpretarErrosSubstituicaoDiretor({
                codes: { indicado_codigo_cargo_sobreposto: ["assistente_diretor"] },
                detail: "Texto do detail",
            })
        ).toEqual({ indicado: "Texto do detail" });
        expect(
            interpretarErrosSubstituicaoDiretor({ codes: { indicado_codigo_cargo_sobreposto: "assistente_diretor" } })
        ).toEqual({ indicado: MENSAGEM_ASSISTENTE_DIRETOR });
    });

    it.each(["indicado_codigo_cargo_sobreposto", "indicado_codigo_cargo_base"])(
        "mapeia indicado_nao_professor vindo em %s",
        (campo) => {
            expect(
                interpretarErrosSubstituicaoDiretor({
                    codes: { [campo]: ["indicado_nao_professor"] },
                    [campo]: ["Texto do backend"],
                })
            ).toEqual({ indicado: "Texto do backend" });
            expect(interpretarErrosSubstituicaoDiretor({ codes: { [campo]: ["indicado_nao_professor"] } })).toEqual({
                indicado: MENSAGEM_INDICADO_NAO_PROFESSOR,
            });
        }
    );

    it("retorna null para códigos não reconhecidos ou ausentes", () => {
        expect(interpretarErrosSubstituicaoDiretor({ codes: { numero_portaria: ["unique"] } })).toBeNull();
        expect(interpretarErrosSubstituicaoDiretor({ detail: "x" })).toBeNull();
        expect(interpretarErrosSubstituicaoDiretor(undefined)).toBeNull();
    });
});
