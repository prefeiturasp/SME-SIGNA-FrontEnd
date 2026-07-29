import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchApostilaByIdAction } from "@/actions/apostila";
import { useFetchApostilaById } from "./useVisualizarApostila";

vi.mock("@/actions/apostila", () => ({
  fetchApostilaByIdAction: vi.fn(),
}));

describe("useFetchApostilaById", () => {
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

  it("busca dados quando id é válido", async () => {
    vi.mocked(fetchApostilaByIdAction).mockResolvedValueOnce({
      success: true,
      data: { id: 7, numero_portaria: "100" } as never,
    });

    const { result } = renderHook(() => useFetchApostilaById(7), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchApostilaByIdAction).toHaveBeenCalledWith(7);
    expect(result.current.data).toEqual({ id: 7, numero_portaria: "100" });
  });

  it("retorna erro quando action devolve success false", async () => {
    vi.mocked(fetchApostilaByIdAction).mockResolvedValueOnce({
      success: false,
      error: "Falha ao buscar apostila",
    });

    const { result } = renderHook(() => useFetchApostilaById(12), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("Falha ao buscar apostila");
  });

  it("não executa query quando id é 0", () => {
    const { result } = renderHook(() => useFetchApostilaById(0), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isLoading).toBe(false);
    expect(fetchApostilaByIdAction).not.toHaveBeenCalled();
  });
});
