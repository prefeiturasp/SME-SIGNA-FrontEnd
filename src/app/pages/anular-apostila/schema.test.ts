import { describe, expect, it } from "vitest";
import formSchemaAnularApostila from "./schema";

describe("formSchemaAnularApostila", () => {
  it("valida payload com todos os campos obrigatórios", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila: {
        portaria: "123",
        ano: "2026",
        numero_sei: "SEI-123",
      },
    });

    expect(result.success).toBe(true);
  });

  it("retorna erro quando campos obrigatórios não são enviados", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila: {},
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Invalid input: expected string, received undefined");
    }
  });

  it("retorna erro quando portaria, ano e numero_sei são vazios", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila: {
        portaria: "",
        ano: "",
        numero_sei: "",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toEqual(["Campo obrigatório", "Campo obrigatório", "Campo obrigatório"]);
    }
  });

  it("aceita campos opcionais doc, observacao e texto_para_apostila", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila: {
        portaria: "50",
        ano: "2026",
        numero_sei: "SEI-999",
        doc: "DOC-2026",
        observacao: "Texto",
        texto_para_apostila: "conteúdo",
      },
    });

    expect(result.success).toBe(true);
  });
});
