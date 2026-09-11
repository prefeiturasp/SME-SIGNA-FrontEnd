import { describe, expect, it } from "vitest";
import { getDadosPortariaCessacao } from "./getDadosPortaria";
import type { Cessacao } from "@/types/designacao";

describe("getDadosPortariaCessacao", () => {
  it("retorna a cessacao quando ela está presente na designação", () => {
    const cessacao = { id: 1, numero_portaria: "123/2026" } as unknown as Cessacao;

    expect(getDadosPortariaCessacao({ cessacao })).toBe(cessacao);
  });

  it("retorna null quando a cessacao é null", () => {
    expect(getDadosPortariaCessacao({ cessacao: null })).toBeNull();
  });

  it("retorna null quando a cessacao não é informada", () => {
    expect(getDadosPortariaCessacao({})).toBeNull();
  });

  it("retorna null quando a designação é undefined", () => {
    expect(getDadosPortariaCessacao(undefined)).toBeNull();
  });
});
