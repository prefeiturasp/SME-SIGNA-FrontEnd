import { describe, it, expect, vi, beforeEach, afterAll, type Mock } from "vitest";
import axios from "axios";
import { cookies } from "next/headers";
import { getCargos } from "@/actions/cargos";
import { ICargoType } from "@/types/cargos";

vi.mock("axios");
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const makeCookieStore = (token?: string): CookieStore =>
  ({
    get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
  } as unknown as CookieStore);

const fakeCargos: ICargoType[] = [
  { codigoCargo: 1, nomeCargo: "Diretor de Escola" },
  { codigoCargo: 2, nomeCargo: "Assistente de Diretor" },
];

describe("getCargos", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("retorna a lista de cargos com sucesso", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
    (axios.get as Mock).mockResolvedValueOnce({ data: fakeCargos });

    const result = await getCargos();

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.exemplo.com/designacao/unidade/cargos/",
      {
        headers: {
          Authorization: "Bearer token-123",
        },
      }
    );
    expect(result).toEqual(fakeCargos);
  });

  it("realiza a requisição sem token quando o cookie não está presente", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore(undefined));
    (axios.get as Mock).mockResolvedValueOnce({ data: fakeCargos });

    const result = await getCargos();

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.exemplo.com/designacao/unidade/cargos/",
      {
        headers: {
          Authorization: "Bearer undefined",
        },
      }
    );
    expect(result).toEqual(fakeCargos);
  });

  it("lança erro quando a API falhar", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
    (axios.get as Mock).mockRejectedValueOnce(new Error("Network error"));

    await expect(getCargos()).rejects.toThrow("Não foi possível buscar os cargos");
  });
});
