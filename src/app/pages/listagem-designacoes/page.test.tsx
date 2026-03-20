import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import ListagemDesignacoesPage from "./page";

const pageHeaderSpy = vi.fn();
const fundoBrancoSpy = vi.fn();
const listagemSpy = vi.fn();
const mockedSubmitValues = {
  rf: "",
  nome_servidor: "",
  periodo: new Date("2026-01-01T00:00:00.000Z"),
  cargo_base: "",
  cargo_sobreposto: "",
  dre: "",
  unidade_escolar: "",
  ano: "",
};

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => undefined,
}));

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit:
      (submitFn: (values: typeof mockedSubmitValues) => void) =>
      (event?: { preventDefault?: () => void }) => {
        event?.preventDefault?.();
        submitFn(mockedSubmitValues);
      },
  }),
  FormProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: {
    icon?: ReactNode;
    createButton?: ReactNode;
    title: string;
    showBackButton: boolean;
    breadcrumbs: Array<{ title: string; href?: string }>;
  }) => {
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
    default: ({ data }: { data: unknown[] }) => {
      listagemSpy(data);
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
  }: {
    children: ReactNode;
    type?: "button" | "submit" | "reset";
    className?: string;
  }) => (
    <button type={type} className={className}>
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

describe("ListagemDesignacoesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza cabeçalho, container e listagem com dados mockados", () => {
    render(<ListagemDesignacoesPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("fundo-branco")).toBeInTheDocument();
    expect(screen.getByTestId("listagem-de-designacoes")).toBeInTheDocument();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByText("Iniciar Nova Designação")).toBeInTheDocument();
    expect(screen.getByTestId("icon-filter")).toBeInTheDocument();
    expect(screen.getByTestId("icon-designacao")).toBeInTheDocument();

    expect(fundoBrancoSpy).toHaveBeenCalled();
    expect(listagemSpy).toHaveBeenCalled();

    const listagemData = listagemSpy.mock.calls[0][0] as Array<{
      key: string;
      status: number;
    }>;
    expect(listagemData).toHaveLength(20);
    expect(listagemData[0]).toMatchObject({ key: "0", status: 0 });
    expect(listagemData[1]).toMatchObject({ key: "1", status: 1 });
    expect(listagemData[2]).toMatchObject({ key: "2", status: 2 });
    expect(listagemData[3]).toMatchObject({ key: "3", status: 3 });

    const headerProps = pageHeaderSpy.mock.calls[0][0] as {
      title: string;
      showBackButton: boolean;
      breadcrumbs: Array<{ title: string; href?: string }>;
    };
    expect(headerProps.title).toBe("");
    expect(headerProps.showBackButton).toBe(false);
    expect(headerProps.breadcrumbs).toEqual([
      { title: "Início", href: "/" },
      { title: "Designação" },
    ]);
  });

  it("submete o formulário e executa o onSubmit com os valores padrão", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    render(<ListagemDesignacoesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(mockedSubmitValues);

    logSpy.mockRestore();
  });
});
