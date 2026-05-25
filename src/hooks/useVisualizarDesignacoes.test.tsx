import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDesignacaoByIdAction } from "@/actions/designacoes";
import { useFetchDesignacoesById } from "./useVisualizarDesignacoes";

vi.mock("@/actions/designacoes", () => ({
  getDesignacaoByIdAction: vi.fn(),
}));

describe("useFetchDesignacoesById", () => {
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
    vi.mocked(getDesignacaoByIdAction).mockResolvedValueOnce({
      success: true,
      data: { id: 8 },
    } as never);

    const { result } = renderHook(() => useFetchDesignacoesById(8), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getDesignacaoByIdAction).toHaveBeenCalledWith(8);
    expect(result.current.data).toEqual({ id: 8 });
  });

  it("retorna erro quando a action devolve success false", async () => {
    vi.mocked(getDesignacaoByIdAction).mockResolvedValueOnce({
      success: false,
      error: "Falha ao buscar designação",
    } as never);

    const { result } = renderHook(() => useFetchDesignacoesById(8), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("Falha ao buscar designação");
  });

  it("não executa a query quando o id é 0", () => {
    const { result } = renderHook(() => useFetchDesignacoesById(0), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isLoading).toBe(false);
    expect(getDesignacaoByIdAction).not.toHaveBeenCalled();
  });
});
