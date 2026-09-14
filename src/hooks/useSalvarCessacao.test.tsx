import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useSalvarCessacao } from "./useSalvarCessacao";

// ── Mocks ────────────────────────────────────────

vi.mock("@/actions/cessacao-criar", () => ({
  cessacaoAction: vi.fn(),
}));

vi.mock("@/utils/cessacao/mapearPayloadCessacao", () => ({
  mapearPayloadCessacao: vi.fn(),
}));

const { cessacaoAction } = await import("@/actions/cessacao-criar");
const { mapearPayloadCessacao } = await import(
  "@/utils/cessacao/mapearPayloadCessacao"
);

// ── Helpers ──────────────────────────────────────

const createWrapper = () => {
    const queryClient = new QueryClient();

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    Wrapper.displayName = "TestQueryClientProvider";

    return Wrapper;
};

const valuesMock = {
  cessacao: {
    numero_portaria: "123",
    ano: "2026",
    numero_sei: "SEI-123",
    a_pedido: "nao" as const,
    data_inicio: new Date("2026-01-01"),
    remocao: "nao" as const,
    aposentadoria: "nao" as const,
  },
};

const payloadMock = {
  ato_pai: 10,
  numero_portaria: "123",
  ano_vigente: "2026",
  sei_numero: "SEI-123",
  doc: "DOC-123",
  data_cessacao: "2026-01-01",
  a_pedido: false,
  remocao: false,
  aposentadoria: false,
};

// ── Testes ───────────────────────────────────────

describe("useSalvarCessacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama mapearPayloadCessacao com os valores corretos", async () => {
    vi.mocked(mapearPayloadCessacao).mockReturnValue(payloadMock);
    vi.mocked(cessacaoAction).mockResolvedValue({
      success: true,
      data: { id: 1 },
    });

    const { result } = renderHook(() => useSalvarCessacao(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesMock,
        designacaoId: 10,
        id: null,
      });
    });

    expect(mapearPayloadCessacao).toHaveBeenCalledWith(valuesMock, 10);
  });

  it("chama cessacaoAction com payload e id corretos", async () => {
    vi.mocked(mapearPayloadCessacao).mockReturnValue(payloadMock);
    vi.mocked(cessacaoAction).mockResolvedValue({
      success: true,
      data: { id: 1 },
    });

    const { result } = renderHook(() => useSalvarCessacao(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesMock,
        designacaoId: 10,
        id: "99",
      });
    });

    expect(cessacaoAction).toHaveBeenCalledWith(payloadMock, "99");
  });

  it("retorna os dados quando sucesso", async () => {
    vi.mocked(mapearPayloadCessacao).mockReturnValue(payloadMock);
    vi.mocked(cessacaoAction).mockResolvedValue({
      success: true,
      data: { id: 123 },
    });

    const { result } = renderHook(() => useSalvarCessacao(), {
      wrapper: createWrapper(),
    });

    let response;

    await act(async () => {
      response = await result.current.mutateAsync({
        values: valuesMock,
        designacaoId: 10,
        id: null,
      });
    });

    expect(response).toEqual({ id: 123 });
  });

  it("lança erro quando response.success = false", async () => {
    vi.mocked(mapearPayloadCessacao).mockReturnValue(payloadMock);
    vi.mocked(cessacaoAction).mockResolvedValue({
      success: false,
      error: "Erro ao salvar",
    });

    const { result } = renderHook(() => useSalvarCessacao(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        values: valuesMock,
        designacaoId: 10,
        id: null,
      })
    ).rejects.toThrow("Erro ao salvar");
  });

  it("mantém o estado de erro da mutation", async () => {
    vi.mocked(mapearPayloadCessacao).mockReturnValue(payloadMock);
    vi.mocked(cessacaoAction).mockResolvedValue({
      success: false,
      error: "Erro API",
    });

    const { result } = renderHook(() => useSalvarCessacao(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          values: valuesMock,
          designacaoId: 10,
          id: null,
        });
      } catch {}
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});