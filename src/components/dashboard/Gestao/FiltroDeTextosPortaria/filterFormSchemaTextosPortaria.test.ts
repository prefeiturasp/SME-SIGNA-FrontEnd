import { describe, expect, it } from "vitest";
import filterFormSchemaTextosPortaria, {
  filterFormSchemaTextosPortaria as namedSchema,
} from "./filterFormSchemaTextosPortaria";

describe("filterFormSchemaTextosPortaria", () => {
  it("exporta o schema default igual ao nomeado", () => {
    expect(filterFormSchemaTextosPortaria).toBe(namedSchema);
  });

  it("valida objeto vazio porque os campos são opcionais", () => {
    const result = filterFormSchemaTextosPortaria.safeParse({});

    expect(result.success).toBe(true);
  });

  it("valida quando todos os campos de filtro são enviados", () => {
    const result = filterFormSchemaTextosPortaria.safeParse({
      tipo_portaria: "Portaria",
      nome_modelo: "Modelo de nomeacao",
      status: "ATIVO",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tipo_portaria).toBe("Portaria");
      expect(result.data.nome_modelo).toBe("Modelo de nomeacao");
      expect(result.data.status).toBe("ATIVO");
    }
  });

  it("falha quando algum campo não é string", () => {
    const result = filterFormSchemaTextosPortaria.safeParse({
      nome_modelo: 123,
    });

    expect(result.success).toBe(false);
  });
});
