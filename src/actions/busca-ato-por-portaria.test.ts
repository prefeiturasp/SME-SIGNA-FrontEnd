import { describe, it, expect, beforeEach, vi } from "vitest";
import { cookies } from "next/headers";
import {
  buscarDesignacaoPorPortariaAction,
  buscarCessacaoPorPortariaAction,
  buscarInsubsistenciaPorPortariaAction,
} from "./busca-ato-por-portaria";
import { getApiClient } from "@/lib/api";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getApiClient: vi.fn(),
}));

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const makeCookieStore = (token?: string): CookieStore =>
  ({
    get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
  }) as unknown as CookieStore;

const mockAxiosInstance = {
  get: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
  vi.mocked(getApiClient).mockResolvedValue(mockAxiosInstance as unknown as Awaited<ReturnType<typeof getApiClient>>);
  vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
});

describe.each([
  {
    nome: "buscarDesignacaoPorPortariaAction",
    action: buscarDesignacaoPorPortariaAction,
    url: "/designacao/designacoes/buscar-por-portaria/",
    sampleData: { id: 1, numero_portaria: "100/2026" },
  },
  {
    nome: "buscarCessacaoPorPortariaAction",
    action: buscarCessacaoPorPortariaAction,
    url: "/designacao/cessacoes/buscar-por-portaria/",
    sampleData: { id: 2, numero_portaria: "200/2026", ato_pai_id: 1 },
  },
  {
    nome: "buscarInsubsistenciaPorPortariaAction",
    action: buscarInsubsistenciaPorPortariaAction,
    url: "/designacao/insubsistencias/buscar-por-portaria/",
    sampleData: { id: 4, numero_portaria: "400/2026" },
  },
])("$nome", ({ action, url, sampleData }) => {
  it("retorna erro quando não há token (getApiClient retorna null)", async () => {
    vi.mocked(getApiClient).mockResolvedValue(null);

    const result = await action({ portaria: "100", ano: "2026" });

    expect(result).toEqual({
      success: false,
      error: "Usuário não autenticado",
    });
    expect(mockAxiosInstance.get).not.toHaveBeenCalled();
  });

  it("faz requisição com a portaria e o ano informados e retorna dados em caso de sucesso", async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: sampleData });

    const result = await action({ portaria: "100", ano: "2026" });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(url, {
      params: { portaria: "100", ano: "2026" },
    });
    expect(result).toEqual({ success: true, data: sampleData });
  });

  it("retorna erro quando a portaria não é encontrada", async () => {
    mockAxiosInstance.get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: { detail: "Não encontrado" } },
    });

    const result = await action({ portaria: "inexistente", ano: "2026" });

    expect(result.success).toBe(false);
  });
});
