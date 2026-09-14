import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchInsubsistenciasByIdAction } from "@/actions/insubsistencia-criar";
import { useFetchInsubsistenciasById } from "./useVisualizarInsubsistencia";
import type { InsubsistenciaRead } from "@/types/insubsistencia";

vi.mock("@/actions/insubsistencia-criar", () => ({
  fetchInsubsistenciasByIdAction: vi.fn(),
}));

describe("useFetchInsubsistenciasById", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it("busca os dados quando id é válido", async () => {
    vi.mocked(fetchInsubsistenciasByIdAction).mockResolvedValueOnce({
      success: true,
      data: { id: 7, numero_portaria: "100" } as unknown as InsubsistenciaRead,
    });

    const { result } = renderHook(() => useFetchInsubsistenciasById(7), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchInsubsistenciasByIdAction).toHaveBeenCalledWith(7);
    expect(result.current.data).toEqual({ id: 7, numero_portaria: "100" });
  });

  it("retorna erro quando action devolve success false", async () => {
    vi.mocked(fetchInsubsistenciasByIdAction).mockResolvedValueOnce({
      success: false,
      error: "Falha ao buscar insubsistência",
    });

    const { result } = renderHook(() => useFetchInsubsistenciasById(12), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("Falha ao buscar insubsistência");
  });

  it("não executa query quando id é 0", () => {
    const { result } = renderHook(() => useFetchInsubsistenciasById(0), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isLoading).toBe(false);
    expect(fetchInsubsistenciasByIdAction).not.toHaveBeenCalled();
  });
});
