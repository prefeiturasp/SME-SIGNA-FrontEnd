import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import type { formSchemaInsubsistenciaData } from "@/app/pages/insubsistencia/schema";
import { useSalvarInsubsistencia } from "./useSalvarInsubsistencia";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/actions/insubsistencia-criar", () => ({
  insubsistenciaAction: vi.fn(),
}));

const { insubsistenciaAction } = await import("@/actions/insubsistencia-criar");

// ── Helpers ───────────────────────────────────────────────────────────────────

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = "TestQueryClientProvider";

  return Wrapper;
};

const valuesMock: formSchemaInsubsistenciaData = {
  insubsistencia: {
    numero_portaria: "001",
    ano: "2026",
    numero_sei: "6016.2026/0001-1",
    doc: "DOC-01",
    observacoes: "obs teste",
    tipo_insubsistencia: "designacao",
  },
};

// ── Testes ────────────────────────────────────────────────────────────────────

describe("useSalvarInsubsistencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama insubsistenciaAction com o payload mapeado corretamente (designacao)", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 1 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ values: valuesMock, designacaoId: 10 });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      {
        ato_pai: 10,
        numero_portaria: 1,
        ano_vigente: "2026",
        sei_numero: "6016.2026/0001-1",
        doc: "DOC-01",
        observacoes: "obs teste",
        texto_sei: "",
        modelo_portaria: null,
      },
      undefined,
    );
  });

  it("repassa textoSei e modeloPortaria quando informados", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 1 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesMock,
        designacaoId: 10,
        textoSei: "Texto gerado pelo back.",
        modeloPortaria: 7,
      });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      expect.objectContaining({
        texto_sei: "Texto gerado pelo back.",
        modelo_portaria: 7,
      }),
      undefined,
    );
  });

  it("usa cessacaoId como ato_pai quando tipo_insubsistencia é cessacao", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 1 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    const valuesCessacao: formSchemaInsubsistenciaData = {
      insubsistencia: { ...valuesMock.insubsistencia, tipo_insubsistencia: "cessacao" },
    };

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesCessacao,
        designacaoId: 10,
        cessacaoId: 55,
      });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      expect.objectContaining({ ato_pai: 55 }),
      undefined,
    );
  });

  it("cai no designacaoId quando o tipo é cessacao mas cessacaoId não veio", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 1 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    const valuesCessacao: formSchemaInsubsistenciaData = {
      insubsistencia: { ...valuesMock.insubsistencia, tipo_insubsistencia: "cessacao" },
    };

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesCessacao,
        designacaoId: 10,
      });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      expect.objectContaining({ ato_pai: 10 }),
      undefined,
    );
  });

  it("omite doc quando o campo vem vazio", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 1 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    const valuesSemDoc: formSchemaInsubsistenciaData = {
      insubsistencia: { ...valuesMock.insubsistencia, doc: "" },
    };

    await act(async () => {
      await result.current.mutateAsync({ values: valuesSemDoc, designacaoId: 10 });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      expect.objectContaining({ doc: undefined }),
      undefined,
    );
  });

  it("repassa insubsistenciaId para a action na edição", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 39 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        values: valuesMock,
        designacaoId: 10,
        insubsistenciaId: 39,
      });
    });

    expect(insubsistenciaAction).toHaveBeenCalledWith(
      expect.objectContaining({ ato_pai: 10 }),
      39,
    );
  });

  it("retorna os dados quando a action é bem-sucedida", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({ success: true, data: { id: 99 } });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    let response: unknown;

    await act(async () => {
      response = await result.current.mutateAsync({ values: valuesMock, designacaoId: 5 });
    });

    expect(response).toEqual({ id: 99 });
  });

  it("lança erro quando response.success é false", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: false,
      error: "Erro ao salvar insubsistência",
    });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({ values: valuesMock, designacaoId: 5 })
    ).rejects.toThrow("Erro ao salvar insubsistência");
  });

  it("mantém isError=true após falha", async () => {
    vi.mocked(insubsistenciaAction).mockResolvedValue({
      success: false,
      error: "Erro API",
    });

    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ values: valuesMock, designacaoId: 5 });
      } catch {}
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("lança erro quando não há designacaoId nem cessacaoId", async () => {
    const { result } = renderHook(() => useSalvarInsubsistencia(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({ values: valuesMock })
    ).rejects.toThrow("Ato de origem (designação ou cessação) não informado.");

    expect(insubsistenciaAction).not.toHaveBeenCalled();
  });
});
