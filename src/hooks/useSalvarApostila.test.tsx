import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApostilaBody } from "@/types/apostila";
import { ApostilaAction } from "@/actions/apostila-criar";
import { useSalvarApostila } from "./useSalvarApostila";

const apostilaActionMock = vi.hoisted(() => vi.fn());

vi.mock("@/actions/apostila-criar", () => ({
  ApostilaAction: apostilaActionMock,
}));

const payloadMock: ApostilaBody = {
  ato_pai: 10,
  sei_numero: "SEI-123",
  numero_portaria: "123",
  doc: "DOC-123",
  observacao: "Observação",
  texto_sei: "Texto SEI",
  alteracoes: [
    {
      campo_alterado: "sei_numero",
      valor_novo: "SEI-456",
      tipo_ato_alvo: "DESIGNACAO",
    },
  ],
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = "TestQueryClientProvider";

  return Wrapper;
};

describe("useSalvarApostila", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama ApostilaAction com body tipado e retorna os dados", async () => {
    vi.mocked(ApostilaAction).mockResolvedValueOnce({
      success: true,
      data: { id: 1 },
    });

    const { result } = renderHook(() => useSalvarApostila(), {
      wrapper: createWrapper(),
    });

    let response: unknown;
    await act(async () => {
      response = await result.current.mutateAsync({ body: payloadMock });
    });

    expect(ApostilaAction).toHaveBeenCalledWith(payloadMock);
    expect(response).toEqual({ id: 1 });
  });

  it("lança erro quando ApostilaAction retorna success false", async () => {
    vi.mocked(ApostilaAction).mockResolvedValueOnce({
      success: false,
      error: "Erro ao salvar apostila",
    });

    const { result } = renderHook(() => useSalvarApostila(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync({ body: payloadMock })).rejects.toThrow(
      "Erro ao salvar apostila",
    );
  });

  it("mantém estado de erro na mutation", async () => {
    vi.mocked(ApostilaAction).mockResolvedValueOnce({
      success: false,
      error: "Erro API",
    });

    const { result } = renderHook(() => useSalvarApostila(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ body: payloadMock });
      } catch {}
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
