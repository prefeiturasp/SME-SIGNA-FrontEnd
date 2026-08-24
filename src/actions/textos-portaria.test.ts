import { beforeEach, describe, expect, it, vi } from "vitest";
import { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";
import { TextosDePortariasPaginada } from "@/types/gestao";
import { fetchWithClient } from "./http";
import { fetchTextosPortaria } from "./textos-portaria";

vi.mock("./http", () => ({
  fetchWithClient: vi.fn(),
}));

const filtros: filterFormSchemaTextosPortariaData = {
  tipo_portaria: "Portaria",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
};

const resultado: TextosDePortariasPaginada = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe("fetchTextosPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchWithClient<TextosDePortariasPaginada>).mockResolvedValue({
      success: true,
      data: resultado,
    });
  });

  it("busca textos de portaria com página informada", async () => {
    const response = await fetchTextosPortaria(filtros, 3);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/modelos-portaria/",
      { ...filtros, page: 3 },
      "Erro ao buscar os textos de portaria",
    );
    expect(response).toEqual({
      success: true,
      data: resultado,
    });
  });

  it("usa página 1 quando página não é informada", async () => {
    await fetchTextosPortaria(filtros);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/modelos-portaria/",
      { ...filtros, page: 1 },
      "Erro ao buscar os textos de portaria",
    );
  });
});
