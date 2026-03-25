import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import axios from "axios";
import { cookies } from "next/headers";

import { getImpedimentosAction } from "./tipos-impedimentos";

vi.mock("axios");
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const axiosMock = axios as unknown as {
  get: Mock;
};

const cookiesMock = cookies as Mock;

describe("getImpedimentosAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://fake-api";
  });

  it("deve retornar dados com sucesso", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "fake-token" }),
    });

    const fakeData = [
      { value: 1, label: "Licença médica" },
      { value: 2, label: "Férias" },
    ];

    axiosMock.get.mockResolvedValue({
      data: fakeData,
    });

    const result = await getImpedimentosAction();

    expect(result).toEqual({
      success: true,
      data: fakeData,
    });

    expect(axiosMock.get).toHaveBeenCalledWith(
      "http://fake-api/designacao/designacoes/impedimentos/",
      {
        headers: {
          Authorization: "Bearer fake-token",
        },
      }
    );
  });

  it("deve retornar erro quando não houver token", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    const result = await getImpedimentosAction();

    expect(result).toEqual({
      success: false,
      error: "Usuário não autenticado",
    });

    expect(axiosMock.get).not.toHaveBeenCalled();
  });

  it("deve tratar erro 401", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "fake-token" }),
    });

    axiosMock.get.mockRejectedValue({
      response: {
        status: 401,
      },
    });

    const result = await getImpedimentosAction();

    expect(result).toEqual({
      success: false,
      error: "Não autorizado. Faça login novamente.",
    });
  });

  it("deve tratar erro 500", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "fake-token" }),
    });

    axiosMock.get.mockRejectedValue({
      response: {
        status: 500,
      },
    });

    const result = await getImpedimentosAction();

    expect(result).toEqual({
      success: false,
      error: "Erro ao buscar impedimentos",
    });
  });

  it("deve usar mensagem da API quando existir detail", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "fake-token" }),
    });

    axiosMock.get.mockRejectedValue({
      response: {
        status: 400,
        data: {
          detail: "Erro específico da API",
        },
      },
    });

    const result = await getImpedimentosAction();

    expect(result).toEqual({
      success: false,
      error: "Erro específico da API",
    });
  });

  it("deve usar mensagem genérica quando não houver detalhe", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "fake-token" }),
    });

    axiosMock.get.mockRejectedValue(new Error("Erro desconhecido"));

    const result = await getImpedimentosAction();

    expect(result).toEqual({
      success: false,
      error: "Erro ao buscar impedimentos",
    });
  });
});