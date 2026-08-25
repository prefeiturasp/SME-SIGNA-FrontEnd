import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UseFormReturn } from "react-hook-form";
import FormSchemaCriarTextosPortaria, {
  FormSchemaCriarTextosPortariaData,
} from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { TextosDePortariasPaginada } from "@/types/gestao";
import { useVisualizarTextosPortaria } from "./useVisualizarTextosPortaria";

const {
  useFormMock,
  zodResolverMock,
  errorNotificationMock,
  formGetValuesMock,
  formResetMock,
  fetchTextosPortariaMock,
} = vi.hoisted(() => ({
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  errorNotificationMock: vi.fn(),
  formGetValuesMock: vi.fn(),
  formResetMock: vi.fn(),
  fetchTextosPortariaMock: vi.fn(),
}));

const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

vi.mock("react-hook-form", () => ({
  useForm: useFormMock,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    error: errorNotificationMock,
  }),
}));

vi.mock("@/actions/textos-portaria", () => ({
  fetchTextosPortaria: fetchTextosPortariaMock,
}));

const defaultValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
  texto_portaria: "<p>rererere  [[NOME_SERVIDOR]]</p>",
  variavel: [],
  tipo_cargo: "",
};

const filteredValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "Portaria",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
  texto_portaria: "<p>texto [[PORTARIA]]</p>",
  variavel: ["PORTARIA"],
  tipo_cargo: "EFETIVO",
};

const resultado: TextosDePortariasPaginada = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      tipo_portaria: "Portaria",
      nome_modelo: "Modelo 1",
      status: "ATIVO",
      criado_em: "2026-06-11T08:05:00",
      atualizado_em: "2026-06-11T10:00:00",
    },
    {
      id: 2,
      tipo_portaria: "Portaria",
      nome_modelo: "Modelo 2",
      status: "INATIVO",
      criado_em: "2026-06-28T11:12:00",
      atualizado_em: "2026-06-28T11:40:00",
    },
  ],
};

const renderHookAndWaitInitialFetch = async () => {
  const hook = renderHook(() => useVisualizarTextosPortaria());

  await waitFor(() => {
    expect(fetchTextosPortariaMock).toHaveBeenCalledWith(filteredValues, undefined);
  });

  return hook;
};

describe("useVisualizarTextosPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formGetValuesMock.mockReturnValue(filteredValues);
    fetchTextosPortariaMock.mockResolvedValue({
      success: true,
      data: resultado,
    });
    useFormMock.mockReturnValue({
      getValues: formGetValuesMock,
      reset: formResetMock,
      mockedForm: true,
    } as Partial<UseFormReturn<FormSchemaCriarTextosPortariaData>>);
  });

  it("inicializa formulário e busca dados iniciais", async () => {
    const { result } = await renderHookAndWaitInitialFetch();

    expect(zodResolverMock).toHaveBeenCalledWith(FormSchemaCriarTextosPortaria);
    expect(useFormMock).toHaveBeenCalledWith({
      resolver: "resolver-mock",
      defaultValues,
      mode: "onChange",
    });
    expect(result.current.filterForm).toMatchObject({ mockedForm: true });

    await waitFor(() => {
      expect(result.current.resultado).toEqual(resultado);
      expect(result.current.page).toBe(1);
    });
  });

  it("permite sobrescrever valores padrão do filtro", () => {
    renderHook(() => useVisualizarTextosPortaria(filteredValues));

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: filteredValues,
      }),
    );
  });

  it("busca usando valores atuais ao trocar de página", async () => {
    const { result } = await renderHookAndWaitInitialFetch();
    fetchTextosPortariaMock.mockClear();

    await act(async () => {
      result.current.onPageChange(4);
    });

    await waitFor(() => {
      expect(fetchTextosPortariaMock).toHaveBeenCalledWith(filteredValues, 4);
      expect(result.current.page).toBe(4);
      expect(result.current.resultado).toEqual(resultado);
    });
  });

  it("limpa filtros e busca com valores padrão", async () => {
    const { result } = await renderHookAndWaitInitialFetch();
    fetchTextosPortariaMock.mockClear();

    await act(async () => {
      result.current.handleClear();
    });

    expect(formResetMock).toHaveBeenCalledWith(defaultValues);
    await waitFor(() => {
      expect(fetchTextosPortariaMock).toHaveBeenCalledWith(defaultValues, undefined);
      expect(result.current.page).toBe(1);
    });
  });

  it("submete filtros e busca a primeira página", async () => {
    const { result } = await renderHookAndWaitInitialFetch();
    fetchTextosPortariaMock.mockClear();

    await act(async () => {
      result.current.onSubmitFilterForm(filteredValues);
    });

    await waitFor(() => {
      expect(fetchTextosPortariaMock).toHaveBeenCalledWith(filteredValues, 1);
      expect(result.current.page).toBe(1);
    });
  });

  it("notifica erro quando a busca falha", async () => {
    fetchTextosPortariaMock.mockResolvedValue({
      success: false,
      error: "Erro de API",
    });

    const { result } = renderHook(() => useVisualizarTextosPortaria());

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Erro de API");
      expect(errorNotificationMock).toHaveBeenCalledWith({
        title: "Erro ao buscar textos de portaria!",
        clearPrevious: true,
      });
    });
    expect(result.current.resultado).toBeNull();
  });
});
