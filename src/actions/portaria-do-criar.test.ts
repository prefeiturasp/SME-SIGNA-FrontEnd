import { describe, expect, it, vi } from "vitest";
import { PortariaDOAction } from "./portaria-do-criar";

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: vi.fn(),
}));

const { postWithAuth } = await import("@/lib/serverRequest");

describe("PortariaDOAction", () => {
  it("deve chamar postWithAuth com endpoint, payload e mensagem corretos", async () => {
    const payload = {
      ids: [1, 2],
      data_publicacao: "2026-05-14T10:00:00.000Z",
    };

    vi.mocked(postWithAuth).mockResolvedValue({
      success: true,
      data: { ids: [1, 2] },
    });

    const response = await PortariaDOAction(payload);

    expect(postWithAuth).toHaveBeenCalledWith(
      "/designacao/portarias-do/",
      payload,
      "Erro ao salvar portaria D.O"
    );
    expect(response).toEqual({
      success: true,
      data: { ids: [1, 2] },
    });
  });
});
