import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import ListagemDesignacoesPage from "./page";

/* ================= MOCKS ================= */

const pageHeaderSpy = vi.fn();
const fundoBrancoSpy = vi.fn();
const listagemSpy = vi.fn();
const toastMock = vi.fn();
const pushMock = vi.fn();
const useFetchUEsSpy = vi.fn();

const mockResults = [
  { id: 1, indicado_rf: "111", indicado_nome_servidor: "Servidor A", status: 0 },
  { id: 2, indicado_rf: "222", indicado_nome_servidor: "Servidor B", status: 1 },
];

const mockFetchDesignacoesAction = vi.fn();
const resetMock = vi.fn();
const dreOptionsMock: Array<{ codigoDRE: string; nomeDRE: string }> = [];
const ueOptionsMock: Array<{ codigoEscola: string; nomeEscola: string }> = [];

vi.mock("@/actions/designacao", () => ({
  fetchDesignacoesAction: (...args: unknown[]) =>
    mockFetchDesignacoesAction(...args),
}));

vi.mock("@/hooks/useUnidades", () => ({
  useFetchDREs: () => ({ data: dreOptionsMock }),
  useFetchUEs: (codigo: string) => {
    useFetchUEsSpy(codigo);
    return { data: ueOptionsMock };
  },
}));

vi.mock("@/components/ui/headless-toast", () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => pushMock(...args),
  }),
}));

vi.mock("date-fns", () => ({
  format: (date: Date, fmt: string) => `formatted-${fmt}`,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()],
  };
});

const mockGetValues = vi.fn();
const watchMock = vi.fn();

const mockHandleSubmit =
  (submitFn: (values: Record<string, unknown>) => void) =>
    (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();
      submitFn(mockGetValues());
    };

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit: mockHandleSubmit,
    getValues: mockGetValues,
    control: {},
    formState: { errors: {} },
    register: vi.fn(),
    setValue: vi.fn(),
    watch: (...args: unknown[]) => watchMock(...args),
    reset: (...args: unknown[]) => resetMock(...args),
    clearErrors: vi.fn(),
  }),
  FormProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: any) => {
    pageHeaderSpy(props);
    return (
      <div data-testid="page-header">
        {props.icon}
        {props.createButton}
      </div>
    );
  },
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => {
    fundoBrancoSpy();
    return <section data-testid="fundo-branco">{children}</section>;
  },
}));

vi.mock(
  "@/components/dashboard/Designacao/ListagemDeDesignacoes/ListagemDeDesignacoes",
  () => ({
    __esModule: true,
    default: (props: any) => {
      listagemSpy(props);
      return <div data-testid="listagem-de-designacoes" />;
    },
  })
);

vi.mock(
  "@/components/dashboard/Designacao/FiltroDeDesignacoes/FiltroDeDesignacoes",
  () => ({
    __esModule: true,
    default: ({ onClear }: { onClear: () => void }) => (
      <div>
        <span>Filtro de Designacoes</span>
        <button type="button" onClick={onClear}>
          Limpar
        </button>
        <button type="submit">Pesquisar</button>
      </div>
    ),
  })
);

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    className,
    onClick,
  }: {
    children: ReactNode;
    type?: "button" | "submit" | "reset";
    className?: string;
    onClick?: () => void;
  }) => (
    <button type={type} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/assets/icons/Alert", () => ({
  __esModule: true,
  default: () => <span data-testid="icon-filter" />,
}));

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: () => <span data-testid="icon-designacao" />,
}));

/* ================= TESTES ================= */

