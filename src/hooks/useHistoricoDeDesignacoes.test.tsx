import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHistoricoDeDesignacoes } from "./useHistoricoDeDesignacoes";

const fetchHistoricoDeDesignacoesMock = vi.fn();
const useFormMock = vi.fn();
const resetMock = vi.fn();

let formValues = {
  tipo: "TODOS",
  portaria: "",
  numero_sei: "",
  nome_titular_e_indicado: "",
  status_publicacao: "",
  periodo: undefined as { from?: Date; to?: Date } | undefined,
  periodo_before: "",
  rf: "",
  observacao: "",
};

vi.mock("@/actions/designacao", () => ({
  fetchHistoricoDeDesignacoes: (...args: unknown[]) =>
    fetchHistoricoDeDesignacoesMock(...args),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useForm: (...args: unknown[]) => useFormMock(...args),
  };
});

describe("useHistoricoDeDesignacoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    formValues = {
      tipo: "TODOS",
      portaria: "",
      numero_sei: "",
      nome_titular_e_indicado: "",
      status_publicacao: "",
      periodo: undefined,
      periodo_before: "",
      rf: "",
      observacao: "",
    };

    useFormMock.mockReturnValue({
      getValues: () => formValues,
      reset: resetMock,
    });
  });

  it("busca o histórico da unidade no mount e atualiza resultado/tabela", async () => {
    const data = [{ id: 1 }];

    fetchHistoricoDeDesignacoesMock.mockResolvedValueOnce({
      success: true,
      data,
    });

    const { result } = renderHook(() => useHistoricoDeDesignacoes("014591"));

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenCalledWith("014591", {
        cargo: undefined,
        tipo: undefined,
        portaria: "",
        numero_sei: "",
        nome_titular_e_indicado: "",
        status_publicacao: "",
        periodo_after: undefined,
        periodo_before: undefined,
        rf: "",
        observacao: "",
      });
    });

    await waitFor(() => {
      expect(result.current.resultado).toEqual(data);
      expect(result.current.tabelaKey).toBe(1);
    });

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "onChange",
        defaultValues: expect.objectContaining({ tipo: "TODOS" }),
      })
    );
  });

  it("refaz a busca quando o código da unidade muda", async () => {
    fetchHistoricoDeDesignacoesMock.mockResolvedValue({ success: true, data: [] });

    const { rerender } = renderHook(
      ({ ue }: { ue: string }) => useHistoricoDeDesignacoes(ue),
      { initialProps: { ue: "014591" } }
    );

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenCalledWith("014591", expect.anything());
    });

    rerender({ ue: "123456" });

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenLastCalledWith(
        "123456",
        expect.anything()
      );
    });
  });

  it("formata o período no submit e processa erro da API", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchHistoricoDeDesignacoesMock.mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useHistoricoDeDesignacoes("014591"));

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.onSubmitFilterForm({
        tipo: "APOSTILA",
        portaria: "100",
        numero_sei: "1234.5678/9012345-6",
        nome_titular_e_indicado: "Servidor A",
        status_publicacao: "PUBLICADO",
        rf: "123456",
        observacao: "obs",
        periodo: {
          from: new Date("2026-01-10T12:00:00.000Z"),
          to: new Date("2026-02-20T12:00:00.000Z"),
        },
      });
    });

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenLastCalledWith("014591", {
        cargo: undefined,
        tipo: "APOSTILA",
        portaria: "100",
        numero_sei: "1234.5678/9012345-6",
        nome_titular_e_indicado: "Servidor A",
        status_publicacao: "PUBLICADO",
        periodo_after: "2026-01-10",
        periodo_before: "2026-02-20",
        rf: "123456",
        observacao: "obs",
      });
    });

    fetchHistoricoDeDesignacoesMock.mockResolvedValueOnce({
      success: false,
      error: "erro-na-busca",
    });

    await act(async () => {
      result.current.buscar({
        tipo: "TODOS",
        portaria: "",
        numero_sei: "",
      });
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("erro-na-busca");
    });
  });

  it("limpa o formulário com os defaults e expõe a busca direta", async () => {
    fetchHistoricoDeDesignacoesMock.mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useHistoricoDeDesignacoes("014591"));

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.handleClear();
    });

    expect(resetMock).toHaveBeenCalledWith({
      tipo: "TODOS",
      cargo: "TODOS",
      portaria: "",
      numero_sei: "",
      nome_titular_e_indicado: "",
      status_publicacao: "",
      periodo: {
        from: undefined,
        to: undefined,
      },
      periodo_before: "",
      rf: "",
      observacao: "",
    });

    const response = await result.current.buscarHistoricoDeDesignacoes(formValues);

    expect(response).toEqual({ success: true, data: [] });
    expect(result.current.filterForm).toBeDefined();
    expect(typeof result.current.buscar).toBe("function");
  });
  it.each(["3085", "3379", "3360", "3182"])("envia o código de cargo %s ao backend e limpa o filtro", async (cargo) => {
    const data = [3085, 3379, 3360, 3182].map((cargo_vaga) => ({ id: cargo_vaga, cargo_vaga }));
    fetchHistoricoDeDesignacoesMock.mockResolvedValue({ success: true, data });
    const { result } = renderHook(() => useHistoricoDeDesignacoes("014591"));
    await waitFor(() => expect(result.current.resultado).toEqual(data));
    const filtrado = [{ id: Number(cargo) }];
    fetchHistoricoDeDesignacoesMock.mockResolvedValueOnce({ success: true, data: filtrado });
    await act(async () => result.current.onSubmitFilterForm({ cargo }));
    expect(fetchHistoricoDeDesignacoesMock).toHaveBeenLastCalledWith("014591", expect.objectContaining({ cargo }));
    expect(result.current.resultado).toEqual(filtrado);
    await act(async () => result.current.handleClear());
    expect(fetchHistoricoDeDesignacoesMock).toHaveBeenLastCalledWith("014591", expect.objectContaining({ cargo: undefined }));
    expect(result.current.resultado).toEqual(data);
  });

  it("não busca uma unidade arbitrária quando a UE está ausente", async () => {
    const { result } = renderHook(() => useHistoricoDeDesignacoes(""));
    await waitFor(() => expect(result.current.resultado).toEqual([]));
    expect(fetchHistoricoDeDesignacoesMock).not.toHaveBeenCalled();
  });

});
