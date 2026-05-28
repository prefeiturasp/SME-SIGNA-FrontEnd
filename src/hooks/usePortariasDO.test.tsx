import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePortariasDO } from "./usePortariasDO";

const fetchPortariasDOMock = vi.fn();
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
  fetchPortariasDO: (...args: unknown[]) => fetchPortariasDOMock(...args),
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

describe("usePortariasDO", () => {
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
    fetchPortariasDOMock.mockResolvedValueOnce({
      success: true,
      data: [{ id: 1 }],
    });

    const { result } = renderHook(() => usePortariasDO());

    await waitFor(() => {
      expect(fetchPortariasDOMock).toHaveBeenCalledWith({
        numero_sei: "",
        portaria_inicial: "",
        portaria_final: "",
        ano: currentYear,
        tipo: "",
      });
    });

    expect(triggerMock).toHaveBeenCalledWith(["portaria_inicial", "portaria_final"]);
    await waitFor(() => {
      expect(result.current.resultado).toEqual([{ id: 1 }]);
    });
    expect(result.current.salvando).toBe(false);
    expect(result.current.tabelaKey).toBe(0);
  });

  it("faz log de erro quando busca falha", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchPortariasDOMock.mockResolvedValueOnce({
      success: false,
      error: "falhou",
    });

    renderHook(() => usePortariasDO());

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("falhou");
    });
  });

  it("onSubmitFilterForm dispara nova busca com os filtros informados", async () => {
    fetchPortariasDOMock.mockResolvedValue({ success: true, data: [] });
    const { result } = renderHook(() => usePortariasDO());

    await waitFor(() => {
      expect(fetchPortariasDOMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.onSubmitFilterForm({
        numero_sei: "123",
        portaria_inicial: "10",
        portaria_final: "20",
        ano: "2025",
        tipo: "DESIGNACAO_CESSACAO",
      });
    });

    await waitFor(() => {
      expect(fetchPortariasDOMock).toHaveBeenLastCalledWith({
        numero_sei: "123",
        portaria_inicial: "10",
        portaria_final: "20",
        ano: "2025",
        tipo: "DESIGNACAO_CESSACAO",
      });
    });
  });

  it("handleClear reseta o formulário e busca novamente com valores padrão", async () => {
    fetchPortariasDOMock.mockResolvedValue({ success: true, data: [] });
    const { result } = renderHook(() => usePortariasDO());

    await waitFor(() => {
      expect(fetchPortariasDOMock).toHaveBeenCalledTimes(1);
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
      expect(fetchPortariasDOMock).toHaveBeenLastCalledWith({
        numero_sei: "",
        portaria_inicial: "",
        portaria_final: "",
        ano: currentYear,
        tipo: "",
      });
    });
  });

  it("buscarPortarias retorna resposta direta da action e setters funcionam", async () => {
    fetchPortariasDOMock.mockResolvedValue({ success: true, data: [] });
    const { result } = renderHook(() => usePortariasDO());

    const response = await result.current.buscarPortarias({
      numero_sei: "9",
      portaria_inicial: "1",
      portaria_final: "2",
      ano: "2024",
      tipo: "DESIGNACAO_CESSACAO",
    });

    expect(response).toEqual({ success: true, data: [] });

    act(() => {
      result.current.setSalvando(true);
      result.current.setTabelaKey((current) => current + 2);
    });

    expect(result.current.salvando).toBe(true);
    expect(result.current.tabelaKey).toBe(2);
  });
});