describe("ListagemDesignacoesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dreOptionsMock.splice(0, dreOptionsMock.length);
    ueOptionsMock.splice(0, ueOptionsMock.length);

    mockFetchDesignacoesAction.mockResolvedValue({
      success: true,
      data: {
        count: 2,
        next: null,
        previous: null,
        results: mockResults,
      },
    });

    mockGetValues.mockReturnValue({
      rf: "",
      nome_servidor: "",
      periodo: undefined,
      cargo_base: "",
      cargo_sobreposto: "",
      dre: "",
      unidade_escolar: "",
      ano: "",
    });
    watchMock.mockReturnValue("");
  });

  it("renderiza cabeçalho, container e listagem", async () => {
    render(<ListagemDesignacoesPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("fundo-branco")).toBeInTheDocument();
    expect(screen.getByTestId("listagem-de-designacoes")).toBeInTheDocument();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(
      screen.getByText("Iniciar Nova Designação")
    ).toBeInTheDocument();

    const headerProps = pageHeaderSpy.mock.calls[0][0];
    expect(headerProps.title).toBe("");
    expect(headerProps.showBackButton).toBe(false);
  });

  it("chama fetch no mount", async () => {
    render(<ListagemDesignacoesPage />);

    await waitFor(() => {
      expect(mockFetchDesignacoesAction).toHaveBeenCalledTimes(1);
    });
  });

  it("atualiza a listagem com dados", async () => {
    render(<ListagemDesignacoesPage />);

    await waitFor(() => {
      const lastCall =
        listagemSpy.mock.calls[listagemSpy.mock.calls.length - 1][0];
      expect(lastCall.data).toEqual(mockResults);
    });
  });

  it("submete o formulário", async () => {
    render(<ListagemDesignacoesPage />);

    await waitFor(() =>
      expect(mockFetchDesignacoesAction).toHaveBeenCalledTimes(1)
    );

    fireEvent.click(screen.getByRole("button", { name: "Pesquisar" }));

    await waitFor(() =>
      expect(mockFetchDesignacoesAction).toHaveBeenCalledTimes(2)
    );
  });

  it("paginação chama API com nova página", async () => {
    render(<ListagemDesignacoesPage />);

    await waitFor(() =>
      expect(mockFetchDesignacoesAction).toHaveBeenCalledTimes(1)
    );

    const lastProps =
      listagemSpy.mock.calls[listagemSpy.mock.calls.length - 1][0];

    lastProps.onPageChange(2);

    await waitFor(() =>
      expect(mockFetchDesignacoesAction).toHaveBeenCalledTimes(2)
    );

    expect(mockFetchDesignacoesAction).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 2,
      })
    );
  });

  it("atualiza estado da página", async () => {
    render(<ListagemDesignacoesPage />);

    await waitFor(() =>
      expect(mockFetchDesignacoesAction).toHaveBeenCalledTimes(1)
    );

    const lastProps =
      listagemSpy.mock.calls[listagemSpy.mock.calls.length - 1][0];

    lastProps.onPageChange(3);

    await waitFor(() => {
      const updated =
        listagemSpy.mock.calls[listagemSpy.mock.calls.length - 1][0];
      expect(updated.page).toBe(3);
    });
  });

  it("loga erro quando falha", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

    mockFetchDesignacoesAction.mockResolvedValueOnce({
      success: false,
      error: "Erro",
    });

    render(<ListagemDesignacoesPage />);

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Erro");
    });

    errorSpy.mockRestore();
  });

  it("executa limpar filtros e refaz a busca com payload vazio", async () => {
    render(<ListagemDesignacoesPage />);

    await waitFor(() =>
      expect(mockFetchDesignacoesAction).toHaveBeenCalledTimes(1)
    );

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

    expect(resetMock).toHaveBeenCalledWith({
      rf: "",
      nome_servidor: "",
      periodo: undefined,
      cargo_base: "",
      cargo_sobreposto: "",
      dre: "",
      unidade_escolar: "",
      ano: "",
    });

    await waitFor(() =>
      expect(mockFetchDesignacoesAction).toHaveBeenCalledTimes(2)
    );
    expect(mockFetchDesignacoesAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, page_size: 10, unidade: "" })
    );
  });

  it("aciona navegação ao clicar em Iniciar Nova Designação", async () => {
    render(<ListagemDesignacoesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar Nova Designação" }));
    expect(pushMock).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-1");
  });

  it("gera exportação com unidade mapeada e datas formatadas", async () => {
    dreOptionsMock.push({ codigoDRE: "DRE-01", nomeDRE: "DRE Norte" });
    ueOptionsMock.push({ codigoEscola: "UE-1", nomeEscola: "Escola Mapeada" });
    watchMock.mockReturnValue("DRE Norte");
    mockGetValues.mockReturnValue({
      rf: "123",
      nome_servidor: "Servidor X",
      periodo: { from: new Date("2026-01-02"), to: new Date("2026-01-30") },
      cargo_base: "Cargo Base",
      cargo_sobreposto: "Cargo Sobreposto",
      dre: "DRE Norte",
      unidade_escolar: "UE-1",
      ano: "2026",
    });

    mockFetchDesignacoesAction
      .mockResolvedValueOnce({
        success: true,
        data: {
          count: 2,
          next: null,
          previous: null,
          results: mockResults,
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [{ id: 99 }],
        },
      });

    render(<ListagemDesignacoesPage />);

    await waitFor(() => {
      expect(useFetchUEsSpy).toHaveBeenCalledWith("DRE-01");
    });

    const lastProps = listagemSpy.mock.calls[listagemSpy.mock.calls.length - 1][0];
    const result = await lastProps.generateExportData();

    expect(result).toEqual([{ id: 99 }]);
    expect(mockFetchDesignacoesAction).toHaveBeenLastCalledWith(
      expect.objectContaining({
        periodo_after: "formatted-yyyy-MM-dd",
        periodo_before: "formatted-yyyy-MM-dd",
        unidade: "Escola Mapeada",
        no_pagination: true,
      })
    );
  });

  it("retorna lista vazia e exibe toast quando exportação falha", async () => {
    mockFetchDesignacoesAction
      .mockResolvedValueOnce({
        success: true,
        data: { count: 0, next: null, previous: null, results: [] },
      })
      .mockResolvedValueOnce({
        success: false,
        error: "Falha no CSV",
      });

    render(<ListagemDesignacoesPage />);
    const lastProps = listagemSpy.mock.calls[listagemSpy.mock.calls.length - 1][0];

    const result = await lastProps.generateExportData();

    expect(result).toEqual([]);
    expect(toastMock).toHaveBeenCalledWith({
      variant: "error",
      title: "Erro ao gerar o arquivo CSV.",
      description: "Falha no CSV",
    });
  });
});