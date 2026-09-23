import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { baixarLauda } from "./baixarLauda";

const { baixarArquivoMock } = vi.hoisted(() => ({ baixarArquivoMock: vi.fn() }));

vi.mock("./baixarArquivo", () => ({
  baixarArquivo: (...args: unknown[]) => baixarArquivoMock(...args),
}));

const fetchMock = vi.fn();

describe("baixarLauda", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("envia ids e formato PDF e baixa o arquivo com o nome do Content-Disposition", async () => {
    const blob = new Blob(["%PDF"], { type: "application/pdf" });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "Content-Disposition": 'attachment; filename="lauda-2026-09-18_10-00-00.pdf"' }),
      blob: () => Promise.resolve(blob),
    });

    const result = await baixarLauda([3, 1], "PDF");

    expect(fetchMock).toHaveBeenCalledWith("/api/lauda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [3, 1], formato: "PDF" }),
    });
    expect(baixarArquivoMock).toHaveBeenCalledWith(blob, "lauda-2026-09-18_10-00-00.pdf");
    expect(result).toEqual({ success: true });
  });

  it("usa nome padrão com timestamp quando não há Content-Disposition", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-18T14:05:09"));

    const blob = new Blob(["%PDF"], { type: "application/pdf" });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      blob: () => Promise.resolve(blob),
    });

    await baixarLauda([1], "PDF");

    expect(baixarArquivoMock).toHaveBeenCalledWith(blob, "lauda-2026-09-18_14-05-09.pdf");
  });

  it("envia formato WORD e usa extensão .docx no nome padrão", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-18T14:05:09"));

    const blob = new Blob(["PK"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      blob: () => Promise.resolve(blob),
    });

    const result = await baixarLauda([5], "WORD");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/lauda",
      expect.objectContaining({ body: JSON.stringify({ ids: [5], formato: "WORD" }) })
    );
    expect(baixarArquivoMock).toHaveBeenCalledWith(blob, "lauda-2026-09-18_14-05-09.docx");
    expect(result).toEqual({ success: true });
  });

  it("retorna o detail do backend quando a resposta não é ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: "Atos já publicados: 1, 2" }),
    });

    const result = await baixarLauda([1, 2], "PDF");

    expect(result).toEqual({ success: false, error: "Atos já publicados: 1, 2" });
    expect(baixarArquivoMock).not.toHaveBeenCalled();
  });

  it("retorna mensagem padrão quando o corpo do erro não é JSON", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("invalid json")),
    });

    const result = await baixarLauda([1], "PDF");

    expect(result).toEqual({ success: false, error: "Erro ao gerar a lauda" });
  });

  it("retorna mensagem padrão quando o fetch falha", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network"));

    const result = await baixarLauda([1], "PDF");

    expect(result).toEqual({ success: false, error: "Erro ao gerar a lauda" });
    expect(baixarArquivoMock).not.toHaveBeenCalled();
  });
});
