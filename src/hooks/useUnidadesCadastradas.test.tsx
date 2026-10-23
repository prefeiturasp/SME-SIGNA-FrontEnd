import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { useUnidadesCadastradas } from "./useUnidadesCadastradas";
import * as unidadesCadastradasActions from "@/actions/unidades-cadastradas";

describe("useUnidadesCadastradas", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("retorna as unidades quando a action tem sucesso", async () => {
    const unidades = [{ dre: "1", dre_nome: "DRE", ue: "2", ue_nome: "EMEF - X" }];
    vi.spyOn(unidadesCadastradasActions, "getUnidadesCadastradasAction").mockResolvedValueOnce({
      success: true,
      data: unidades,
    });

    const { result } = renderHook(() => useUnidadesCadastradas(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(unidades);
    });
  });

  it("fica em erro quando a action falha", async () => {
    vi.spyOn(unidadesCadastradasActions, "getUnidadesCadastradasAction").mockResolvedValueOnce({
      success: false,
      error: "Erro interno no servidor",
    });

    const { result } = renderHook(() => useUnidadesCadastradas(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.message).toBe("Erro interno no servidor");
  });
});
