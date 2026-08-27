import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UseFormReturn } from "react-hook-form";
import FormSchemaCriarTextosPortaria, {
  FormSchemaCriarTextosPortariaData,
} from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { useCriarTextosPortaria } from "./useCriarTextosPortaria";

const {
  useFormMock,
  zodResolverMock,
  successNotificationMock,
  pushMock,
} = vi.hoisted(() => ({
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  successNotificationMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("react-hook-form", () => ({
  useForm: useFormMock,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: successNotificationMock,
  }),
}));

vi.mock("next/router", () => ({
  default: {
    push: pushMock,
  },
}));

const defaultValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
  texto_portaria: "",
  variaveis: [],
  tipo_cargo: "",
};

const validValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "PORTARIA",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
  texto_portaria: "Servidor [[NOME_SERVIDOR]] portaria [[PORTARIA]].",
  variaveis: ["NOME_SERVIDOR", "PORTARIA"],
  tipo_cargo: "CARGO_VAGO",
  observacoes: "Obs",
};

describe("useCriarTextosPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFormMock.mockReturnValue({
      mockedForm: true,
    } as Partial<UseFormReturn<FormSchemaCriarTextosPortariaData>>);
  });

  it("inicializa formulário com defaults e estado inicial", () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    expect(zodResolverMock).toHaveBeenCalledWith(FormSchemaCriarTextosPortaria);
    expect(useFormMock).toHaveBeenCalledWith({
      resolver: "resolver-mock",
      defaultValues,
      mode: "onChange",
    });
    expect(result.current.filterForm).toMatchObject({ mockedForm: true });
    expect(result.current.isLoadingCadastrarTextoPortaria).toBe(false);
    expect(result.current.isModalOpen).toBe(false);
  });

  it("permite sobrescrever valores padrão do formulário", () => {
    renderHook(() => useCriarTextosPortaria(1));

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: validValues,
      }),
    );
  });

  it("notifica sucesso e navega quando todas as variáveis estão no texto", () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    act(() => {
      result.current.onSubmitFilterForm(validValues);
    });

    expect(successNotificationMock).toHaveBeenCalledWith({
      title: "Tudo certo por aqui!",
      description: "Texto de portaria encontrado com sucesso!",
    });
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
    expect(result.current.isModalOpen).toBe(false);
  });

  it("considera válido o envio sem variáveis selecionadas", () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    act(() => {
      result.current.onSubmitFilterForm({
        ...validValues,
        variaveis: [],
        texto_portaria: "Texto sem tokens",
      });
    });

    expect(successNotificationMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
  });

  it("abre o modal quando alguma variável não está no formato esperado", () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    act(() => {
      result.current.onSubmitFilterForm({
        ...validValues,
        texto_portaria: "Servidor [[NOME_SERVIDOR]] sem a outra variável.",
      });
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(successNotificationMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("mantém o modal aberto quando a primeira variável já invalidou o texto", () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    act(() => {
      result.current.onSubmitFilterForm({
        ...validValues,
        texto_portaria: "Somente [[PORTARIA]] no final.",
      });
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(successNotificationMock).not.toHaveBeenCalled();
  });

  it("fecha o modal ao revisar o texto", () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    act(() => {
      result.current.onSubmitFilterForm({
        ...validValues,
        texto_portaria: "Texto inválido",
      });
    });
    expect(result.current.isModalOpen).toBe(true);

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.isModalOpen).toBe(false);
  });
});
