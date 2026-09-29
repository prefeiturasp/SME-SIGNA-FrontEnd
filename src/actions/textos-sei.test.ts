import { beforeEach, describe, expect, it, vi } from "vitest";

const postWithAuthMock = vi.fn();

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: (...args: unknown[]) => postWithAuthMock(...args),
}));

describe("textos-sei actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gerarPreviewTextoSeiAction chama endpoint com payload e mensagem padrão", async () => {
    const { gerarPreviewTextoSeiAction } = await import("./textos-sei");

    const payload = {
      tipo_portaria: "DESIGNACAO",
      tipo_cargo: "CARGO_VAGO",
      dados: { NOME_SERVIDOR: "JOÃO DA SILVA" },
    };

    postWithAuthMock.mockResolvedValueOnce({
      success: true,
      data: { modelo_portaria_id: 7, texto: "Designa JOÃO DA SILVA." },
    });

    const result = await gerarPreviewTextoSeiAction(payload);

    expect(postWithAuthMock).toHaveBeenCalledWith(
      "/designacao/textos-sei/preview/",
      payload,
      "Erro ao gerar o texto da portaria",
    );
    expect(result).toEqual({
      success: true,
      data: { modelo_portaria_id: 7, texto: "Designa JOÃO DA SILVA." },
    });
  });

  it("gerarPreviewTextoSeiAction repassa a falha retornada por postWithAuth", async () => {
    const { gerarPreviewTextoSeiAction } = await import("./textos-sei");

    postWithAuthMock.mockResolvedValueOnce({
      success: false,
      error: "Não há modelo de portaria ativo cadastrado para este tipo de ato.",
    });

    const result = await gerarPreviewTextoSeiAction({
      tipo_portaria: "CESSACAO",
      tipo_ato_pai: "DESIGNACAO",
      tipo_cargo: "CARGO_VAGO",
      dados: {},
    });

    expect(result).toEqual({
      success: false,
      error: "Não há modelo de portaria ativo cadastrado para este tipo de ato.",
    });
  });
});
