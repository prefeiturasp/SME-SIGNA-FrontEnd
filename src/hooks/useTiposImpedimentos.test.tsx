import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import { useFetchImpedimentos } from "./useTiposImpedimentos";
import { getImpedimentosAction } from "@/actions/tipos-impedimentos";

vi.mock("@/actions/tipos-impedimentos", () => ({
  getImpedimentosAction: vi.fn(),
}));

const getImpedimentosActionMock = getImpedimentosAction as Mock;

describe("useFetchImpedimentos", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
  });

  it("deve retornar dados com sucesso quando a action for bem sucedida", async () => {
    const fakeData = [
      { value: 1, label: "Licença médica" },
      { value: 2, label: "Férias" },
    ];

    getImpedimentosActionMock.mockResolvedValue({
      success: true,
      data: fakeData,
    });

    const { result } = renderHook(() => useFetchImpedimentos(), {
      wrapper,
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(fakeData);
    expect(getImpedimentosActionMock).toHaveBeenCalled();
  });

  it("deve entrar em erro quando a action retorna success: false", async () => {
    getImpedimentosActionMock.mockResolvedValue({
      success: false,
      error: "Erro ao buscar impedimentos",
    });

    const { result } = renderHook(() => useFetchImpedimentos(), {
      wrapper,
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      "Erro ao buscar impedimentos"
    );
  });

  it("deve usar mensagem padrão quando error for undefined", async () => {
    getImpedimentosActionMock.mockResolvedValue({
      success: false,
      error: undefined,
    });

    const { result } = renderHook(() => useFetchImpedimentos(), {
      wrapper,
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      "Erro ao buscar tipos de impedimento"
    );
  });

  it("deve tratar erro quando a action lança exceção", async () => {
    const error = new Error("Erro de rede");

    getImpedimentosActionMock.mockRejectedValue(error);

    const { result } = renderHook(() => useFetchImpedimentos(), {
      wrapper,
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });
});