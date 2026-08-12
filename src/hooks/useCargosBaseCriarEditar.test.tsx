import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCriarEditarCargosBase } from "./useCriarEditarCargosBase";
import createFormSchemaCargosBase from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import type { CargosBaseCriarEditar } from "@/types/gestao";

const useFormMock = vi.fn((..._args: unknown[]) => ({ mockedForm: true }));
const zodResolverMock = vi.fn((..._args: unknown[]) => "resolver-mock");
const pushMock = vi.fn();
const successNotificationMock = vi.fn();
const errorNotificationMock = vi.fn();
const mutateAsyncMock = vi.fn();
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("react-hook-form", () => ({
  useForm: (...args: unknown[]) => useFormMock(...args),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: (...args: unknown[]) => zodResolverMock(...args),
}));

vi.mock("./useBuscarCargosBase", () => ({
  useBuscarCargosBase: vi.fn(),
}));

vi.mock("./useCriarCargosBase", () => ({
  useCriarCargosBase: () => ({
    mutateAsync: mutateAsyncMock,
  }),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: successNotificationMock,
    error: errorNotificationMock,
  }),
}));

describe("useCriarEditarCargosBase", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useBuscarCargosBase } = await import("./useBuscarCargosBase");
    vi.mocked(useBuscarCargosBase).mockReturnValue({
      data: [{ codigoCargo: 10, nomeCargo: "Cargo 10" }],
      isLoading: true,
    } as never);
  });

  it("inicializa formulário e expõe estado da listagem de cargos base", () => {
    const { result } = renderHook(() => useCriarEditarCargosBase());

    expect(zodResolverMock).toHaveBeenCalledWith(createFormSchemaCargosBase);
    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resolver: "resolver-mock",
        defaultValues: {
          grupamento: "",
          codigo_cargo: "",
          descricao_resumida: "",
          descricao_completa: "",
          situacao_funcional: "",
          status: "",
          utilizado_para_funcoes: false,
          utilizado_para_designacoes: false,
          utilizado_para_outros: false,
          utilizado_para_ste: false,
          utilizado_para_permutas: false,
          cargo_base_ficticio: false,
        },
        mode: "onChange",
      }),
    );

    expect(result.current.form).toEqual({ mockedForm: true });
    expect(result.current.CargosBaseOpcoes).toEqual([{ codigoCargo: 10, nomeCargo: "Cargo 10" }]);
    expect(result.current.isLoadingCargosBase).toBe(true);
    expect(result.current.isPending).toBe(false);
  });

  it("permite sobrescrever valores padrão no useForm", () => {
    const customDefaults: CargosBaseCriarEditar = {
      grupamento: "2",
      codigo_cargo: "9",
      descricao_resumida: "Resumo",
      descricao_completa: "Completa",
      situacao_funcional: "1",
      status: "3",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: true,
      utilizado_para_outros: false,
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: true,
    };

    renderHook(() => useCriarEditarCargosBase(customDefaults));

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: customDefaults,
      }),
    );
  });

  it("notifica sucesso e navega após salvar cargo base", async () => {
    mutateAsyncMock.mockResolvedValueOnce({ id: 123 });
    const { result } = renderHook(() => useCriarEditarCargosBase());

    const payload = {
      codigo_cargo: "1",
      grupamento: "2",
      descricao_resumida: "Resumo",
      descricao_completa: "Completa",
      situacao_funcional: "1",
      status: "3",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_outros: false,
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
    };

    await act(async () => {
      await result.current.onSubmitForm(payload);
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({ values: payload });
    expect(successNotificationMock).toHaveBeenCalledWith({
      title: "Tudo certo por aqui!",
      description: "O cargo base foi criado.",
    });
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
  });

  it("notifica erro quando salvar cargo base falha", async () => {
    const error = new Error("erro de API");
    mutateAsyncMock.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useCriarEditarCargosBase());

    await act(async () => {
      await result.current.onSubmitForm({
        codigo_cargo: "1",
        grupamento: "2",
        descricao_resumida: "Resumo",
        descricao_completa: "Completa",
        situacao_funcional: "1",
        status: "3",
        utilizado_para_funcoes: true,
        utilizado_para_designacoes: false,
        utilizado_para_outros: false,
        utilizado_para_ste: true,
        utilizado_para_permutas: false,
        cargo_base_ficticio: false,
      });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao salvar cargo base:", error);
    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "Não conseguimos criar o cargo base. Por favor, tente novamente.",
      clearPrevious: true,
    });
  });
});
