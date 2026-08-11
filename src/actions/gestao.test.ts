import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCargosBase } from "./gestao";
import { fetchWithClient } from "./http";
import type { CargosBasePaginada } from "@/types/gestao";

vi.mock("./http", () => ({
  fetchWithClient: vi.fn(),
}));

describe("fetchCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates request to fetchWithClient with expected endpoint", async () => {
    const filtros = {
      grupamento: "1",
      descricao_resumida: "Resumo",
      descricao_completa: "Descricao completa",
      situacao_funcional: "2",
      status: "1",
      page: 3,
    };
    const response = {
      success: true as const,
      data: { count: 1, next: null, previous: null, results: [{ id: 7 }] as unknown as CargosBasePaginada["results"] },
    };
    vi.mocked(fetchWithClient).mockResolvedValueOnce(response);

    const result = await fetchCargosBase(filtros);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/cargos-base/",
      filtros,
      "Erro ao buscar os cargos base",
    );
    expect(result).toEqual(response);
  });

  it("returns error payload from fetchWithClient", async () => {
    const response = {
      success: false as const,
      error: "falha na API",
    };
    vi.mocked(fetchWithClient).mockResolvedValueOnce(response);

    const result = await fetchCargosBase({ status: "2" });

    expect(result).toEqual(response);
  });
});
