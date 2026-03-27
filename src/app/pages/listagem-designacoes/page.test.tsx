import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import ListagemDesignacoesPage from "./page";

/* ================= MOCKS ================= */

const pageHeaderSpy = vi.fn();
const fundoBrancoSpy = vi.fn();
const listagemSpy = vi.fn();

const mockResults = [
  { id: 1, indicado_rf: "111", indicado_nome_servidor: "Servidor A", status: 0 },
  { id: 2, indicado_rf: "222", indicado_nome_servidor: "Servidor B", status: 1 },
];

const mockFetchDesignacoesAction = vi.fn();

vi.mock("@/actions/designacao", () => ({
  fetchDesignacoesAction: (...args: unknown[]) =>
    mockFetchDesignacoesAction(...args),
}));

vi.mock("@/hooks/useUnidades", () => ({
  useFetchDREs: () => ({ data: [] }),
  useFetchUEs: () => ({ data: [] }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
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
    watch: vi.fn().mockReturnValue(""),
    reset: vi.fn(),
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
    default: () => (
      <div>
        <span>Filtro de Designacoes</span>
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
});