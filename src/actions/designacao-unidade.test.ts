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
import { getDesignacaoUnidadeAction } from "@/actions/designacao-unidade";

vi.mock("axios");

const axiosGetMock = axios.get as Mock;

describe("getDesignacaoUnidadeAction", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("retorna success true com os dados da API", async () => {
    const payload = {
      funcionarios_unidade: {},
      cargos: [{ nomeCargo: "Professor", codigoCargo: "123" }],
    };

    axiosGetMock.mockResolvedValueOnce({ data: payload });

    const result = await getDesignacaoUnidadeAction("999999");

    expect(axiosGetMock).toHaveBeenCalledWith(
      "https://api.exemplo.com/designacao/unidade",
      { params: { codigo_ue: "999999" } },
    );
    expect(result).toEqual({ success: true, data: payload });
  });

  it("retorna erro interno para status 500", async () => {
    axiosGetMock.mockRejectedValueOnce({ response: { status: 500 } });

    const result = await getDesignacaoUnidadeAction("999999");

    expect(result).toEqual({
      success: false,
      error: "Erro interno no servidor",
    });
  });

  it("retorna detail quando disponível no erro da API", async () => {
    axiosGetMock.mockRejectedValueOnce({
      response: { status: 400, data: { detail: "Unidade inválida" } },
      message: "Falha genérica",
    });

    const result = await getDesignacaoUnidadeAction("999999");

    expect(result).toEqual({
      success: false,
      error: "Unidade inválida",
    });
  });

  it("retorna message quando não há detail", async () => {
    axiosGetMock.mockRejectedValueOnce({ message: "Falha de rede" });

    const result = await getDesignacaoUnidadeAction("999999");

    expect(result).toEqual({
      success: false,
      error: "Falha de rede",
    });
  });

  it("retorna mensagem padrão quando erro não tem status/detail/message", async () => {
    axiosGetMock.mockRejectedValueOnce({});

    const result = await getDesignacaoUnidadeAction("999999");

    expect(result).toEqual({
      success: false,
      error: "Erro na autenticação",
    });
  });
});

