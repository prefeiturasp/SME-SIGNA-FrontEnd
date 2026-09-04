import { describe, expect, it } from "vitest";
import formSchemaApostila, { type formSchemaApostilaData } from "./schema";

const payloadValido: formSchemaApostilaData = {
  ato_apostilado: "designação",
  dre: "108200",
  dre_nome: "DIRETORIA REGIONAL DE EDUCACAO CAMPO LIMPO",
  ue: "123456",
  ue_nome: "EMEF - Unidade Teste",
  codigo_hierarquico: "EH-123",
  informacoes_adicionais: "Observação",
  detalhe_para_quadro_de_historico_por_ano: true,
  texto_para_apostila: "Texto para apostilar",
  portaria_designacao: "123",
  numero_sei: "SEI-123",
  a_partir_de: new Date("2026-01-10"),
  designacao_data_final: new Date("2026-12-20"),
  ano: "2026",
  doc: "DOC-123",
  impedimento_substituicao: null,
  impedimento_label: "Sem impedimento",
  carater_especial: "nao",
  com_afastamento: "nao",
  motivo_afastamento: "",
  com_pendencia: "nao",
  motivo_pendencia: "",
};

describe("formSchemaApostila", () => {
  it("valida payload completo", () => {
    const result = formSchemaApostila.safeParse(payloadValido);

    expect(result.success).toBe(true);
  });

  it("aceita campos opcionais ausentes ou nulos", () => {
    const result = formSchemaApostila.safeParse({
      ato_apostilado: "designação",
      portaria_designacao: "123",
      numero_sei: "SEI-123",
      a_partir_de: new Date("2026-01-10"),
      designacao_data_final: null,
      ano: "2026",
      impedimento_substituicao: null,
      carater_especial: "nao",
      com_afastamento: "nao",
      motivo_afastamento: "",
      com_pendencia: "nao",
      motivo_pendencia: "",
      dre: "108200",
      dre_nome: "DIRETORIA REGIONAL DE EDUCACAO CAMPO LIMPO",
      ue: "123456",
      ue_nome: "EMEF - Unidade Teste",
      codigo_hierarquico: "EH-123",
    });

    expect(result.success).toBe(true);
  });

  it("retorna mensagens dos campos obrigatórios vazios", () => {
    const result = formSchemaApostila.safeParse({
      ...payloadValido,
      ato_apostilado: "",
      portaria_designacao: "",
      numero_sei: "",
      ano: "",
      carater_especial: "",
      com_afastamento: "",
      com_pendencia: "",
      dre: "",
      dre_nome: "",
      ue: "",
      ue_nome: "",
      codigo_hierarquico: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        "Campo obrigatório",                      
        "selecione se possui carater especial ",
        "selecione se possui afastamento",
        "Selecione se possui pendêcia",
        "Digite o número do SEI",
        "Selecione o ano",
        "Selecione uma Portaria de Designação",
        "Selecione uma DRE",
        "Selecione uma DRE",
        "Selecione uma Unidade",
        "Selecione uma Unidade",
        "Selecione um Código Hierárquico",
      ]);
    }
  });

  it("valida tamanho máximo da portaria de designação", () => {
    const result = formSchemaApostila.safeParse({
      ...payloadValido,
      portaria_designacao: "123456789012345678901",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "A Portaria de Designação deve ter no máximo 20 caracteres",
      );
    }
  });

  it("rejeita datas inválidas", () => {
    const result = formSchemaApostila.safeParse({
      ...payloadValido,
      a_partir_de: "2026-01-10",
      designacao_data_final: "2026-12-20",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(2);
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual([
        "a_partir_de",
        "designacao_data_final",
      ]);
    }
  });
});
