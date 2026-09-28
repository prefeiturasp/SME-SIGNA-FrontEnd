import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { POST } from "./route";

const { axiosPostMock } = vi.hoisted(() => ({ axiosPostMock: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: { ...actual.default, post: axiosPostMock, isAxiosError: actual.default.isAxiosError },
  };
});

const cookiesMock = vi.mocked(cookies);

const mockToken = (token?: string) => {
  cookiesMock.mockResolvedValue({
    get: () => (token ? { value: token } : undefined),
  } as unknown as Awaited<ReturnType<typeof cookies>>);
};

const buildRequest = (body: unknown) =>
  new Request("http://localhost/download/lauda", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const buildAxiosError = (status: number, data: unknown) => {
  const error = new AxiosError("Request failed");
  error.response = {
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  };
  return error;
};

describe("POST /download/lauda", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://backend/api");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("retorna 401 sem cookie de autenticação", async () => {
    mockToken(undefined);

    const response = await POST(buildRequest({ ids: [1] }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ detail: "Usuário não autenticado" });
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it("repassa o PDF do backend com Content-Type e Content-Disposition", async () => {
    mockToken("token-123");
    const pdf = new TextEncoder().encode("%PDF-1.4").buffer;
    axiosPostMock.mockResolvedValueOnce({
      data: pdf,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="lauda-2026-09-18_10-00-00.pdf"',
      },
    });

    const response = await POST(buildRequest({ ids: [2, 1], formato: "PDF" }));

    expect(axiosPostMock).toHaveBeenCalledWith(
      "http://backend/api/designacao/portarias/lauda/",
      { ids: [2, 1], formato: "PDF" },
      {
        headers: { Authorization: "Bearer token-123" },
        responseType: "arraybuffer",
      }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="lauda-2026-09-18_10-00-00.pdf"'
    );
    expect(new TextDecoder().decode(await response.arrayBuffer())).toBe("%PDF-1.4");
  });

  it("repassa o Content-Type do Word quando o formato é WORD", async () => {
    mockToken("token-123");
    const docxType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    axiosPostMock.mockResolvedValueOnce({
      data: new TextEncoder().encode("PK").buffer,
      headers: {
        "content-type": docxType,
        "content-disposition": 'attachment; filename="lauda-2026-09-18_10-00-00.docx"',
      },
    });

    const response = await POST(buildRequest({ ids: [1], formato: "WORD" }));

    expect(axiosPostMock).toHaveBeenCalledWith(
      expect.any(String),
      { ids: [1], formato: "WORD" },
      expect.any(Object)
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(docxType);
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="lauda-2026-09-18_10-00-00.docx"'
    );
  });

  it("não envia Content-Type/Content-Disposition quando o backend não informa", async () => {
    mockToken("token-123");
    axiosPostMock.mockResolvedValueOnce({
      data: new ArrayBuffer(0),
      headers: {},
    });

    const response = await POST(buildRequest({ ids: [1] }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBeNull();
    expect(response.headers.get("Content-Disposition")).toBeNull();
  });

  it("repassa status e detail do erro do backend (corpo binário)", async () => {
    mockToken("token-123");
    const body = new TextEncoder().encode(
      JSON.stringify({ detail: "Atos já publicados: 1, 2" })
    ).buffer;
    axiosPostMock.mockRejectedValueOnce(buildAxiosError(400, body));

    const response = await POST(buildRequest({ ids: [1, 2] }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ detail: "Atos já publicados: 1, 2" });
  });

  it("usa mensagem padrão quando o JSON do erro não traz detail", async () => {
    mockToken("token-123");
    const body = new TextEncoder().encode(JSON.stringify({ ids: [1] })).buffer;
    axiosPostMock.mockRejectedValueOnce(buildAxiosError(400, body));

    const response = await POST(buildRequest({ ids: [1] }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ detail: "Erro ao gerar a lauda" });
  });

  it("usa mensagem padrão quando o corpo do erro não é JSON", async () => {
    mockToken("token-123");
    const body = new TextEncoder().encode("<html>erro</html>").buffer;
    axiosPostMock.mockRejectedValueOnce(buildAxiosError(502, body));

    const response = await POST(buildRequest({ ids: [1] }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ detail: "Erro ao gerar a lauda" });
  });

  it("retorna 500 com mensagem padrão quando não há resposta do backend", async () => {
    mockToken("token-123");
    axiosPostMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const response = await POST(buildRequest({ ids: [1] }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ detail: "Erro ao gerar a lauda" });
  });
});
