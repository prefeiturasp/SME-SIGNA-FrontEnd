import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCargosBase } from "./useCargosBase";
import { fetchCargosBase } from "@/actions/gestao";

const resetMock = vi.fn();
const getValuesMock = vi.fn();
const handleSubmitMock = vi.fn();
const notificationErrorMock = vi.fn();
const useFormMock = vi.fn(() => ({
  reset: resetMock,
  getValues: getValuesMock,
  handleSubmit: handleSubmitMock,
}));
const zodResolverMock = vi.fn(() => "resolver-mock");
const startTransitionMock = vi.fn((callback: () => Promise<void> | void) => callback());
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [false, startTransitionMock] as const,
  };
});

vi.mock("react-hook-form", () => ({
  useForm: (...args: unknown[]) => useFormMock(...args),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: (...args: unknown[]) => zodResolverMock(...args),
}));

vi.mock("@/actions/gestao", () => ({
  fetchCargosBase: vi.fn(),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    error: notificationErrorMock,
  }),
}));

describe("useCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getValuesMock.mockReturnValue({
      grupamento: "",
      descricao_resumida: "",
      descricao_completa: "",
      situacao_funcional: "",
      status: "",
    });
  });

  it("configura useForm e busca dados iniciais com sucesso", async () => {
    vi.mocked(fetchCargosBase).mockResolvedValueOnce({
      success: true,
      data: { count: 1, next: null, previous: null, results: [{ id: 9 }] as any },
    });

    const { result } = renderHook(() => useCargosBase());

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resolver: "resolver-mock",
        defaultValues: {
          grupamento: "",
          descricao_resumida: "",
          descricao_completa: "",
          situacao_funcional: "",
          status: "",
        },
        mode: "onChange",
      }),
    );

    await waitFor(() => {
      expect(fetchCargosBase).toHaveBeenCalledWith({
        grupamento: "",
        descricao_resumida: "",
        descricao_completa: "",
        situacao_funcional: "",
        status: "",
        page: 1,
      });
      expect(result.current.page).toBe(1);
      expect(result.current.resultado?.count).toBe(1);
    });
  });

  it("muda página e submete filtros reiniciando para a primeira página", async () => {
    vi.mocked(fetchCargosBase)
      .mockResolvedValueOnce({
        success: true,
        data: { count: 10, next: null, previous: null, results: [] },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { count: 20, next: null, previous: null, results: [] },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { count: 30, next: null, previous: null, results: [] },
      });

    const { result } = renderHook(() => useCargosBase());

    await waitFor(() => {
      expect(fetchCargosBase).toHaveBeenCalledTimes(1);
    });

    getValuesMock.mockReturnValue({
      grupamento: "2",
      descricao_resumida: "abc",
      descricao_completa: "def",
      situacao_funcional: "1",
      status: "3",
    });

    await act(async () => {
      result.current.onPageChange(3);
    });

    await waitFor(() => {
      expect(fetchCargosBase).toHaveBeenCalledWith({
        grupamento: "2",
        descricao_resumida: "abc",
        descricao_completa: "def",
        situacao_funcional: "1",
        status: "3",
        page: 3,
      });
      expect(result.current.page).toBe(3);
    });

    await act(async () => {
      result.current.onSubmitFilterForm({
        grupamento: "1",
        descricao_resumida: "novo",
        descricao_completa: "novo completo",
        situacao_funcional: "2",
        status: "1",
      });
    });

    await waitFor(() => {
      expect(fetchCargosBase).toHaveBeenCalledWith({
        grupamento: "1",
        descricao_resumida: "novo",
        descricao_completa: "novo completo",
        situacao_funcional: "2",
        status: "1",
        page: 1,
      });
      expect(result.current.page).toBe(1);
    });
  });

  it("limpa filtros com defaults customizados e refaz busca", async () => {
    const customDefaults = {
      grupamento: "2",
      descricao_resumida: "Resumo",
      descricao_completa: "Descrição completa",
      situacao_funcional: "1",
      status: "3",
    };

    vi.mocked(fetchCargosBase)
      .mockResolvedValueOnce({
        success: true,
        data: { count: 1, next: null, previous: null, results: [] },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { count: 2, next: null, previous: null, results: [] },
      });

    getValuesMock.mockReturnValue(customDefaults);
    const { result } = renderHook(() => useCargosBase(customDefaults));

    await waitFor(() => {
      expect(fetchCargosBase).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      result.current.handleClear();
    });

    expect(resetMock).toHaveBeenCalledWith(customDefaults);
    await waitFor(() => {
      expect(fetchCargosBase).toHaveBeenLastCalledWith({
        ...customDefaults,
        page: 1,
      });
    });
  });

  it("registra erro quando a busca falha", async () => {
    vi.mocked(fetchCargosBase).mockResolvedValueOnce({
      success: false,
      error: "erro ao consultar",
    });

    const { result } = renderHook(() => useCargosBase());

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("erro ao consultar");
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Erro ao buscar cargos base!",
        clearPrevious: true,
      });
      expect(result.current.resultado).toBeNull();
      expect(startTransitionMock).toHaveBeenCalled();
    });
  });
});
