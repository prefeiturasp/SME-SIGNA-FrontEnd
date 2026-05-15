import { describe, it, expect } from "vitest";
import filterFormSchemaFiltroDO from "./filterFormSchemaFiltroDO";

describe("filterFormSchemaFiltroDO", () => {
  it("valida objeto vazio — todos os campos são opcionais", () => {
    const result = filterFormSchemaFiltroDO.safeParse({});
    expect(result.success).toBe(true);
  });

  it("valida quando numero_sei está presente e ignora portarias incompletas", () => {
    const result = filterFormSchemaFiltroDO.safeParse({
      numero_sei: "12345",
      portaria_inicial: "10",
    });
    expect(result.success).toBe(true);
  });

  it("valida com portaria_inicial e portaria_final preenchidas", () => {
    const result = filterFormSchemaFiltroDO.safeParse({
      portaria_inicial: "10",
      portaria_final: "20",
    });
    expect(result.success).toBe(true);
  });

  it("valida com todos os campos preenchidos", () => {
    const result = filterFormSchemaFiltroDO.safeParse({
      numero_sei: "123",
      ano: "2026",
      tipo_ato: "DESIGNACAO",
      portaria_inicial: "10",
      portaria_final: "20",
    });
    expect(result.success).toBe(true);
  });

  it("retorna erro quando apenas portaria_inicial está preenchida", () => {
    const result = filterFormSchemaFiltroDO.safeParse({ portaria_inicial: "10" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("portaria_inicial");
      expect(paths).toContain("portaria_final");
      expect(result.error.issues[0].message).toBe(
        "Preencha portaria inicial e final juntas quando não houver Nº SEI."
      );
    }
  });

  it("retorna erro quando apenas portaria_final está preenchida", () => {
    const result = filterFormSchemaFiltroDO.safeParse({ portaria_final: "20" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("portaria_inicial");
      expect(paths).toContain("portaria_final");
    }
  });

  it("trata numero_sei composto só de espaços como ausente (falha com portaria incompleta)", () => {
    const result = filterFormSchemaFiltroDO.safeParse({
      numero_sei: "   ",
      portaria_inicial: "10",
    });
    expect(result.success).toBe(false);
  });

  it("trata portaria_inicial composta só de espaços como ausente (falha com portaria_final preenchida)", () => {
    const result = filterFormSchemaFiltroDO.safeParse({
      portaria_inicial: "   ",
      portaria_final: "20",
    });
    expect(result.success).toBe(false);
  });

  it("trata portaria_final composta só de espaços como ausente (falha com portaria_inicial preenchida)", () => {
    const result = filterFormSchemaFiltroDO.safeParse({
      portaria_inicial: "10",
      portaria_final: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("valida quando ambas as portarias estão undefined — sem erro de portaria", () => {
    const result = filterFormSchemaFiltroDO.safeParse({ ano: "2026" });
    expect(result.success).toBe(true);
  });
});
