import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApostilaBody } from "@/types/apostila";
import { ApostilaAction } from "./apostila-criar";

const { postWithAuthMock, patchWithAuthMock } = vi.hoisted(() => ({
  postWithAuthMock: vi.fn(),
  patchWithAuthMock: vi.fn(),
}));

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: postWithAuthMock,
  patchWithAuth: patchWithAuthMock,
}));

const payloadCriacao: ApostilaBody = {
  ato_pai: 10,
  sei_numero: "SEI-123",
  numero_portaria: "123",
  doc: "DOC-123",
  observacao: "Observação",
  texto_sei: "Texto SEI",
  alteracoes: [
    {
      campo_alterado: "numero_portaria",
      valor_novo: "456",
    },
  ],
};

const payloadEdicao: ApostilaBody = {
  ...payloadCriacao,
  id: 88,
};

describe("ApostilaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama postWithAuth ao criar apostila sem id", async () => {
    postWithAuthMock.mockResolvedValueOnce({ success: true, data: { id: 1 } });

    const result = await ApostilaAction(payloadCriacao);

    expect(result).toEqual({ success: true, data: { id: 1 } });
    expect(postWithAuthMock).toHaveBeenCalledWith(
      "/designacao/apostilas/",
      payloadCriacao,
      "Erro ao salvar apostila",
    );
    expect(patchWithAuthMock).not.toHaveBeenCalled();
  });

  it("chama patchWithAuth ao editar apostila com id", async () => {
    patchWithAuthMock.mockResolvedValueOnce({ success: true, data: { id: 88 } });

    const result = await ApostilaAction(payloadEdicao);

    expect(result).toEqual({ success: true, data: { id: 88 } });
    expect(patchWithAuthMock).toHaveBeenCalledWith(
      "/designacao/apostilas/88/",
      payloadEdicao,
      "Erro ao salvar apostila",
    );
    expect(postWithAuthMock).not.toHaveBeenCalled();
  });

  it("repassa retorno de erro do postWithAuth", async () => {
    postWithAuthMock.mockResolvedValueOnce({
      success: false,
      error: "Número de portaria inválido",
      field: "numero_portaria",
    });

    const result = await ApostilaAction(payloadCriacao);

    expect(result).toEqual({
      success: false,
      error: "Número de portaria inválido",
      field: "numero_portaria",
    });
  });

  it("repassa retorno de erro do patchWithAuth", async () => {
    patchWithAuthMock.mockResolvedValueOnce({
      success: false,
      error: "Apostila não encontrada",
    });

    const result = await ApostilaAction(payloadEdicao);

    expect(result).toEqual({
      success: false,
      error: "Apostila não encontrada",
    });
  });
});
