import { describe, expect, it } from "vitest";
import filterFormSchemaFiltroCargosBase, {
  filterFormSchemaFiltroCargosBase as namedSchema,
} from "./filterFormSchemaCargosBase";

describe("filterFormSchemaFiltroCargosBase", () => {
  it("exporta o schema default igual ao nomeado", () => {
    expect(filterFormSchemaFiltroCargosBase).toBe(namedSchema);
  });

  it("valida objeto vazio porque os campos são opcionais", () => {
    const result = filterFormSchemaFiltroCargosBase.safeParse({});
    expect(result.success).toBe(true);
  });

  it("valida quando todos os campos de filtro são enviados", () => {
    const result = filterFormSchemaFiltroCargosBase.safeParse({
      grupamento: "2",
      descricao_resumida: "Professor",
      descricao_completa: "Professor de ensino fundamental",
      situacao_funcional: "1",
      status: "3",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.grupamento).toBe("2");
      expect(result.data.status).toBe("3");
    }
  });

  it("falha quando algum campo não é string", () => {
    const result = filterFormSchemaFiltroCargosBase.safeParse({
      grupamento: 1,
    });

    expect(result.success).toBe(false);
  });
});
