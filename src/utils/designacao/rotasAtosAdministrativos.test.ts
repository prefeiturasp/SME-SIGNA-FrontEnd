import { describe, expect, it } from "vitest";
import { pathDetalhesDoAto } from "./rotasAtosAdministrativos";

describe("pathDetalhesDoAto", () => {
  it.each([
    ["DESIGNACAO", "/pages/listagem-designacoes/visualizar-designacao/42"],
    ["CESSACAO", "/pages/visualizar-cessacao/42"],
    ["APOSTILA", "/pages/visualizar-apostila/42"],
    ["INSUBSISTENCIA", "/pages/visualizar-insubsistencia/42"],
  ])("monta a rota de %s", (tipo, href) => {
    expect(pathDetalhesDoAto({ id: 42, tipo })).toBe(href);
  });

  it("não monta rota para um tipo sem tela", () => {
    expect(pathDetalhesDoAto({ id: 42, tipo: "OUTRO" })).toBeNull();
  });
});
