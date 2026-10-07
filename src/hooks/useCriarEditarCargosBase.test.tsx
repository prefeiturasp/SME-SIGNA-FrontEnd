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
  formWatchMock,
  formTriggerMock,
  invalidateQueriesMock,
} = vi.hoisted(() => ({
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  pushMock: vi.fn(),
  successNotificationMock: vi.fn(),
  errorNotificationMock: vi.fn(),
  useBuscarCargosBaseMock: vi.fn(),
  useBuscarCargosBaseByIdMock: vi.fn(),
  useMutationMock: vi.fn((options: { mutationFn: (args: unknown) => Promise<unknown>; onSuccess?: () => void }) => ({
    mutateAsync: vi.fn(async (args: unknown) => {
      const result = await options.mutationFn(args);
      options.onSuccess?.();
      return result;
    }),
  })),
  formResetMock: vi.fn(),
  formWatchMock: vi.fn(),
  formTriggerMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
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
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
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
  permite_substituicao: false,
  possui_periodo_fechado: false,
  data_fim_periodo: null,
};

describe("hooks/useCriarEditarCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formWatchMock.mockImplementation((name: string) => {
      if (name === "quantidade_maxima_de_dias_de_licenca") {
        return "15";
      }

      if (name === "pesquisar_licencas_no_sigpec") {
        return false;
      }

      return undefined;
    });
    useFormMock.mockReturnValue({
      mockedForm: true,
      reset: formResetMock,
      watch: formWatchMock,
      trigger: formTriggerMock,
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
    const response = await result.current.mutateAsync({ values: { ...payloadBase, data_fim_periodo: payloadBase.data_fim_periodo?.toISOString().split("T")[0] ?? null } });

    expect(useMutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
      }),
    );
    expect(criarCargosBaseAction).toHaveBeenCalledWith(payloadBase);
    expect(response).toEqual({ id: 123 });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["get-cargos"] });
  });

  it("configura useCriarCargosBase e lança erro na falha", async () => {
    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "erro ao criar",
    });

    const { result } = renderHook(() => useCriarCargosBase());
    await expect(result.current.mutateAsync({ values: { ...payloadBase, data_fim_periodo: payloadBase.data_fim_periodo?.toISOString().split("T")[0] ?? null } })).rejects.toThrow("erro ao criar");
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
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["get-cargos"] });
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
          testar_laudo: false,
          pesquisar_licencas_no_sigpec: false,
          quantidade_maxima_de_dias_de_licenca: "15",
          permite_substituicao: false,
          possui_periodo_fechado: false,
          data_fim_periodo: null,
        },
        mode: "onChange",
      }),
    );

    expect(result.current.form).toMatchObject({ mockedForm: true });
    expect(result.current.CargosBaseOpcoes).toEqual([{ codigoCargo: 10, nomeCargo: "Cargo 10" }]);
    expect(result.current.isLoadingCargosBase).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isLoadingEditarCargosBase).toBe(false);
    expect(useBuscarCargosBaseByIdMock).toHaveBeenCalledWith(0);
    expect(formTriggerMock).toHaveBeenCalledWith([
      "quantidade_maxima_de_dias_de_licenca",
      "pesquisar_licencas_no_sigpec",
    ]);
  });

  it("usa lista vazia quando a busca de cargos base ainda não retornou dados", () => {
    useBuscarCargosBaseMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useCriarEditarCargosBase());

    expect(result.current.CargosBaseOpcoes).toEqual([]);
    expect(result.current.isLoadingCargosBase).toBe(false);
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
      permite_substituicao: true,
      possui_periodo_fechado: true,
      data_fim_periodo: new Date(2026, 0, 31),
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
      testar_laudo: true,
      pesquisar_licencas_no_sigpec: true,
      quantidade_maxima_de_dias_de_licenca: 30,
      status: "ATIVO",
      permite_substituicao: true,
      possui_periodo_fechado: true,
      data_fim_periodo: "2026-01-31",
    };
    useBuscarCargosBaseByIdMock.mockReturnValue({
      data: cargoBase,
      isLoading: true,
    });

    renderHook(() => useCriarEditarCargosBase(44));
    expect(useBuscarCargosBaseByIdMock).toHaveBeenCalledWith(44);
    expect(formResetMock).toHaveBeenCalledWith({
      ...cargoBase,
      data_fim_periodo: new Date("2026/01/31"),
      quantidade_maxima_de_dias_de_licenca: "30",
    });
  });

  it("reseta quantidade máxima de dias como zero quando cargo carregado não possui valor", () => {
    const cargoBase = {
      id: 45,
      grupamento: "DOCENTES",
      descricao_resumida: "Resumo edição",
      descricao_completa: "Completa edição",
      situacao_funcional: "EFETIVO",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_ste: false,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
      testar_laudo: false,
      pesquisar_licencas_no_sigpec: true,
      status: "ATIVO",
      permite_substituicao: false,
      possui_periodo_fechado: false,
      data_fim_periodo: null,
    };
    useBuscarCargosBaseByIdMock.mockReturnValue({
      data: cargoBase,
      isLoading: false,
    });

    renderHook(() => useCriarEditarCargosBase(45));
    expect(formResetMock).toHaveBeenCalledWith({
      ...cargoBase,
      quantidade_maxima_de_dias_de_licenca: "0",
    });
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
      testar_laudo: false,
      pesquisar_licencas_no_sigpec: true,
      quantidade_maxima_de_dias_de_licenca: "10",
      permite_substituicao: false,
      possui_periodo_fechado: false,
      data_fim_periodo: null,
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

    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "erro de API",
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

    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "erro ao editar",
      clearPrevious: true,
    });
  });

  it("formata a data final do período ao editar o cargo", async () => {
    vi.mocked(editarCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: { id: 44 },
    });

    const dataFim = new Date(2026, 5, 15);
    const { result } = renderHook(() => useCriarEditarCargosBase(44));

    await act(async () => {
      await result.current.onSubmitForm({
        ...payloadBase,
        possui_periodo_fechado: true,
        data_fim_periodo: dataFim,
      });
    });

    expect(editarCargosBaseAction).toHaveBeenCalledWith(
      44,
      expect.objectContaining({
        data_fim_periodo: dataFim.toISOString().split("T")[0],
      }),
    );
  });

  it("usa a mensagem padrão de criação quando a falha não é um Error", async () => {
    vi.mocked(criarCargosBaseAction).mockRejectedValueOnce("falha crua");

    const { result } = renderHook(() => useCriarEditarCargosBase());

    await act(async () => {
      await result.current.onSubmitForm(payloadBase);
    });

    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "Não conseguimos criar o cargo base. Por favor, tente novamente.",
      clearPrevious: true,
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("usa a mensagem padrão de edição quando a falha não é um Error", async () => {
    vi.mocked(editarCargosBaseAction).mockRejectedValueOnce("falha crua");

    const { result } = renderHook(() => useCriarEditarCargosBase(88));

    await act(async () => {
      await result.current.onSubmitForm(payloadBase);
    });

    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "Não conseguimos salvar as alterações. Por favor, tente novamente.",
      clearPrevious: true,
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
