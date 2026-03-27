import axios from "axios";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignacaoByIdAction } from "./designacoes";

vi.mock("axios");
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("getDesignacaoByIdAction", () => {
  const mockedAxiosGet = vi.mocked(axios.get);
  const mockedCookies = vi.mocked(cookies);
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: "https://api.teste.com" };
  });

  it("retorna os dados da API quando a chamada é bem-sucedida", async () => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-123" });

    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosGet.mockResolvedValueOnce({ data: { id: 77, numero_portaria: "123" } } as never);

    const result = await getDesignacaoByIdAction(77);

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "https://api.teste.com/designacao/designacoes/77",
      {
        headers: {
          Authorization: "Bearer token-123",
        },
      }
    );
    expect(result.id).toBe(1);
    expect(result.numero_portaria).toBe("001");
    expect(result.unidade_proponente).toBe("EMEF João Pessoa");
  });

  it("lança erro quando a API falha", async () => {
    const getCookieMock = vi.fn().mockReturnValue(undefined);

    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosGet.mockRejectedValueOnce(new Error("erro"));

    await expect(getDesignacaoByIdAction(10)).rejects.toThrow(
      "Não foi possível buscar a designação"
    );
  });

 
});
