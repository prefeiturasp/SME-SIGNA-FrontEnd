import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { ApostilaAction } from "./apostila-criar"; // Ajuste o caminho conforme necessário

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const { cookies } = await import("next/headers");

const mockCookies = (token: string | undefined) => {
  vi.mocked(cookies).mockResolvedValue({
    get: (key: string) =>
      key === "auth_token" && token ? { value: token } : undefined,
  } as any);
};

const payloadMock = {
  sei_numero: "6016.2024/000123-4",
  doc: "2024-05-20",
  observacao: "Teste",
  ato_apostilado: "designacao",
  designacao: 10,
};

describe("ApostilaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
  });

  it("retorna sucesso quando axios.post resolve corretamente", async () => {
    mockCookies("token-123");
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 1, status: "salvo" } });

    const result = await ApostilaAction(payloadMock as any);

    expect(result).toEqual({ success: true, data: { id: 1, status: "salvo" } });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/designacao/apostilas/",
      payloadMock,
      expect.any(Object)
    );
  });

  it("envia o header Authorization quando o token está nos cookies", async () => {
    mockCookies("meu-token-secreto");
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    await ApostilaAction(payloadMock as any);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer meu-token-secreto",
        }),
      })
    );
  });

  it("retorna 'Erro interno no servidor' quando status é 500", async () => {
    mockCookies("token");
    const axiosError = {
      isAxiosError: true,
      response: { status: 500, data: {} },
    };
    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await ApostilaAction(payloadMock as any);

    expect(result).toEqual({
      success: false,
      error: "Erro interno no servidor",
      field: undefined,
    });
  });

  it("extrai mensagem via regex quando o erro contém 'string=' no detail", async () => {
    mockCookies("token");
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { detail: "Error detail with string='Mensagem customizada via backend'" },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await ApostilaAction(payloadMock as any);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Mensagem customizada via backend");
  });

  it("retorna o campo 'field' quando o backend identifica erro em campo específico", async () => {
    mockCookies("token");
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { detail: "Valor inválido", field: "sei_numero" },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await ApostilaAction(payloadMock as any);

    expect(result).toEqual({
      success: false,
      error: "Valor inválido",
      field: "sei_numero",
    });
  });

  it("usa a mensagem de erro padrão quando não há detalhes específicos", async () => {
    mockCookies("token");
    const axiosError = {
      isAxiosError: true,
      response: undefined,
      message: "",
    };
    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await ApostilaAction(payloadMock as any);

    expect(result.error).toBe("Erro ao salvar apostila");
  });
});