import { describe, expect, it } from "vitest";
import FormSchemaCriarTextosPortaria, {
  FormSchemaCriarTextosPortaria as namedSchema,
  FormSchemaCriarTextosPortariaData,
} from "./FormSchemaCriarTextosPortaria";

const validPayload: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "PORTARIA",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
  texto_portaria: "ab",
  variaveis: ["NOME_SERVIDOR"],
  tipo_cargo: "CARGO_VAGO",
  observacoes: "Observação opcional",
};

describe("FormSchemaCriarTextosPortaria", () => {
  it("exporta o schema default igual ao nomeado", () => {
    expect(FormSchemaCriarTextosPortaria).toBe(namedSchema);
  });

  it("valida payload completo", () => {
    const result = FormSchemaCriarTextosPortaria.safeParse(validPayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it("permite omitir observações", () => {
    const { observacoes: _observacoes, ...payloadSemObservacoes } = validPayload;
    const result = FormSchemaCriarTextosPortaria.safeParse(payloadSemObservacoes);

    expect(result.success).toBe(true);
  });

  it("permite incluir tipo_ato_pai opcional", () => {
    const result = FormSchemaCriarTextosPortaria.safeParse({
      ...validPayload,
      tipo_ato_pai: "DESIGNACAO",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tipo_ato_pai).toBe("DESIGNACAO");
    }
  });

  it("exige campos obrigatórios", () => {
    const result = FormSchemaCriarTextosPortaria.safeParse({
      tipo_portaria: "",
      nome_modelo: "",
      status: "",
      texto_portaria: "",
      variaveis: [],
      tipo_cargo: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["tipo_portaria"], message: "Campo obrigatório." }),
        expect.objectContaining({ path: ["nome_modelo"], message: "Campo obrigatório." }),
        expect.objectContaining({ path: ["status"], message: "Campo obrigatório." }),
        expect.objectContaining({ path: ["texto_portaria"], message: "Campo obrigatório." }),
        expect.objectContaining({ path: ["variaveis"], message: "Campo obrigatório." }),
        expect.objectContaining({ path: ["tipo_cargo"], message: "Campo obrigatório." }),
      ]),
    );
  });

  it("rejeita texto da portaria com menos de 2 caracteres", () => {
    const result = FormSchemaCriarTextosPortaria.safeParse({
      ...validPayload,
      texto_portaria: "a",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        path: ["texto_portaria"],
        message: "Campo obrigatório.",
      }),
    ]);
  });

  it("rejeita lista de variáveis vazia", () => {
    const result = FormSchemaCriarTextosPortaria.safeParse({
      ...validPayload,
      variaveis: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        path: ["variaveis"],
        message: "Campo obrigatório.",
      }),
    ]);
  });

  it("falha quando algum campo não tem o tipo esperado", () => {
    const result = FormSchemaCriarTextosPortaria.safeParse({
      ...validPayload,
      variaveis: "PORTARIA",
    });

    expect(result.success).toBe(false);
  });
});
