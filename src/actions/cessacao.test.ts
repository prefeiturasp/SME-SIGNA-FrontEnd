import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCessacaoByIdAction, insubsistenciaAction } from "./cessacao";
import { fetchWithClient } from "./http";
import { postWithAuth } from "@/lib/serverRequest";

vi.mock("./http", () => ({
  fetchWithClient: vi.fn(),
}));

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: vi.fn(),
}));

describe("insubsistenciaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates para postWithAuth com endpoint e mensagem corretos", async () => {
    const payload = {
      ato_pai: 10,
      numero_portaria: "001",
      ano_vigente: "2026",
      sei_numero: "6016.2026/0001-1",
      doc: "DOC-01",
      observacoes: "obs",
    };
    const mockResponse = { success: true, data: { id: 5 } };
    vi.mocked(postWithAuth).mockResolvedValueOnce(mockResponse as never);

    const result = await insubsistenciaAction(payload);

    expect(postWithAuth).toHaveBeenCalledWith(
      "/designacao/cessacoes/",
      payload,
      "Erro ao salvar cessacão"
    );
    expect(result).toEqual(mockResponse);
  });
});

describe("fetchCessacaoByIdAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama fetchWithClient com rota e mensagem esperadas", async () => {
    const mockResponse = { success: true, data: { id: 77 } };
    vi.mocked(fetchWithClient).mockResolvedValueOnce(mockResponse as never);

    const result = await fetchCessacaoByIdAction(77);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/designacao/cessacoes/77/",
      {},
      "Erro ao buscar as cessacões"
    );
    expect(result).toEqual(mockResponse);
  });

  it("propaga erro retornado por fetchWithClient", async () => {
    const mockResponse = { success: false, error: "Falha API" };
    vi.mocked(fetchWithClient).mockResolvedValueOnce(mockResponse as never);

    const result = await fetchCessacaoByIdAction(21);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/designacao/cessacoes/21/",
      {},
      "Erro ao buscar as cessacões"
    );
    expect(result).toEqual(mockResponse);
  });
});
