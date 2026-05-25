import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { useFetchCargos } from "./useCargos";
import * as cargosActions from "@/actions/cargos";
import { ICargoType } from "@/types/cargos";

const fakeCargos: ICargoType[] = [
  { codigoCargo: 1, nomeCargo: "Diretor de Escola" },
  { codigoCargo: 2, nomeCargo: "Assistente de Diretor" },
];

describe("useFetchCargos", () => {
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
  });

  it("retorna a lista de cargos com sucesso", async () => {
    vi.spyOn(cargosActions, "getCargos").mockResolvedValueOnce(fakeCargos);

    const { result } = renderHook(() => useFetchCargos(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(fakeCargos);
    });
  });

  it("retorna estado de loading enquanto busca os dados", () => {
    vi.spyOn(cargosActions, "getCargos").mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useFetchCargos(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("retorna erro quando a action falhar", async () => {
    vi.spyOn(cargosActions, "getCargos").mockRejectedValueOnce(
      new Error("Não foi possível buscar os cargos")
    );

    const { result } = renderHook(() => useFetchCargos(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(
      new Error("Não foi possível buscar os cargos")
    );
  });
});
