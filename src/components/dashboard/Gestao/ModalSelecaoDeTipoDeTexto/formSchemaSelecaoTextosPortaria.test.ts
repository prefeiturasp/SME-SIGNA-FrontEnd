import { describe, expect, it } from "vitest";
import formSchemaSelecaoTextosPortaria, {
  formSchemaSelecaoTextosPortaria as namedSchema,
  formSchemaSelecaoTextosPortariaData,
} from "./formSchemaSelecaoTextosPortaria";

const validPayload: formSchemaSelecaoTextosPortariaData = {
  tipo_de_texto: "criar_novo_texto",
  tipo_portaria: "DESIGNACAO",
};

describe("formSchemaSelecaoTextosPortaria", () => {
  it("exporta o schema default igual ao nomeado", () => {
    expect(formSchemaSelecaoTextosPortaria).toBe(namedSchema);
  });

  it("valida payload completo", () => {
    const result = formSchemaSelecaoTextosPortaria.safeParse(validPayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it("valida a opção de usar o último texto cadastrado", () => {
    const result = formSchemaSelecaoTextosPortaria.safeParse({
      tipo_de_texto: "ultimo_texto_cadastrado",
      tipo_portaria: "CESSACAO",
    });

    expect(result.success).toBe(true);
  });

  it("exige os campos obrigatórios", () => {
    const result = formSchemaSelecaoTextosPortaria.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["tipo_de_texto"] }),
        expect.objectContaining({ path: ["tipo_portaria"] }),
      ]),
    );
  });

  it("falha quando algum campo não tem o tipo esperado", () => {
    const result = formSchemaSelecaoTextosPortaria.safeParse({
      tipo_de_texto: 1,
      tipo_portaria: ["DESIGNACAO"],
    });

    expect(result.success).toBe(false);
  });
});
