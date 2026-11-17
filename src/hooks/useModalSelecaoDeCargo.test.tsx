import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useModalSelecaoDeCargo } from "./useModalSelecaoDeCargo";
import { fetchCargosBaseAction } from "@/actions/cargos-base";

const {
  useQueryMock,
  useFormMock,
  zodResolverMock,
  errorNotificationMock,
  queryOptionsRef,
} = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  errorNotificationMock: vi.fn(),
  queryOptionsRef: { current: undefined as unknown },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => {
    queryOptionsRef.current = options;
    return useQueryMock(options);
  },
}));

vi.mock("react-hook-form", () => ({
  useForm: useFormMock,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({ error: errorNotificationMock }),
}));

vi.mock("@/actions/cargos-base", () => ({
  fetchCargosBaseAction: vi.fn(),
}));

const cargos = [
  { codigoCargo: 3360, nomeCargo: "DIRETOR DE ESCOLA" },
  { codigoCargo: 3379, nomeCargo: "COORDENADOR PEDAGOGICO" },
];

const mockQuery = (value: Record<string, unknown>) => {
  useQueryMock.mockReturnValue({
    data: cargos,
    isLoading: false,
    isError: false,
    ...value,
  });
};

describe("useModalSelecaoDeCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery({});
    useFormMock.mockReturnValue({ mockedForm: true });
  });

  it("inicializa o formulário com o resolver e valores padrão", () => {
    const { result } = renderHook(() => useModalSelecaoDeCargo());

    expect(useFormMock).toHaveBeenCalledWith({
      resolver: "resolver-mock",
      defaultValues: { codigo_cargo: "" },
      mode: "onChange",
    });
    expect(result.current.filterForm).toEqual({ mockedForm: true });
    expect(result.current.cargosOpcoes).toEqual(cargos);
    expect(result.current.isLoadingCargos).toBe(false);
    expect(result.current.defaultValues).toEqual({ codigo_cargo: "" });
  });

  it("configura a query dos cargos do EOL", () => {
    renderHook(() => useModalSelecaoDeCargo());

    expect(queryOptionsRef.current).toEqual(
      expect.objectContaining({
        queryKey: ["get-cargos-eol"],
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
        enabled: true,
      }),
    );
  });

  it("retorna os cargos buscados pela action de cargos base", async () => {
    renderHook(() => useModalSelecaoDeCargo());

    const options = queryOptionsRef.current as { queryFn: () => Promise<unknown> };
    vi.mocked(fetchCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: cargos,
    });

    await expect(options.queryFn()).resolves.toEqual(cargos);
    expect(fetchCargosBaseAction).toHaveBeenCalledTimes(1);
  });

  it("lança erro quando a busca falha", async () => {
    renderHook(() => useModalSelecaoDeCargo());

    const options = queryOptionsRef.current as { queryFn: () => Promise<unknown> };
    vi.mocked(fetchCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "falha ao buscar",
    });

    await expect(options.queryFn()).rejects.toThrow("falha ao buscar");
  });

  it("notifica erro quando a query falha", () => {
    mockQuery({ isError: true });

    renderHook(() => useModalSelecaoDeCargo());

    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro ao buscar os cargos, por favor, tente novamente mais tarde!",
      clearPrevious: true,
    });
  });

  it("confirma a seleção com o cargo encontrado e fecha o modal", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    const { result } = renderHook(() =>
      useModalSelecaoDeCargo({ onConfirm, onClose }),
    );

    act(() => {
      result.current.onSubmitFilterForm({ codigo_cargo: "3379" });
    });

    expect(onConfirm).toHaveBeenCalledWith({ codigo_cargo: "3379" }, cargos[1]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("funciona sem callbacks informados", () => {
    const { result } = renderHook(() => useModalSelecaoDeCargo());

    expect(() =>
      act(() => {
        result.current.onSubmitFilterForm({ codigo_cargo: "3360" });
      }),
    ).not.toThrow();
  });
});
