import { describe, expect, it } from "vitest";
import formSchemaAnularApostila from "./schema";

describe("formSchemaAnularApostila", () => {
  it("valida payload mínimo com numero_sei obrigatório", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila: {
        numero_sei: "SEI-123",
      },
    });

    expect(result.success).toBe(true);
  });

  it("retorna erro quando numero_sei está vazio", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila: {
        numero_sei: "",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Campo obrigatório");
    }
  });

  it("aceita campos opcionais de portaria e observação", () => {
    const result = formSchemaAnularApostila.safeParse({
      apostila: {
        portaria: 50,
        ano: 2026,
        numero_sei: "SEI-999",
        doc: "DOC-2026",
        observacao: "Texto",
        texto_para_apostila: "conteúdo",
      },
    });

    expect(result.success).toBe(true);
  });
});
