import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useNovoAto } from "./useNovoAto";
import {
  buscarCessacaoPorPortariaAction,
  buscarDesignacaoPorPortariaAction,
  buscarInsubsistenciaPorPortariaAction,
} from "@/actions/busca-ato-por-portaria";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/actions/busca-ato-por-portaria", () => ({
  buscarDesignacaoPorPortariaAction: vi.fn(),
  buscarCessacaoPorPortariaAction: vi.fn(),
  buscarInsubsistenciaPorPortariaAction: vi.fn(),
}));

const erroNaoEncontrado = { success: false as const, error: "Não encontrado" };

describe("useNovoAto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cessacao: busca designação pela portaria e navega para /pages/cessacao", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 10 } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("cessacao", "100/2026");
    });

    expect(buscarDesignacaoPorPortariaAction).toHaveBeenCalledWith({ portaria: "100/2026" });
    expect(pushMock).toHaveBeenCalledWith("/pages/cessacao?id=10");
    expect(sucesso).toBe(true);
    expect(result.current.errorMessage).toBeNull();
  });

  it("insubsistencia: quando a portaria é de designação, navega com origem=designacao sem consultar cessação", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 20 } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("insubsistencia", "200/2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/insubsistencia?id=20&origem=designacao");
    expect(buscarCessacaoPorPortariaAction).not.toHaveBeenCalled();
  });

  it("insubsistencia: quando não é designação, tenta cessação e navega com origem=cessacao", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 21, ato_pai_id: 11 } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("insubsistencia", "210/2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/insubsistencia?id=11&origem=cessacao");
  });

  it("insubsistencia: quando nem designação nem cessação são encontradas, define mensagem de erro", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("insubsistencia", "220/2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Nenhum registro foi encontrado para essa portaria."
    );
  });

  it("tornar-sem-efeito: busca insubsistência pela portaria e navega para /pages/tornar-sem-efeito", async () => {
    vi.mocked(buscarInsubsistenciaPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 30 } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("tornar-sem-efeito", "300/2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/tornar-sem-efeito?id=30");
  });

  it("anular-apostila: quando a portaria é de designação com apostila, navega direto para /pages/anular-apostila", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 40, apostilas: [{ id: 400 }] } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("anular-apostila", "400/2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/anular-apostila?id=400");
    expect(buscarCessacaoPorPortariaAction).not.toHaveBeenCalled();
  });

  it("anular-apostila: quando a designação não tem apostila, informa que não há apostila vinculada", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 41, apostilas: [] } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("anular-apostila", "410/2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Essa portaria não possui apostila vinculada para anular."
    );
  });

  it("anular-apostila: quando não é designação, tenta cessação e navega com o id da apostila da cessação", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 50, apostilas: [{ id: 500 }] } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("anular-apostila", "500/2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/anular-apostila?id=500");
  });

  it("anular-apostila: quando a cessação não tem apostila, informa que não há apostila vinculada", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 51, apostilas: [] } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("anular-apostila", "510/2026");
    });

    expect(sucesso).toBe(false);
    expect(result.current.errorMessage).toBe(
      "Essa portaria não possui apostila vinculada para anular."
    );
  });

  it("anular-apostila: quando nem designação nem cessação são encontradas, define mensagem de não encontrado", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("anular-apostila", "520/2026");
    });

    expect(sucesso).toBe(false);
    expect(result.current.errorMessage).toBe(
      "Nenhum registro foi encontrado para essa portaria."
    );
  });

  it("apostila: quando portaria é de designação, navega com origem=designacao sem consultar cessação", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 50 } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("apostila", "500/2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/apostila?id=50&origem=designacao");
    expect(buscarCessacaoPorPortariaAction).not.toHaveBeenCalled();
  });

  it("apostila: quando não é designação, tenta cessação e navega com origem=cessacao", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 60, ato_pai_id: 12 } as any,
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("apostila", "600/2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/apostila?id=12&origem=cessacao");
  });

  it("apostila: quando nem designação nem cessação são encontradas, define mensagem de erro", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("apostila", "700/2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Nenhum registro foi encontrado para essa portaria."
    );
  });

  it("define errorMessage e não navega quando a portaria não é encontrada", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("cessacao", "999/2026");
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toBe(
        "Nenhum registro foi encontrado para essa portaria."
      );
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("limparErro limpa a mensagem de erro", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("cessacao", "999/2026");
    });
    expect(result.current.errorMessage).not.toBeNull();

    act(() => {
      result.current.limparErro();
    });

    expect(result.current.errorMessage).toBeNull();
  });
});
