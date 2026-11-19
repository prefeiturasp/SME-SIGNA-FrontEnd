import { describe, expect, it } from "vitest";
import { nomeDreSemPrefixo } from "./nomeDreSemPrefixo";

describe("nomeDreSemPrefixo", () => {
  it("remove o prefixo DRE do início do nome", () => {
    expect(nomeDreSemPrefixo("DRE FREGUESIA/BRASILANDIA")).toBe("FREGUESIA/BRASILANDIA");
  });

  it("ignora caixa e espaços extras no prefixo", () => {
    expect(nomeDreSemPrefixo("  dre   Ipiranga")).toBe("Ipiranga");
  });

  it("mantém o nome quando não há prefixo", () => {
    expect(nomeDreSemPrefixo("BUTANTA")).toBe("BUTANTA");
  });

  it("não remove DRE que não seja prefixo", () => {
    expect(nomeDreSemPrefixo("PENHA DRE")).toBe("PENHA DRE");
  });

  it.each([null, undefined, "", "DRE "])("retorna '-' para %j", (valor) => {
    expect(nomeDreSemPrefixo(valor)).toBe("-");
  });
});
