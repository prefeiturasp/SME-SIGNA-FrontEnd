import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useSalvarApostila } from "./useSalvarApostila";
import { ApostilaAction } from "@/actions/apostila-criar";


vi.mock("@/actions/apostila-criar", () => ({
  ApostilaAction: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return Wrapper;
};

const valuesMock = {
  apostila: {
    numero_sei: "6016.2024/000123-4",
    doc: "2024-05-20",
    observacoes: "Teste de apostila",
    tipo_apostila: "designacao",
  },
};

const expectedPayload = {
  sei_numero: "6016.2024/000123-4",
  doc: "2024-05-20",
  observacoes: "Teste de apostila",
  tipo_apostila: "designacao",
  designacao: 10,
};

describe("useSalvarApostila", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama ApostilaAction com o payload formatado corretamente", async () => {
    vi.mocked(ApostilaAction).mockResolvedValue({
      success: true,
      data: { id: 1 },
    });

    const { result } = renderHook(() => useSalvarApostila(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesMock as any,
        designacaoId: 10,
      });
    });

    expect(ApostilaAction).toHaveBeenCalledWith(expectedPayload);
  });

  it("retorna os dados de resposta em caso de sucesso", async () => {
    const mockResponseData = { id: 50, status: "criado" };
    vi.mocked(ApostilaAction).mockResolvedValue({
      success: true,
      data: mockResponseData,
    });

    const { result } = renderHook(() => useSalvarApostila(), {
      wrapper: createWrapper(),
    });

    let response;
    await act(async () => {
      response = await result.current.mutateAsync({
        values: valuesMock as any,
        designacaoId: 10,
      });
    });

    expect(response).toEqual(mockResponseData);
  });

  it("lança um erro quando a action retorna success: false", async () => {
    const errorMessage = "Erro interno no servidor";
    vi.mocked(ApostilaAction).mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    const { result } = renderHook(() => useSalvarApostila(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        values: valuesMock as any,
        designacaoId: 10,
      })
    ).rejects.toThrow(errorMessage);
  });

  it("garante que o estado isError do hook fica verdadeiro após falha", async () => {
    vi.mocked(ApostilaAction).mockResolvedValue({
      success: false,
      error: "Falha técnica",
    });

    const { result } = renderHook(() => useSalvarApostila(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          values: valuesMock as any,
          designacaoId: 10,
        });
      } catch (e) {
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});