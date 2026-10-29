import {
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
  vi,
  type Mock,
} from "vitest";
import axios from "axios";
import { getUnidadesCadastradasAction } from "@/actions/unidades-cadastradas";
import { cookies } from "next/headers";

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    default: { ...actual.default, get: vi.fn() },
  };
});

const axiosGetMock = axios.get as Mock;
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const cookiesMock = cookies as Mock;

describe("getUnidadesCadastradasAction", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
    const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });
    cookiesMock.mockReturnValue({ get: getMock });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("retorna success true com as unidades da API", async () => {
    const payload = [
      { dre: "108800", dre_nome: "DRE BUTANTA", ue: "019453", ue_nome: "EMEF - ALIPIO" },
    ];
    axiosGetMock.mockResolvedValueOnce({ data: payload });

    const result = await getUnidadesCadastradasAction();

    expect(axiosGetMock).toHaveBeenCalledWith(
      "https://api.exemplo.com/designacao/unidade/cadastradas/",
      { headers: { Authorization: "Bearer fake-auth-token" } }
    );
    expect(result).toEqual({ success: true, data: payload });
  });

  it("retorna mensagem de erro interno quando status 500", async () => {
    axiosGetMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500, data: { detail: "Erro interno ao listar unidades" } },
    });

    const result = await getUnidadesCadastradasAction();

    expect(result).toEqual({ success: false, error: "Erro interno no servidor" });
  });

  it("retorna o detail da API quando presente", async () => {
    axiosGetMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401, data: { detail: "Token inválido" } },
    });

    const result = await getUnidadesCadastradasAction();

    expect(result).toEqual({ success: false, error: "Token inválido" });
  });

  it("retorna mensagem padrão para erros sem detail", async () => {
    axiosGetMock.mockRejectedValueOnce(new Error("Network Error"));

    const result = await getUnidadesCadastradasAction();

    expect(result).toEqual({
      success: false,
      error: "Não foi possível buscar as unidades cadastradas",
    });
  });
});
