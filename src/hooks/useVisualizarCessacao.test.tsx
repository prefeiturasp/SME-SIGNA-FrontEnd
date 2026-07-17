import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCessacaoByIdAction } from "@/actions/cessacao";
import { useFetchCessacaoById } from "./useVisualizarCessacao";

vi.mock("@/actions/cessacao", () => ({
  fetchCessacaoByIdAction: vi.fn(),
}));

describe("useFetchCessacaoById", () => {
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

  it("busca os dados quando o id é válido", async () => {
    vi.mocked(fetchCessacaoByIdAction).mockResolvedValueOnce({
      success: true,
      data: { id: 12 },
    } as never);

    const { result } = renderHook(() => useFetchCessacaoById(12), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchCessacaoByIdAction).toHaveBeenCalledWith(12);
    expect(result.current.data).toEqual({ id: 12 });
  });

  it("retorna erro quando a action devolve success false", async () => {
    vi.mocked(fetchCessacaoByIdAction).mockResolvedValueOnce({
      success: false,
      error: "Falha ao buscar cessação",
    } as never);

    const { result } = renderHook(() => useFetchCessacaoById(12), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("Falha ao buscar cessação");
  });

  it("não executa a query quando o id é 0", () => {
    const { result } = renderHook(() => useFetchCessacaoById(0), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isLoading).toBe(false);
    expect(fetchCessacaoByIdAction).not.toHaveBeenCalled();
  });
});
