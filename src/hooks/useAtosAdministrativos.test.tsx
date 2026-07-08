import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAtosAdministrativos } from "./useAtosAdministrativos";

const fetchAtosAdministrativosMock = vi.fn();
const useFormMock = vi.fn();
const resetMock = vi.fn();

let formValues = {
  tipo: "DESIGNACAO",
  portaria: "",
  numero_sei: "",
  nome_titular_e_indicado: "",
  status_publicacao: "",
  periodo: undefined as { from?: Date; to?: Date } | undefined,
  periodo_after: "",
  periodo_before: "",
  rf: "",
};

vi.mock("@/actions/designacao", () => ({
  fetchAtosAdministrativos: (...args: unknown[]) => fetchAtosAdministrativosMock(...args),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<any>("react-hook-form");

  return {
    ...actual,
    useForm: (...args: unknown[]) => useFormMock(...args),
  };
});

describe("useAtosAdministrativos", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    formValues = {
      tipo: "DESIGNACAO",
      portaria: "",
      numero_sei: "",
      nome_titular_e_indicado: "",
      status_publicacao: "",
      periodo: undefined,
      periodo_after: "",
      periodo_before: "",
      rf: "",
    };

    useFormMock.mockReturnValue({
      getValues: () => formValues,
      reset: resetMock,
    });
  });

  it("executa busca inicial, aplica filtros mapeados e atualiza resultado/pagina", async () => {
    fetchAtosAdministrativosMock.mockResolvedValueOnce({
      success: true,
      data: { count: 1, next: null, previous: null, results: [{ id: 10 }] },
    });

    const { result } = renderHook(() => useAtosAdministrativos());

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenCalledWith({
        tipo: "DESIGNACAO",
        portaria: "",
        numero_sei: "",
        nome_titular_e_indicado: "",
        status_publicacao: "",
        periodo_after: undefined,
        periodo_before: undefined,
        rf: "",
        page: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.page).toBe(1);
      expect(result.current.resultado).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 10 }],
      });
    });

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "onChange",
        defaultValues: expect.objectContaining({ tipo: "DESIGNACAO" }),
      })
    );
    expect(result.current.salvando).toBe(false);
    expect(result.current.tabelaKey).toBe(0);
  });

  it("formata periodo no submit, troca pagina no onPageChange e processa erro", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchAtosAdministrativosMock.mockResolvedValue({ success: true, data: { results: [] } });

    const { result } = renderHook(() => useAtosAdministrativos());

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.onSubmitFilterForm({
        tipo: "CESSACAO",
        portaria: "100/2026",
        numero_sei: "1234.5678/9012345-6",
        nome_titular_e_indicado: "Servidor A",
        status_publicacao: "PUBLICADO",
        periodo_after: "",
        periodo_before: "",
        rf: "123456",
        periodo: {
          from: new Date("2026-01-10T12:00:00.000Z"),
          to: new Date("2026-02-20T12:00:00.000Z"),
        },
      });
    });

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenLastCalledWith({
        tipo: "CESSACAO",
        portaria: "100/2026",
        numero_sei: "1234.5678/9012345-6",
        nome_titular_e_indicado: "Servidor A",
        status_publicacao: "PUBLICADO",
        periodo_after: "2026-01-10",
        periodo_before: "2026-02-20",
        rf: "123456",
        page: 1,
      });
    });

    fetchAtosAdministrativosMock.mockResolvedValueOnce({
      success: false,
      error: "erro-na-busca",
    });

    await act(async () => {
      result.current.onPageChange(3);
    });

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenLastCalledWith({
        tipo: "DESIGNACAO",
        portaria: "",
        numero_sei: "",
        nome_titular_e_indicado: "",
        status_publicacao: "",
        periodo_after: undefined,
        periodo_before: undefined,
        rf: "",
        page: 3,
      });
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("erro-na-busca");
    });
  });

  it("limpa formulario, busca com defaults vazios e expõe setters/busca direta", async () => {
    fetchAtosAdministrativosMock.mockResolvedValue({ success: true, data: { results: [] } });

    const { result } = renderHook(() => useAtosAdministrativos());

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.handleClear();
    });

    expect(resetMock).toHaveBeenCalledWith({
      tipo: "",
      portaria: "",
      numero_sei: "",
      nome_titular_e_indicado: "",
      status_publicacao: "",
      periodo: undefined,
      periodo_after: "",
      periodo_before: "",
      rf: "",
    });

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenLastCalledWith({
        tipo: "",
        portaria: "",
        numero_sei: "",
        nome_titular_e_indicado: "",
        status_publicacao: "",
        periodo_after: undefined,
        periodo_before: undefined,
        rf: "",
        page: 1,
      });
    });

    const response = await result.current.buscarAtosAdministrativos({
      tipo: "APOSTILA_DESIGNACAO",
      portaria: "222/2026",
      numero_sei: "9000.0000/0000000-1",
      nome_titular_e_indicado: "Servidor B",
      status_publicacao: "NAO_PUBLICADO",
      periodo_after: "",
      periodo_before: "",
    });

    expect(response).toEqual({ success: true, data: { results: [] } });

    act(() => {
      result.current.setSalvando(true);
      result.current.setTabelaKey((current) => current + 1);
    });

    expect(result.current.salvando).toBe(true);
    expect(result.current.tabelaKey).toBe(1);
    expect(result.current.filterForm).toBeDefined();
    expect(typeof result.current.buscar).toBe("function");
  });
});
