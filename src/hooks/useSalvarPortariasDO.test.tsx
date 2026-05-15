import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { useSalvarPortariasDo } from "./useSalvarPortariasDO";
import { ListagemPortariasResponse } from "@/types/designacao";

vi.mock("@/actions/portaria-do-criar", () => ({
  PortariaDOAction: vi.fn(),
}));

const { PortariaDOAction } = await import("@/actions/portaria-do-criar");

const createWrapper = () => {
  const queryClient = new QueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = "TestQueryClientProvider";
  return Wrapper;
};

const valuesMock: ListagemPortariasResponse[] = [
  {
    id: 10,
    portaria_designacao: "10",
    doc: "DOC",
    tipo_ato: "DESIGNACAO_CESSACAO",
    titular_nome_servidor: "Servidor",
    cargo_vaga_display: "Diretor",
    do: "DO",
    data_designacao: "",
    data_cessacao: "",
    sei_numero: "123",
  },
  {
    id: 20,
    portaria_designacao: "20",
    doc: "DOC2",
    tipo_ato: "DESIGNACAO_CESSACAO",
    titular_nome_servidor: "Servidor 2",
    cargo_vaga_display: "Coordenador",
    do: "DO2",
    data_designacao: "",
    data_cessacao: "",
    sei_numero: "456",
  },
];

describe("useSalvarPortariasDo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("monta o payload com ids e data_publicacao", async () => {
    vi.mocked(PortariaDOAction).mockResolvedValue({
      success: true,
      data: { updated: 2 },
    });

    const { result } = renderHook(() => useSalvarPortariasDo(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesMock,
        data_publicacao: "2026-05-14T10:00:00.000Z",
      });
    });

    expect(PortariaDOAction).toHaveBeenCalledWith({
      ids: [10, 20],
      data_publicacao: "2026-05-14T10:00:00.000Z",
    });
  });

  it("retorna os dados quando a action responde sucesso", async () => {
    vi.mocked(PortariaDOAction).mockResolvedValue({
      success: true,
      data: { updated: 1 },
    });

    const { result } = renderHook(() => useSalvarPortariasDo(), {
      wrapper: createWrapper(),
    });

    let response: unknown;

    await act(async () => {
      response = await result.current.mutateAsync({
        values: [valuesMock[0]],
        data_publicacao: "2026-05-14T10:00:00.000Z",
      });
    });

    expect(response).toEqual({ updated: 1 });
  });

  it("lança erro quando response.success = false", async () => {
    vi.mocked(PortariaDOAction).mockResolvedValue({
      success: false,
      error: "Falha ao salvar",
    });

    const { result } = renderHook(() => useSalvarPortariasDo(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        values: valuesMock,
        data_publicacao: "2026-05-14T10:00:00.000Z",
      })
    ).rejects.toThrow("Falha ao salvar");
  });

  it("mantém estado de erro da mutation em falha", async () => {
    vi.mocked(PortariaDOAction).mockResolvedValue({
      success: false,
      error: "Erro API",
    });

    const { result } = renderHook(() => useSalvarPortariasDo(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          values: valuesMock,
          data_publicacao: "2026-05-14T10:00:00.000Z",
        });
      } catch {
        // fluxo esperado no teste
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
