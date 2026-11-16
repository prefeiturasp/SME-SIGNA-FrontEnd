import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { gerarPreviewTextoSeiAction } from "@/actions/textos-sei";
import { useGerarPreviewTextoSei, type PedidoPreviewTextoSei } from "./useGerarPreviewTextoSei";

const { buscarDescricoesMock, notificationErrorMock } = vi.hoisted(() => ({
  buscarDescricoesMock: vi.fn(),
  notificationErrorMock: vi.fn(),
}));

vi.mock("./useBuscarDescricoesCargosParaPortaria", () => ({
  useBuscarDescricoesCargosParaPortaria: () => buscarDescricoesMock,
}));

vi.mock("@/actions/textos-sei", () => ({
  gerarPreviewTextoSeiAction: vi.fn(),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({ error: notificationErrorMock }),
}));

const montarDados = vi.fn((descricoes: Record<string, string | null>) => ({ CARGO: descricoes["3360"] ?? "" }));

const pedido: PedidoPreviewTextoSei = {
  tipo_portaria: "CESSACAO",
  tipo_ato_pai: "DESIGNACAO",
  tipo_cargo: "CARGO_VAGO",
  codigosCargos: [3360],
  montarDados,
};

describe("useGerarPreviewTextoSei", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarDescricoesMock.mockResolvedValue({ "3360": "DIRETOR DE ESCOLA" });
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValue({
      success: true,
      data: { modelo_portaria_id: 7, texto: "TEXTO" },
    });
  });

  it("busca os cargos, monta as variáveis e devolve a prévia", async () => {
    const { result } = renderHook(() => useGerarPreviewTextoSei());

    let preview: Awaited<ReturnType<typeof result.current.gerarPreview>> = null;
    await act(async () => {
      preview = await result.current.gerarPreview(pedido);
    });

    expect(preview).toEqual({ modelo_portaria_id: 7, texto: "TEXTO" });
    expect(buscarDescricoesMock).toHaveBeenCalledWith([3360]);
    expect(montarDados).toHaveBeenCalledWith({ "3360": "DIRETOR DE ESCOLA" });
    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith({
      tipo_portaria: "CESSACAO",
      tipo_ato_pai: "DESIGNACAO",
      tipo_cargo: "CARGO_VAGO",
      dados: { CARGO: "DIRETOR DE ESCOLA" },
    });
    expect(result.current.gerandoPreview).toBe(false);
  });

  it("indica carregamento enquanto gera", async () => {
    let liberar: () => void = () => undefined;
    buscarDescricoesMock.mockReturnValueOnce(
      new Promise((resolve) => {
        liberar = () => resolve({ "3360": "DIRETOR DE ESCOLA" });
      })
    );
    const { result } = renderHook(() => useGerarPreviewTextoSei());

    let promessa: Promise<unknown> = Promise.resolve();
    act(() => {
      promessa = result.current.gerarPreview(pedido);
    });
    expect(result.current.gerandoPreview).toBe(true);

    await act(async () => {
      liberar();
      await promessa;
    });
    expect(result.current.gerandoPreview).toBe(false);
  });

  it("não pede a prévia quando a consulta dos cargos falha", async () => {
    buscarDescricoesMock.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useGerarPreviewTextoSei());

    let preview: unknown = "não chamado";
    await act(async () => {
      preview = await result.current.gerarPreview(pedido);
    });

    expect(preview).toBeNull();
    expect(gerarPreviewTextoSeiAction).not.toHaveBeenCalled();
    expect(result.current.gerandoPreview).toBe(false);
  });

  it("avisa e devolve null quando a prévia falha", async () => {
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({ success: false, error: "sem modelo" });
    const { result } = renderHook(() => useGerarPreviewTextoSei());

    let preview: unknown = "não chamado";
    await act(async () => {
      preview = await result.current.gerarPreview(pedido);
    });

    expect(preview).toBeNull();
    expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Erro ao gerar o texto da portaria: sem modelo" });
    expect(result.current.gerandoPreview).toBe(false);
  });

  it("libera o carregamento mesmo quando a montagem lança erro", async () => {
    montarDados.mockImplementationOnce(() => {
      throw new Error("A descrição do cargo 3360 não foi carregada.");
    });
    const { result } = renderHook(() => useGerarPreviewTextoSei());

    await act(async () => {
      await expect(result.current.gerarPreview(pedido)).rejects.toThrow("não foi carregada");
    });
    expect(result.current.gerandoPreview).toBe(false);
  });
});
