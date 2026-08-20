import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVisualizarCargosBase } from "./useVisualizarCargosBase";
import type { CargosBaseFiltros, CargosBasePaginada } from "@/types/gestao";

const {
  useFormMock,
  zodResolverMock,
  fetchCargosBaseMock,
  notificationErrorMock,
  resetMock,
  getValuesMock,
} = vi.hoisted(() => ({
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  fetchCargosBaseMock: vi.fn(),
  notificationErrorMock: vi.fn(),
  resetMock: vi.fn(),
  getValuesMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [
      false,
      (callback: () => void | Promise<void>) => {
        void callback();
      },
    ],
  };
});

vi.mock("react-hook-form", () => ({
  useForm: useFormMock,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("@/actions/gestao", () => ({
  fetchCargosBase: fetchCargosBaseMock,
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    error: notificationErrorMock,
  }),
}));

const resultadoMock: CargosBasePaginada = {
  count: 1,
  next: null,
  previous: null,
  results: [
      {
      id: 1,
      grupamento: "Docentes",
      descricao_resumida: "Resumo",
      descricao_completa: "Descrição completa",
      situacao_funcional: "EFETIVO",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
      status: "ATIVO",  
      testar_laudo: false,
      pesquisar_licencas_no_sigpec: false,
      quantidade_maxima_de_dias_de_licenca: "10",
    },
  ],
};

describe("useVisualizarCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getValuesMock.mockReturnValue({
      grupamento: "",
      descricao_resumida: "",
      descricao_completa: "",
      situacao_funcional: "",
      status: "",
    } satisfies CargosBaseFiltros);
    useFormMock.mockReturnValue({
      getValues: getValuesMock,
      reset: resetMock,
    });
    fetchCargosBaseMock.mockResolvedValue({
      success: true,
      data: resultadoMock,
    });
  });

  it("inicializa o formulário e executa busca inicial com página 1", async () => {
    const { result } = renderHook(() => useVisualizarCargosBase());

    expect(zodResolverMock).toHaveBeenCalledTimes(1);
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
      expect(fetchCargosBaseMock).toHaveBeenCalledWith({
        grupamento: "",
        descricao_resumida: "",
        descricao_completa: "",
        situacao_funcional: "",
        status: "",
        page: 1,
      });
    });

    expect(result.current.isPending).toBe(false);
  });

  it("avança de página usando os filtros atuais do formulário", async () => {
    const filtrosAtuais: CargosBaseFiltros = {
      grupamento: "Docentes",
      descricao_resumida: "Res",
      descricao_completa: "",
      situacao_funcional: "EFETIVO",
      status: "ATIVO",
    };
    getValuesMock.mockReturnValue(filtrosAtuais);

    const { result } = renderHook(() => useVisualizarCargosBase());

    await waitFor(() => {
      expect(fetchCargosBaseMock).toHaveBeenCalledTimes(1);
    });

    result.current.onPageChange(4);

    await waitFor(() => {
      expect(fetchCargosBaseMock).toHaveBeenLastCalledWith({
        ...filtrosAtuais,
        page: 4,
      });
    });

  });

  it("limpa filtros com defaults recebidos e busca novamente", async () => {
    const customDefaults: CargosBaseFiltros = {
      grupamento: "Grupo X",
      descricao_resumida: "Resumo X",
      descricao_completa: "",
      situacao_funcional: "ATIVO",
      status: "ATIVO",
    };

    const { result } = renderHook(() => useVisualizarCargosBase(customDefaults));

    await waitFor(() => {
      expect(fetchCargosBaseMock).toHaveBeenCalledTimes(1);
    });

    result.current.handleClear();

    expect(resetMock).toHaveBeenCalledWith(customDefaults);
    await waitFor(() => {
      expect(fetchCargosBaseMock).toHaveBeenLastCalledWith({
        ...customDefaults,
        page: 1,
      });
    });
  });

  it("submete filtro e força busca na página 1", async () => {
    const { result } = renderHook(() => useVisualizarCargosBase());
    const filtro: CargosBaseFiltros = {
      grupamento: "GESTAO",
      descricao_resumida: "Diretor",
      descricao_completa: "",
      situacao_funcional: "EFETIVO",
      status: "ATIVO",
    };

    await waitFor(() => {
      expect(fetchCargosBaseMock).toHaveBeenCalledTimes(1);
    });

    result.current.onSubmitFilterForm(filtro);

    await waitFor(() => {
      expect(fetchCargosBaseMock).toHaveBeenLastCalledWith({
        ...filtro,
        page: 1,
      });
    });
  });

  it("notifica erro quando a busca falha", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchCargosBaseMock.mockResolvedValueOnce({
      success: false,
      error: "Falha ao consultar",
    });

    renderHook(() => useVisualizarCargosBase());

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Erro ao buscar cargos base!",
        clearPrevious: true,
      });
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Falha ao consultar");
  });
});
