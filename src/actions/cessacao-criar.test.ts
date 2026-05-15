import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// ── Mocks ────────────────────────────────────────

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// ── Helpers ──────────────────────────────────────

const { cookies } = await import("next/headers");
const { cessacaoAction } = await import("./cessacao-criar"); // ajuste o caminho se necessário

const mockCookies = (token: string | undefined) => {
  vi.mocked(cookies).mockResolvedValue({
    get: (key: string) =>
      key === "auth_token" && token ? { value: token } : undefined,
  } as any);
};

const payloadMock = {
  numero_portaria: "123",
  ano_vigente: "2026",
};


describe("cessacaoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
  });

  it("retorna sucesso quando axios.post resolve", async () => {
    mockCookies("token-abc");
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });

    const result = await cessacaoAction(payloadMock, null);

    expect(result).toEqual({ success: true, data: { id: 1 } });
  });

  it("retorna sucesso quando axios.patch resolve para edição", async () => {
    mockCookies("token-abc");
    mockedAxios.patch.mockResolvedValueOnce({ data: { id: 99 } } as any);

    const result = await cessacaoAction(payloadMock, "99");

    expect(result).toEqual({ success: true, data: { id: 99 } });

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "https://api.example.com/designacao/v2/cessacoes/99/",
      payloadMock,
      expect.any(Object)
    );
  });

  it("envia Authorization header quando auth_token está presente", async () => {
    mockCookies("meu-token");
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    await cessacaoAction(payloadMock, null);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/designacao/v2/cessacoes/",
      payloadMock,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer meu-token",
        }),
      })
    );
  });

  it("não envia Authorization header quando auth_token está ausente", async () => {
    mockCookies(undefined);
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    await cessacaoAction(payloadMock, null);

    const headers =
      mockedAxios.post.mock.calls[0][2]?.headers as Record<string, string>;

    expect(headers).not.toHaveProperty("Authorization");
  });

  it("retorna erro 500 com mensagem específica", async () => {
    mockCookies("token");

    const axiosError = {
      isAxiosError: true,
      response: { status: 500, data: {} },
      message: "Request failed",
    };

    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await cessacaoAction(payloadMock, null);

    expect(result).toEqual({
      success: false,
      error: "Erro interno no servidor",
      field: undefined,
    });
  });

  it("retorna mensagem do detail quando presente", async () => {
    mockCookies("token");

    const axiosError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { detail: "Campo obrigatório ausente." },
      },
      message: "Request failed",
    };

    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await cessacaoAction(payloadMock, null);

    expect(result).toEqual({
      success: false,
      error: "Campo obrigatório ausente.",
      field: undefined,
    });
  });

  it("retorna field quando presente no erro", async () => {
    mockCookies("token");

    const axiosError = {
      isAxiosError: true,
      response: {
        status: 422,
        data: { detail: "Valor inválido.", field: "numero_portaria" },
      },
      message: "Request failed",
    };

    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await cessacaoAction(payloadMock, null);

    expect(result).toEqual({
      success: false,
      error: "Valor inválido.",
      field: "numero_portaria",
    });
  });

  it("usa error.message como fallback", async () => {
    mockCookies("token");

    const axiosError = {
      isAxiosError: true,
      response: { status: 404, data: {} },
      message: "Network Error",
    };

    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await cessacaoAction(payloadMock, null);

    expect(result).toEqual({
      success: false,
      error: "Network Error",
      field: undefined,
    });
  });

  it("usa mensagem padrão quando não há response nem message", async () => {
    mockCookies("token");

    const axiosError = {
      isAxiosError: true,
      response: undefined,
      message: "",
    };

    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await cessacaoAction(payloadMock, null);

    expect(result).toEqual({
      success: false,
      error: "Erro ao salvar cessação",
      field: undefined,
    });
  });
});