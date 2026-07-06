import { describe, expect, it } from "vitest";
import formSchemaAnularApostila from "./schema";

describe("formSchemaAnularApostila", () => {
  it("valida payload com todos os campos obrigatórios", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila_insubsistencia: {
        portaria: "123",
        ano: "2026",
        numero_sei: "SEI-123",
        doc: new Date("2026-01-10"),
      },
    });

    expect(result.success).toBe(true);
  });

  it("retorna erro quando campos obrigatórios não são enviados", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila_insubsistencia: {},
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Invalid input: expected string, received undefined");
    }
  });

  it("retorna erro quando portaria, ano e numero_sei são vazios", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila_insubsistencia: {
        portaria: "",
        ano: "",
        numero_sei: "",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toEqual([
        "Campo obrigatório",
        "Campo obrigatório",
        "Campo obrigatório",
        "Invalid input: expected date, received undefined",
      ]);
    }
  });

  it("aceita campos opcionais doc, observacao e texto_para_apostila", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila_insubsistencia: {
        portaria: "50",
        ano: "2026",
        numero_sei: "SEI-999",
        doc: new Date("2026-02-20"),
        observacao: "Texto",
        texto_para_apostila: "conteúdo",
      },
    });

    expect(result.success).toBe(true);
  });

  it("retorna erro quando doc não é Date", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila_insubsistencia: {
        portaria: "50",
        ano: "2026",
        numero_sei: "SEI-999",
        doc: "DOC-INVALIDO",
      },
    });

    expect(result.success).toBe(false);
  });
});
