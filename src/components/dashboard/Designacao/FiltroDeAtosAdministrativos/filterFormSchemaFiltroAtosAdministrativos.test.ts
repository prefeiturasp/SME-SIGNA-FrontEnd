import { describe, expect, it } from "vitest";
import filterFormSchemaFiltroAtosAdministrativos from "./filterFormSchemaFiltroAtosAdministrativos";

describe("filterFormSchemaFiltroAtosAdministrativos", () => {
  it("valida objeto vazio porque todos os campos sao opcionais", () => {
    const result = filterFormSchemaFiltroAtosAdministrativos.safeParse({});
    expect(result.success).toBe(true);
  });

  it("valida com todos os campos preenchidos incluindo periodo", () => {
    const result = filterFormSchemaFiltroAtosAdministrativos.safeParse({
      numero_sei: "1234.5678/9012345-6",
      tipo: "DESIGNACAO",
      portaria: "100/2026",
      nome_titular_e_indicado: "Joao da Silva",
      status_publicacao: "PUBLICADO",
      periodo_after: "2026-01-01",
      periodo_before: "2026-02-01",
      periodo: {
        from: new Date("2026-01-01"),
        to: new Date("2026-02-01"),
      },
      rf: "123456",
    });

    expect(result.success).toBe(true);
  });

  it("retorna erro quando periodo contem valores invalidos", () => {
    const result = filterFormSchemaFiltroAtosAdministrativos.safeParse({
      periodo: {
        from: "2026-01-01",
        to: "2026-02-01",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("periodo.from");
      expect(paths).toContain("periodo.to");
    }
  });
});
