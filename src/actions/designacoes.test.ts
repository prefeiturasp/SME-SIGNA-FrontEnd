import axios from "axios";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { excluirDesignacao, getDesignacaoByIdAction } from "./designacoes";

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
    const payload = { id: 77, numero_portaria: "123" };

    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosGet.mockResolvedValueOnce({ data: payload } as never);

    const result = await getDesignacaoByIdAction(77);

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "https://api.teste.com/designacao/designacoes/77",
      {
        headers: {
          Authorization: "Bearer token-123",
        },
      }
    );
    expect(result).toEqual({ success: true, data: payload });
  });

  it.each([
    { status: 401, message: "Não autorizado. Faça login novamente." },
    { status: 404, message: "Designação não encontrada." },
    { status: 500, message: "Erro interno no servidor." },
  ])("mapeia status $status para mensagem amigável", async ({ status, message }) => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-123" });

    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosGet.mockRejectedValueOnce({
      response: { status, data: {} },
    } as never);

    const result = await getDesignacaoByIdAction(10);

    expect(result).toEqual({ success: false, error: message });
  });

  it("usa detail retornado pela API quando disponível", async () => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-123" });

    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosGet.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { detail: "Detalhe customizado da API" },
      },
    } as never);

    const result = await getDesignacaoByIdAction(10);

    expect(result).toEqual({
      success: false,
      error: "Detalhe customizado da API",
    });
  });

  it("usa error.message quando não há status mapeado nem detail", async () => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-123" });

    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosGet.mockRejectedValueOnce({
      response: { status: 418, data: {} },
      message: "Erro de rede",
    } as never);

    const result = await getDesignacaoByIdAction(10);

    expect(result).toEqual({ success: false, error: "Erro de rede" });
  });

  it("mantém mensagem padrão quando erro não contém detalhes", async () => {
    const getCookieMock = vi.fn().mockReturnValue(undefined);

    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosGet.mockRejectedValueOnce({} as never);

    const result = await getDesignacaoByIdAction(10);

    expect(result).toEqual({ success: false, error: "Erro ao executar ação." });
  });
});

describe("excluirDesignacao", () => {
  const mockedAxiosDelete = vi.mocked(axios.delete);
  const mockedCookies = vi.mocked(cookies);
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: "https://api.teste.com" };
  });

  it("retorna erro quando não há token de autenticação", async () => {
    const getCookieMock = vi.fn().mockReturnValue(undefined);
    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);

    const result = await excluirDesignacao(11);

    expect(mockedAxiosDelete).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: "Usuário não autenticado. Token não encontrado.",
    });
  });

  it("exclui com sucesso quando a API responde corretamente", async () => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-abc" });
    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosDelete.mockResolvedValueOnce({} as never);

    const result = await excluirDesignacao(9);

    expect(mockedAxiosDelete).toHaveBeenCalledWith(
      "https://api.teste.com/designacao/designacoes/9/",
      {
        headers: { Authorization: "Bearer token-abc" },
      }
    );
    expect(result).toEqual({ success: true });
  });

  it.each([
    { status: 401, message: "Não autorizado. Faça login novamente." },
    { status: 404, message: "Designação não encontrada." },
    { status: 500, message: "Erro interno no servidor." },
  ])("mapeia status $status para mensagem amigável", async ({ status, message }) => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-abc" });
    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosDelete.mockRejectedValueOnce({
      response: { status, data: {} },
    } as never);

    const result = await excluirDesignacao(33);

    expect(result).toEqual({ success: false, error: message });
  });

  it("usa detail retornado pela API quando disponível", async () => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-abc" });
    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosDelete.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { detail: "Detalhe customizado da API" },
      },
    } as never);

    const result = await excluirDesignacao(7);

    expect(result).toEqual({
      success: false,
      error: "Detalhe customizado da API",
    });
  });

  it("usa error.message quando não há status mapeado nem detail", async () => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-abc" });
    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosDelete.mockRejectedValueOnce({
      response: { status: 418, data: {} },
      message: "Erro de rede",
    } as never);

    const result = await excluirDesignacao(19);

    expect(result).toEqual({ success: false, error: "Erro de rede" });
  });

  it("mantém mensagem padrão quando erro não contém detalhes", async () => {
    const getCookieMock = vi.fn().mockReturnValue({ value: "token-abc" });
    mockedCookies.mockResolvedValueOnce({ get: getCookieMock } as never);
    mockedAxiosDelete.mockRejectedValueOnce({} as never);

    const result = await excluirDesignacao(21);

    expect(result).toEqual({ success: false, error: "Erro ao executar ação." });
  });
});
