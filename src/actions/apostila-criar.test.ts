import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApostilaBody } from "@/types/apostila";
import { ApostilaAction } from "./apostila-criar";

const postWithAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: postWithAuthMock,
}));

const payloadMock: ApostilaBody = {
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

describe("ApostilaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama postWithAuth com endpoint, payload e mensagem padrão de erro", async () => {
    postWithAuthMock.mockResolvedValueOnce({ success: true, data: { id: 1 } });

    const result = await ApostilaAction(payloadMock);

    expect(result).toEqual({ success: true, data: { id: 1 } });
    expect(postWithAuthMock).toHaveBeenCalledWith(
      "/designacao/apostilas/",
      payloadMock,
      "Erro ao salvar apostila",
    );
  });

  it("repassa retorno de erro do postWithAuth", async () => {
    postWithAuthMock.mockResolvedValueOnce({
      success: false,
      error: "Número de portaria inválido",
      field: "numero_portaria",
    });

    const result = await ApostilaAction(payloadMock);

    expect(result).toEqual({
      success: false,
      error: "Número de portaria inválido",
      field: "numero_portaria",
    });
  });
});
