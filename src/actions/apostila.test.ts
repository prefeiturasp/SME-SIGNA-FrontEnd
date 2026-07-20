import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApostilaAction, fetchApostilaByIdAction } from "./apostila";

const postWithAuthMock = vi.fn();
const fetchWithClientMock = vi.fn();

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: (...args: unknown[]) => postWithAuthMock(...args),
}));

vi.mock("./http", () => ({
  fetchWithClient: (...args: unknown[]) => fetchWithClientMock(...args),
}));

describe("apostila actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ApostilaAction chama endpoint com payload e mensagem padrão", async () => {
    const payload = {
      ato_pai: 99,
      sei_numero: "6016.2026/0001-2",
      doc: "2026-01-10",
      observacao: "Observação de teste",
    };

    postWithAuthMock.mockResolvedValueOnce({ success: true, data: { id: 1 } });

    const result = await ApostilaAction(payload);

    expect(postWithAuthMock).toHaveBeenCalledWith(
      "/designacao/apostilas/",
      payload,
      "Erro ao salvar apostila",
    );
    expect(result).toEqual({ success: true, data: { id: 1 } });
  });

  it("fetchApostilaByIdAction busca apostila por id com mensagem padrão", async () => {
    const response = { success: true, data: { id: 10 } };
    fetchWithClientMock.mockResolvedValueOnce(response);

    const result = await fetchApostilaByIdAction(10);

    expect(fetchWithClientMock).toHaveBeenCalledWith(
      "/designacao/apostilas/10/",
      {},
      "Erro ao buscar as apostilas",
    );
    expect(result).toEqual(response);
  });
});