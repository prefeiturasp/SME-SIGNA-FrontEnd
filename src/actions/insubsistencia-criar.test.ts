import { describe, it, expect, vi, beforeEach } from "vitest";
import { insubsistenciaAction } from "./insubsistencia-criar";
import { InsubsistenciaBody } from "@/types/insubsistencia";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: {
      post: vi.fn(),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

const { cookies } = await import("next/headers");
const axios = (await import("axios")).default;

// ── Helpers ───────────────────────────────────────────────────────────────────

const payloadBase: InsubsistenciaBody = {
  numero_portaria: "001",
  ano_vigente: "2026",
  sei_numero: "6016.2026/0001-1",
  doc: "DOC-01",
  observacoes: "obs",
  tipo_insubsistencia: "designacao",
  designacao: 10,
};

function buildCookieStore(token?: string) {
  return {
    get: vi.fn((key: string) =>
      key === "auth_token" && token ? { value: token } : undefined
    ),
  };
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe("insubsistenciaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://api.test";
  });

  it("retorna success:true com dados quando a requisição é bem-sucedida", async () => {
    vi.mocked(cookies).mockResolvedValue(buildCookieStore("meu-token") as never);
    vi.mocked(axios.post).mockResolvedValue({ data: { id: 42 } });

    const result = await insubsistenciaAction(payloadBase);

    expect(result).toEqual({ success: true, data: { id: 42 } });
    expect(axios.post).toHaveBeenCalledWith(
      "http://api.test/designacao/insubsistencias/",
      payloadBase,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer meu-token" }),
      })
    );
  });

  it("envia requisição sem Authorization quando não há cookie", async () => {
    vi.mocked(cookies).mockResolvedValue(buildCookieStore() as never);
    vi.mocked(axios.post).mockResolvedValue({ data: {} });

    await insubsistenciaAction(payloadBase);

    const callArgs = vi.mocked(axios.post).mock.calls[0];
    expect(callArgs[2]).toEqual(
      expect.objectContaining({
        headers: expect.not.objectContaining({ Authorization: expect.anything() }),
      })
    );
  });

  it("retorna erro genérico quando nenhuma condição específica bate", async () => {
    vi.mocked(cookies).mockResolvedValue(buildCookieStore("tk") as never);
    vi.mocked(axios.post).mockRejectedValue({ response: undefined, message: "Network Error" });

    const result = await insubsistenciaAction(payloadBase);

    expect(result).toEqual({ success: false, error: "Network Error", field: undefined });
  });

  it("retorna 'Erro interno no servidor' quando status é 500", async () => {
    vi.mocked(cookies).mockResolvedValue(buildCookieStore("tk") as never);
    vi.mocked(axios.post).mockRejectedValue({
      response: { status: 500, data: {} },
    });

    const result = await insubsistenciaAction(payloadBase);

    expect(result).toEqual({ success: false, error: "Erro interno no servidor", field: undefined });
  });

  it("extrai mensagem quando detail contém 'string'", async () => {
    vi.mocked(cookies).mockResolvedValue(buildCookieStore("tk") as never);
    vi.mocked(axios.post).mockRejectedValue({
      response: {
        status: 400,
        data: { detail: "valor inválido" },
      },
    });

    const result = await insubsistenciaAction(payloadBase);

    expect(result).toEqual({ success: false, error: "valor inválido", field: undefined });
  });

  it("retorna detail como mensagem quando não contém 'string'", async () => {
    vi.mocked(cookies).mockResolvedValue(buildCookieStore("tk") as never);
    vi.mocked(axios.post).mockRejectedValue({
      response: {
        status: 400,
        data: { detail: "Designação não encontrada" },
      },
    });

    const result = await insubsistenciaAction(payloadBase);

    expect(result).toEqual({ success: false, error: "Designação não encontrada", field: undefined });
  });

  it("inclui field quando a resposta de erro o retorna", async () => {
    vi.mocked(cookies).mockResolvedValue(buildCookieStore("tk") as never);
    vi.mocked(axios.post).mockRejectedValue({
      response: {
        status: 400,
        data: { detail: "Campo inválido", field: "numero_portaria" },
      },
    });

    const result = await insubsistenciaAction(payloadBase);

    expect(result).toEqual({
      success: false,
      error: "Campo inválido",
      field: "numero_portaria",
    });
  });

  it("usa mensagem padrão quando não há response nem message", async () => {
    vi.mocked(cookies).mockResolvedValue(buildCookieStore("tk") as never);
    vi.mocked(axios.post).mockRejectedValue({});

    const result = await insubsistenciaAction(payloadBase);

    expect(result).toEqual({ success: false, error: "Erro ao salvar insubsistência", field: undefined });
  });
});
