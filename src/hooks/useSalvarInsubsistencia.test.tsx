import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useSalvarInsubsistencia } from "./useSalvarInsubsistencia";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/actions/insubsistencia-criar", () => ({
  insubsistenciaAction: vi.fn(),
}));

const { insubsistenciaAction } = await import("@/actions/insubsistencia-criar");

// ── Helpers ───────────────────────────────────────────────────────────────────

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = "TestQueryClientProvider";

  return Wrapper;
};

const valuesMock = {
  insubsistencia: {
    numero_portaria: "001",
    ano: "2026",
    numero_sei: "6016.2026/0001-1",
    doc: "DOC-01",
    observacoes: "obs teste",
    tipo_insubsistencia: "designacao",
  },
};

// ── Testes ────────────────────────────────────────────────────────────────────

describe("useSalvarInsubsistencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama insubsistenciaAction com o payload mapeado corretamente (designacao)", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 1 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ values: valuesMock, designacaoId: 10 });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith({
      ato_pai: 10,
      numero_portaria: "001",
      ano_vigente: "2026",
      sei_numero: "6016.2026/0001-1",
      doc: "DOC-01",
      observacoes: "obs teste",
    });
  });

  it("usa cessacaoId como ato_pai quando tipo_insubsistencia é cessacao", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 1 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    const valuesCessacao = {
      insubsistencia: { ...valuesMock.insubsistencia, tipo_insubsistencia: "cessacao" },
    };

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesCessacao,
        designacaoId: 10,
        cessacaoId: 55,
      });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      expect.objectContaining({ ato_pai: 55 })
    );
  });

  it("retorna os dados quando a action é bem-sucedida", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 99 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    let response: unknown;

    await act(async () => {
      response = await result.current.mutateAsync({ values: valuesMock, designacaoId: 5 });
    });

    expect(response).toEqual({ id: 99 });
  });

  it("lança erro quando response.success é false", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: false,
      error: "Erro ao salvar insubsistência",
    });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({ values: valuesMock, designacaoId: 5 })
    ).rejects.toThrow("Erro ao salvar insubsistência");
  });

  it("mantém isError=true após falha", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: false,
      error: "Erro API",
    });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ values: valuesMock, designacaoId: 5 });
      } catch {}
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("funciona sem designacaoId (undefined)", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: {} });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ values: valuesMock });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      expect.objectContaining({ ato_pai: undefined })
    );
  });
});
