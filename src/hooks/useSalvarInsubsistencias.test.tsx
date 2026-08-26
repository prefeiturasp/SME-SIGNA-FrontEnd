import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useSalvarInsubsistencias } from "./useSalvarInsubsistencias";
import { insubsistenciaAction } from "@/actions/insubsistencia-criar";
import type { formSchemaAnularApostilaTornarSemEfeitoData } from "@/app/pages/anular-apostila/schema";

vi.mock("@/actions/insubsistencia-criar", () => ({
  insubsistenciaAction: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

const valuesMock: formSchemaAnularApostilaTornarSemEfeitoData = {
  apostila_insubsistencia: {
    portaria: "001",
    ano: "2026",
    numero_sei: "6016.2026/0001-1",
    doc: new Date(2026, 2, 2),
    observacao: "obs teste",
    texto_para_apostila: "Texto de anulação",
  },
};

describe("useSalvarInsubsistencias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama insubsistenciaAction com payload mapeado e doc formatado", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: true,
      data: { id: 1 },
    } as never);

    const { result } = renderHook(() => useSalvarInsubsistencias(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesMock,
        atoPai: 10,
      });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith({
      ato_pai: 10,
      numero_portaria: "001",
      ano_vigente: "2026",
      sei_numero: "6016.2026/0001-1",
      doc: "2026-03-02",
      observacoes: "obs teste",
      texto_apostila: "Texto de anulação",
    });
  });

  it("envia doc undefined quando data não existe", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: true,
      data: {},
    } as never);

    const { result } = renderHook(() => useSalvarInsubsistencias(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        // doc é obrigatório no schema, mas testamos aqui o estado antes do
        // preenchimento do campo — daí o cast.
        values: {
          apostila_insubsistencia: {
            ...valuesMock.apostila_insubsistencia,
            doc: undefined,
          },
        } as unknown as formSchemaAnularApostilaTornarSemEfeitoData,
        atoPai: 3,
      });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      expect.objectContaining({
        ato_pai: 3,
        doc: undefined,
      })
    );
  });

  it("retorna dados quando action responde com sucesso", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: true,
      data: { id: 99, status: "ok" },
    } as never);

    const { result } = renderHook(() => useSalvarInsubsistencias(), {
      wrapper: createWrapper(),
    });

    let response: unknown;

    await act(async () => {
      response = await result.current.mutateAsync({
        values: valuesMock,
        atoPai: 20,
      });
    });

    expect(response).toEqual({ id: 99, status: "ok" });
  });

  it("lança erro quando success é false", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: false,
      error: "Erro ao salvar",
    } as never);

    const { result } = renderHook(() => useSalvarInsubsistencias(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        values: valuesMock,
        atoPai: 20,
      })
    ).rejects.toThrow("Erro ao salvar");
  });

  it("marca isError como true após rejeição e loga erro", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: false,
      error: "Falha técnica",
    } as never);

    const { result } = renderHook(() => useSalvarInsubsistencias(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          values: valuesMock,
          atoPai: 8,
        });
      } catch {}
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(consoleSpy).toHaveBeenCalledWith("Falha técnica");
    consoleSpy.mockRestore();
  });
});
