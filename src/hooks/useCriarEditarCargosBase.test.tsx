import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useCriarCargosBase,
  useCriarEditarCargosBase,
  useEditarCargosBase,
} from "./useCriarEditarCargosBase";
import createFormSchemaCargosBase, { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import { criarCargosBaseAction, editarCargosBaseAction } from "@/actions/cargos-base";

const {
  useFormMock,
  zodResolverMock,
  pushMock,
  successNotificationMock,
  errorNotificationMock,
  useBuscarCargosBaseMock,
  useBuscarCargosBaseByIdMock,
  useMutationMock,
  formResetMock,
} = vi.hoisted(() => ({
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  pushMock: vi.fn(),
  successNotificationMock: vi.fn(),
  errorNotificationMock: vi.fn(),
  useBuscarCargosBaseMock: vi.fn(),
  useBuscarCargosBaseByIdMock: vi.fn(),
  useMutationMock: vi.fn((options: { mutationFn: (args: unknown) => Promise<unknown> }) => ({
    mutateAsync: vi.fn((args: unknown) => options.mutationFn(args)),
  })),
  formResetMock: vi.fn(),
}));
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

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

vi.mock("./useBuscarCargosBase", () => ({
  useBuscarCargosBase: useBuscarCargosBaseMock,
  useBuscarCargosBaseById: useBuscarCargosBaseByIdMock,
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: successNotificationMock,
    error: errorNotificationMock,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
}));

vi.mock("@/actions/cargos-base", () => ({
  criarCargosBaseAction: vi.fn(),
  editarCargosBaseAction: vi.fn(),
}));

const payloadBase: createFormSchemaCargosBaseData = {
  codigo_cargo: "1",
  grupamento: "2",
  descricao_resumida: "Resumo",
  descricao_completa: "Completa",
  situacao_funcional: "EFETIVO",
  status: "ATIVO",
  utilizado_para_funcoes: true,
  utilizado_para_designacoes: false,
  utilizado_para_ste: true,
  utilizado_para_permutas: false,
  cargo_base_ficticio: false,
  testar_laudo: false,
  pesquisar_licencas_no_sigpec: true,
  quantidade_maxima_de_dias_de_licenca: "10",
};

describe("hooks/useCriarEditarCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFormMock.mockReturnValue({
      mockedForm: true,
      reset: formResetMock,
      handleSubmit: vi.fn(),
    });
    useBuscarCargosBaseMock.mockReturnValue({
      data: [{ codigoCargo: 10, nomeCargo: "Cargo 10" }],
      isLoading: true,
    });
    useBuscarCargosBaseByIdMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it("configura useCriarCargosBase e retorna dados no sucesso", async () => {
    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: { id: 123 },
    });

    const { result } = renderHook(() => useCriarCargosBase());
    const response = await result.current.mutateAsync({ values: payloadBase });

    expect(useMutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
      }),
    );
    expect(criarCargosBaseAction).toHaveBeenCalledWith(payloadBase);
    expect(response).toEqual({ id: 123 });
  });

  it("configura useCriarCargosBase e lança erro na falha", async () => {
    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "erro ao criar",
    });

    const { result } = renderHook(() => useCriarCargosBase());
    await expect(result.current.mutateAsync({ values: payloadBase })).rejects.toThrow("erro ao criar");
  });

  it("configura useEditarCargosBase e retorna dados no sucesso", async () => {
    vi.mocked(editarCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: { id: 7 },
    });

    const values: Partial<createFormSchemaCargosBaseData> = { grupamento: "DOCENTES" };
    const { result } = renderHook(() => useEditarCargosBase());
    const response = await result.current.mutateAsync({ id: 7, values });

    expect(editarCargosBaseAction).toHaveBeenCalledWith(7, values);
    expect(response).toEqual({ id: 7 });
  });

  it("configura useEditarCargosBase e lança erro na falha", async () => {
    vi.mocked(editarCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "erro ao editar",
    });

    const { result } = renderHook(() => useEditarCargosBase());
    await expect(
      result.current.mutateAsync({ id: 7, values: { descricao_resumida: "Resumo" } }),
    ).rejects.toThrow("erro ao editar");
  });

  it("inicializa formulário com defaults e expõe estado dos hooks de consulta", () => {
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

    expect(result.current.form).toMatchObject({ mockedForm: true });
    expect(result.current.CargosBaseOpcoes).toEqual([{ codigoCargo: 10, nomeCargo: "Cargo 10" }]);
    expect(result.current.isLoadingCargosBase).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isLoadingEditarCargosBase).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith("CargosBaseOpcoes", [{ codigoCargo: 10, nomeCargo: "Cargo 10" }]);
  });

  it("permite sobrescrever valores padrão no useForm", () => {
    const customDefaults: createFormSchemaCargosBaseData = {
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
      testar_laudo: false,
      pesquisar_licencas_no_sigpec: true,
      quantidade_maxima_de_dias_de_licenca: "10",
    };

    renderHook(() => useCriarEditarCargosBase(null, customDefaults));

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: customDefaults,
      }),
    );
  });

  it("faz reset do form quando cargoBase é carregado para edição", () => {
    const cargoBase = {
      id: 44,
      grupamento: "DOCENTES",
      descricao_resumida: "Resumo edição",
      descricao_completa: "Completa edição",
      situacao_funcional: "EFETIVO",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_ste: false,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
      status: "ATIVO",
    };
    useBuscarCargosBaseByIdMock.mockReturnValue({
      data: cargoBase,
      isLoading: true,
    });

    renderHook(() => useCriarEditarCargosBase(44));
    expect(formResetMock).toHaveBeenCalledWith(cargoBase);
  });

  it("notifica sucesso e navega após criar cargo base", async () => {
    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: { id: 123 },
    });

    const { result } = renderHook(() => useCriarEditarCargosBase());

    await act(async () => {
      await result.current.onSubmitForm(payloadBase);
    });

    expect(criarCargosBaseAction).toHaveBeenCalledWith(payloadBase);
    expect(successNotificationMock).toHaveBeenCalledWith({
      title: "Tudo certo por aqui!",
      description: "O cargo base foi criado.",
    });
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
  });

  it("notifica sucesso e navega após editar cargo base removendo campos imutáveis", async () => {
    vi.mocked(editarCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: { id: 44 },
    });

    const { result } = renderHook(() => useCriarEditarCargosBase(44));
    const expectedPartial = {
      grupamento: "2",
      descricao_resumida: "Resumo",
      situacao_funcional: "EFETIVO",
      status: "ATIVO",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
    };

    await act(async () => {
      await result.current.onSubmitForm(payloadBase);
    });

    expect(editarCargosBaseAction).toHaveBeenCalledWith(44, expectedPartial);
    expect(criarCargosBaseAction).not.toHaveBeenCalled();
    expect(successNotificationMock).toHaveBeenCalledWith({
      title: "Tudo certo por aqui!",
      description: "As alterações foram salvas.",
    });
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
  });

  it("notifica erro quando criação falha", async () => {
    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "erro de API",
    });
    const { result } = renderHook(() => useCriarEditarCargosBase());

    await act(async () => {
      await result.current.onSubmitForm(payloadBase);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao salvar cargo base:", expect.any(Error));
    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "Não conseguimos criar o cargo base. Por favor, tente novamente.",
      clearPrevious: true,
    });
  });

  it("notifica erro específico quando edição falha", async () => {
    vi.mocked(editarCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "erro ao editar",
    });

    const { result } = renderHook(() => useCriarEditarCargosBase(88));

    await act(async () => {
      await result.current.onSubmitForm(payloadBase);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao salvar cargo base:", expect.any(Error));
    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "Não conseguimos salvar as alterações. Por favor, tente novamente.",
      clearPrevious: true,
    });
  });
});
