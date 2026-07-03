import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApostilaInsubsistenciaAction } from "./apostila-insubsistencia-criar";

const postWithAuthMock = vi.fn();

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: (...args: unknown[]) => postWithAuthMock(...args),
}));

describe("ApostilaInsubsistenciaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama postWithAuth com endpoint e mensagem padrão corretos", async () => {
    const payload = {
      ato_pai: 7,
      numero_portaria: "001",
      sei_numero: "6016.2026/0001-1",
      ano_vigente: "2026",
      doc: "2026-03-02",
      observacoes: "Teste",
      texto_apostila: "Texto",
    };
    const expectedResponse = { success: true, data: { id: 10 } };
    postWithAuthMock.mockResolvedValue(expectedResponse);

    const result = await ApostilaInsubsistenciaAction(payload);

    expect(postWithAuthMock).toHaveBeenCalledWith(
      "/designacao/v2/insubsistencias/",
      payload,
      "Erro ao salvar apostila"
    );
    expect(result).toEqual(expectedResponse);
  });
});
