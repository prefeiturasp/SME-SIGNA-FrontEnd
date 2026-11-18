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

    const result = await baixarLauda([3, 1], "PDF", "NUMERO_PORTARIA");

    expect(fetchMock).toHaveBeenCalledWith("/download/lauda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [3, 1], formato: "PDF", ordenacao: "NUMERO_PORTARIA" }),
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

    await baixarLauda([1], "PDF", "DRE");

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

    const result = await baixarLauda([5], "WORD", "TITULO");

    expect(fetchMock).toHaveBeenCalledWith(
      "/download/lauda",
      expect.objectContaining({ body: JSON.stringify({ ids: [5], formato: "WORD", ordenacao: "TITULO" }) })
    );
    expect(baixarArquivoMock).toHaveBeenCalledWith(blob, "lauda-2026-09-18_14-05-09.docx");
    expect(result).toEqual({ success: true });
  });

  it("envia formato CSV e baixa o blob do backend sem converter (mantém o BOM UTF-8)", async () => {
    // BOM (EF BB BF) + "Nº" em UTF-8
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0x4e, 0xc2, 0xba]);
    const blob = new Blob([bytes], { type: "text/csv; charset=utf-8" });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="lauda-2026-11-17_09-30-00.csv"',
      }),
      blob: () => Promise.resolve(blob),
    });

    const result = await baixarLauda([7, 8], "CSV", "DRE");

    expect(fetchMock).toHaveBeenCalledWith("/download/lauda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [7, 8], formato: "CSV", ordenacao: "DRE" }),
    });
    expect(baixarArquivoMock).toHaveBeenCalledWith(blob, "lauda-2026-11-17_09-30-00.csv");
    const blobBaixado = baixarArquivoMock.mock.calls[0][0] as Blob;
    expect(new Uint8Array(await blobBaixado.arrayBuffer())).toEqual(bytes);
    expect(result).toEqual({ success: true });
  });

  it("usa extensão .csv no nome padrão quando não há Content-Disposition", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-17T09:30:00"));

    const blob = new Blob(["\uFEFFPORTARIA"], { type: "text/csv; charset=utf-8" });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      blob: () => Promise.resolve(blob),
    });

    await baixarLauda([1], "CSV", "NUMERO_PORTARIA");

    expect(baixarArquivoMock).toHaveBeenCalledWith(blob, "lauda-2026-11-17_09-30-00.csv");
  });

  it("retorna o detail do backend quando a resposta não é ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: "Atos já publicados: 1, 2" }),
    });

    const result = await baixarLauda([1, 2], "PDF", "DRE");

    expect(result).toEqual({ success: false, error: "Atos já publicados: 1, 2" });
    expect(baixarArquivoMock).not.toHaveBeenCalled();
  });

  it("retorna mensagem padrão quando o corpo do erro não é JSON", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("invalid json")),
    });

    const result = await baixarLauda([1], "PDF", "DRE");

    expect(result).toEqual({ success: false, error: "Erro ao gerar a lauda" });
  });

  it("retorna mensagem padrão quando o fetch falha", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network"));

    const result = await baixarLauda([1], "PDF", "DRE");

    expect(result).toEqual({ success: false, error: "Erro ao gerar a lauda" });
    expect(baixarArquivoMock).not.toHaveBeenCalled();
  });
});
