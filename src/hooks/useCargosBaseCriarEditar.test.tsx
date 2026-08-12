import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCriarEditarCargosBase } from "./useCriarEditarCargosBase";
import createFormSchemaCargosBase from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import type { CargosBaseCriarEditar } from "@/types/gestao";
import { criarCargosBaseAction, editarCargosBaseAction } from "@/actions/cargos-base";

const {
  useFormMock,
  formResetMock,
  zodResolverMock,
  pushMock,
  successNotificationMock,
  errorNotificationMock,
} = vi.hoisted(() => ({
  useFormMock: vi.fn(),
  formResetMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  pushMock: vi.fn(),
  successNotificationMock: vi.fn(),
  errorNotificationMock: vi.fn(),
}));
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("react-hook-form", () => ({
  useForm: useFormMock,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: ({
    mutationFn,
  }: {
    mutationFn: (params: unknown) => Promise<unknown>;
  }) => ({
    mutateAsync: (params: unknown) => mutationFn(params),
  }),
}));

vi.mock("@/actions/cargos-base", () => ({
  criarCargosBaseAction: vi.fn(),
  editarCargosBaseAction: vi.fn(),
}));

vi.mock("./useBuscarCargosBase", () => ({
  useBuscarCargosBase: vi.fn(),
  useBuscarCargosBaseById: vi.fn(),
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

    useFormMock.mockReturnValue({
      reset: formResetMock,
      mockedForm: true,
    });

    const { useBuscarCargosBase, useBuscarCargosBaseById } = await import("./useBuscarCargosBase");
    vi.mocked(useBuscarCargosBase).mockReturnValue({
      data: [{ codigoCargo: 10, nomeCargo: "Cargo 10" }],
      isLoading: true,
    } as never);
    vi.mocked(useBuscarCargosBaseById).mockReturnValue({
      data: undefined,
      isLoading: false,
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
          utilizado_para_ste: false,
          utilizado_para_permutas: false,
          cargo_base_ficticio: false,
        },
        mode: "onChange",
      }),
    );

    expect(result.current.form).toEqual({
      reset: formResetMock,
      mockedForm: true,
    });
    expect(result.current.CargosBaseOpcoes).toEqual([{ codigoCargo: 10, nomeCargo: "Cargo 10" }]);
    expect(result.current.isLoadingCargosBase).toBe(true);
    expect(result.current.isLoadingEditarCargosBase).toBe(false);
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
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: true,
    };

    renderHook(() => useCriarEditarCargosBase(null, customDefaults));

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: customDefaults,
      }),
    );
  });

  it("reseta o formulário com dados do cargo base no modo edição", async () => {
    const cargoBase = {
      grupamento: "2",
      codigo_cargo: "9",
      descricao_resumida: "Resumo",
      descricao_completa: "Completa",
      situacao_funcional: "1",
      status: "3",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
    };

    const { useBuscarCargosBaseById } = await import("./useBuscarCargosBase");
    vi.mocked(useBuscarCargosBaseById).mockReturnValue({
      data: cargoBase,
      isLoading: false,
    } as never);

    renderHook(() => useCriarEditarCargosBase(12));

    expect(formResetMock).toHaveBeenCalledWith(cargoBase);
  });

  it("notifica sucesso e navega após criar cargo base", async () => {
    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: { id: 123 },
    } as never);

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

    expect(criarCargosBaseAction).toHaveBeenCalledWith(payload);
    expect(successNotificationMock).toHaveBeenCalledWith({
      title: "Tudo certo por aqui!",
      description: "O cargo base foi criado.",
    });
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
  });

  it("notifica erro quando a criação do cargo base falha", async () => {
    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "erro de API",
    } as never);

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
        utilizado_para_ste: true,
        utilizado_para_permutas: false,
        cargo_base_ficticio: false,
      });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao salvar cargo base:", expect.any(Error));
    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "Não conseguimos criar o cargo base. Por favor, tente novamente.",
      clearPrevious: true,
    });
  });

  it("remove campos não editáveis e notifica sucesso ao editar cargo base", async () => {
    vi.mocked(editarCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: { id: 77 },
    } as never);

    const { result } = renderHook(() => useCriarEditarCargosBase(77));
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

    expect(editarCargosBaseAction).toHaveBeenCalledWith(77, {
      grupamento: "2",
      descricao_resumida: "Resumo",
      situacao_funcional: "1",
      status: "3",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_outros: false,
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
    });
    expect(successNotificationMock).toHaveBeenCalledWith({
      title: "Tudo certo por aqui!",
      description: "As alterações foram salvas.",
    });
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
  });

  it("notifica erro quando a edição falha", async () => {
    vi.mocked(editarCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "erro de API",
    } as never);

    const { result } = renderHook(() => useCriarEditarCargosBase(88));

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
        utilizado_para_ste: true,
        utilizado_para_permutas: false,
        cargo_base_ficticio: false,
      });
    });

    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "Não conseguimos salvar as alterações. Por favor, tente novamente.",
      clearPrevious: true,
    });
  });
});
