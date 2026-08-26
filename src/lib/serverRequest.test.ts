import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

interface ITestPayload {
  readonly nome: string;
}

interface ITestResponse {
  readonly id: number;
}

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const { cookies } = await import("next/headers");
const { postWithAuth, patchWithAuth } = await import("./serverRequest");

const mockCookies = (token?: string) => {
  vi.mocked(cookies).mockResolvedValue({
    get: (key: string) => (key === "auth_token" && token ? { value: token } : undefined),
  } as Awaited<ReturnType<typeof cookies>>);
};

describe("lib/serverRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
  });

  it("faz post com token de autenticação quando presente", async () => {
    mockCookies("token-abc");
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } } as never);

    const result = await postWithAuth<ITestPayload, ITestResponse>(
      "/gestao/cargos-base/",
      { nome: "Cargo A" },
      "Erro ao criar"
    );

    expect(result).toEqual({ success: true, data: { id: 1 } });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/gestao/cargos-base/",
      { nome: "Cargo A" },
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer token-abc",
        }),
      })
    );
  });

  it("não envia Authorization quando token está ausente", async () => {
    mockCookies();
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 2 } } as never);

    await postWithAuth<ITestPayload, ITestResponse>("/gestao/cargos-base/", { nome: "Cargo B" });

    const headers = mockedAxios.post.mock.calls[0][2]?.headers as Record<string, string>;
    expect(headers).toEqual({ "Content-Type": "application/json" });
  });

  it("faz patch e retorna sucesso", async () => {
    mockCookies("token-edit");
    mockedAxios.patch.mockResolvedValueOnce({ data: { id: 9 } } as never);

    const result = await patchWithAuth<Partial<ITestPayload>, ITestResponse>(
      "/gestao/cargos-base/9/",
      { nome: "Cargo C" }
    );

    expect(result).toEqual({ success: true, data: { id: 9 } });
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "https://api.example.com/gestao/cargos-base/9/",
      { nome: "Cargo C" },
      expect.any(Object)
    );
  });

  it("retorna erro interno quando status é 500", async () => {
    mockCookies("token");
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 500, data: {} },
      message: "request failed",
    } as never);

    const result = await postWithAuth<ITestPayload>("/rota", { nome: "X" }, "fallback");

    expect(result).toEqual({
      success: false,
      error: "Erro interno no servidor",
    });
  });

  it("retorna detail e field quando presentes", async () => {
    mockCookies("token");
    mockedAxios.patch.mockRejectedValueOnce({
      response: {
        status: 422,
        data: { detail: "Valor inválido", field: "nome" },
      },
      message: "request failed",
    } as never);

    const result = await patchWithAuth<ITestPayload>("/rota", { nome: "X" });

    expect(result).toEqual({
      success: false,
      error: "Valor inválido",
      field: "nome",
    });
  });

  it("retorna a primeira mensagem de erro em array", async () => {
    mockCookies("token");
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { nome: ["Campo obrigatório", "Outra mensagem"] },
      },
      message: "request failed",
    } as never);

    const result = await postWithAuth<ITestPayload>("/rota", { nome: "X" }, "fallback");

    expect(result).toEqual({
      success: false,
      error: "Campo obrigatório",
    });
  });

  it("retorna o primeiro valor truthy quando não há detail", async () => {
    mockCookies("token");
    mockedAxios.patch.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { descricao: "", nome: "Nome inválido" },
      },
      message: "request failed",
    } as never);

    const result = await patchWithAuth<ITestPayload>("/rota", { nome: "X" }, "fallback");

    expect(result).toEqual({
      success: false,
      error: "Nome inválido",
    });
  });

  it("usa error.message quando não há dados úteis na resposta", async () => {
    mockCookies("token");
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 404, data: {} },
      message: "Network Error",
    } as never);

    const result = await postWithAuth<ITestPayload>("/rota", { nome: "X" }, "fallback");

    expect(result).toEqual({
      success: false,
      error: "Network Error",
    });
  });

  it("usa mensagem padrão quando error.message vem vazio", async () => {
    mockCookies("token");
    mockedAxios.patch.mockRejectedValueOnce({
      response: undefined,
      message: "",
    } as never);

    const result = await patchWithAuth<ITestPayload>("/rota", { nome: "X" }, "Mensagem padrão");

    expect(result).toEqual({
      success: false,
      error: "Mensagem padrão",
    });
  });
});
