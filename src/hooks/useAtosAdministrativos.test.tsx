import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAtosAdministrativos } from "./useAtosAdministrativos";

const fetchAtosAdministrativosMock = vi.fn();
const triggerMock = vi.fn().mockResolvedValue(true);
const resetMock = vi.fn();

let formValues = {
  numero_sei: "",
  portaria_inicial: "",
  portaria_final: "",
  ano: "2026",
  tipo: "",
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
    useForm: () => ({
      watch: (field: keyof typeof formValues) => formValues[field],
      trigger: triggerMock,
      getValues: () => formValues,
      reset: resetMock,
    }),
  };
});

describe("useAtosAdministrativos", () => {
  const currentYear = new Date().getFullYear().toString();

  beforeEach(() => {
    vi.clearAllMocks();
    formValues = {
      numero_sei: "",
      portaria_inicial: "",
      portaria_final: "",
      ano: currentYear,
      tipo: "",
    };
  });

  it("busca na carga inicial e atualiza resultado quando sucesso", async () => {
    fetchAtosAdministrativosMock.mockResolvedValueOnce({
      success: true,
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 1 }],
      },
    });

    const { result } = renderHook(() => useAtosAdministrativos());

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenCalledWith({
        numero_sei: "",
        portaria_inicial: "",
        portaria_final: "",
        ano: currentYear,
        tipo: "",
        page: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.resultado).toEqual({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 1 }],
      });
    });
    expect(result.current.page).toBe(1);
    expect(result.current.salvando).toBe(false);
    expect(result.current.tabelaKey).toBe(0);
  });

  it("faz log de erro quando busca falha", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchAtosAdministrativosMock.mockResolvedValueOnce({
      success: false,
      error: "falhou",
    });

    renderHook(() => useAtosAdministrativos());

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("falhou");
    });
  });

  it("onSubmitFilterForm dispara nova busca com filtros e página 1", async () => {
    fetchAtosAdministrativosMock.mockResolvedValue({ success: true, data: { count: 0, next: null, previous: null, results: [] } });
    const { result } = renderHook(() => useAtosAdministrativos());

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.onSubmitFilterForm({
        numero_sei: "123",
        portaria_inicial: "10",
        portaria_final: "20",
        ano: "2025",
        tipo: "DESIGNACAO",
      });
    });

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenLastCalledWith({
        numero_sei: "123",
        portaria_inicial: "10",
        portaria_final: "20",
        ano: "2025",
        tipo: "DESIGNACAO",
        page: 1,
      });
    });
  });

  it("onPageChange usa os valores do formulário atual e atualiza a página", async () => {
    fetchAtosAdministrativosMock.mockResolvedValue({ success: true, data: { count: 0, next: null, previous: null, results: [] } });
    const { result } = renderHook(() => useAtosAdministrativos());

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenCalledTimes(1);
    });

    formValues = {
      numero_sei: "SEI-1",
      portaria_inicial: "11",
      portaria_final: "22",
      ano: "2024",
      tipo: "CESSACAO",
    };

    await act(async () => {
      result.current.onPageChange(3);
    });

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenLastCalledWith({
        numero_sei: "SEI-1",
        portaria_inicial: "11",
        portaria_final: "22",
        ano: "2024",
        tipo: "CESSACAO",
        page: 3,
      });
    });
    await waitFor(() => {
      expect(result.current.page).toBe(3);
    });
  });

  it("handleClear reseta formulário e busca com valores padrão", async () => {
    fetchAtosAdministrativosMock.mockResolvedValue({ success: true, data: { count: 0, next: null, previous: null, results: [] } });
    const { result } = renderHook(() => useAtosAdministrativos());

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.handleClear();
    });

    expect(resetMock).toHaveBeenCalledWith({
      numero_sei: "",
      portaria_inicial: "",
      portaria_final: "",
      ano: currentYear,
      tipo: "",
    });

    await waitFor(() => {
      expect(fetchAtosAdministrativosMock).toHaveBeenLastCalledWith({
        numero_sei: "",
        portaria_inicial: "",
        portaria_final: "",
        ano: currentYear,
        tipo: "",
        page: 1,
      });
    });
  });

  it("buscarAtosAdministrativos retorna a action e usa page padrão quando omitida", async () => {
    fetchAtosAdministrativosMock.mockResolvedValue({ success: true, data: { count: 0, next: null, previous: null, results: [] } });
    const { result } = renderHook(() => useAtosAdministrativos());

    const response = await result.current.buscarAtosAdministrativos({
      numero_sei: "9",
      portaria_inicial: "1",
      portaria_final: "2",
      ano: "2024",
      tipo: "DESIGNACAO",
    });

    expect(response).toEqual({
      success: true,
      data: { count: 0, next: null, previous: null, results: [] },
    });
    expect(fetchAtosAdministrativosMock).toHaveBeenLastCalledWith({
      numero_sei: "9",
      portaria_inicial: "1",
      portaria_final: "2",
      ano: "2024",
      tipo: "DESIGNACAO",
      page: 1,
    });
  });

  it("setters de estado funcionam para salvando e tabelaKey", async () => {
    fetchAtosAdministrativosMock.mockResolvedValue({ success: true, data: { count: 0, next: null, previous: null, results: [] } });
    const { result } = renderHook(() => useAtosAdministrativos());

    act(() => {
      result.current.setSalvando(true);
      result.current.setTabelaKey((current) => current + 5);
    });

    expect(result.current.salvando).toBe(true);
    expect(result.current.tabelaKey).toBe(5);
  });
});
