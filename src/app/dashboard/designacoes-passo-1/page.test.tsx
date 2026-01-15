import React, { type ComponentProps, type SVGProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DesignacoesPage from "./page";

const mockPageHeader = vi.fn();
const mockMutateAsync = vi.fn();
const mockResumoDesignacao = vi.fn();
const mockRouterPush = vi.fn();

const mockResponse = {
  servidor: "Servidor Teste",
  rf: "123",
  vinculo: "Ativo",
  lotacao: "Escola X",
  cargo_base: "Professor",
  aulas_atribuidas: "20",
  funcao: "Docente",
  cargo_sobreposto: "Nenhum",
  cursos_titulos: "Licenciatura",
  estagio_probatorio: "Sim",
  aprovado_em_concurso: "Sim",
  laudo_medico: "Não",
};

vi.mock("@/hooks/useServidorDesignacao", () => ({
  __esModule: true,
  default: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

type PageHeaderProps = {
  title: string;
  breadcrumbs: { title: string; href?: string }[];
  icon: React.ReactNode;
  showBackButton?: boolean;
};

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: PageHeaderProps) => {
    mockPageHeader(props);
    return <div data-testid="page-header">{props.title}</div>;
  },
}));

vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  __esModule: true,
  default: () => <div data-testid="stepper-designacao" />,
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  __esModule: true,
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="fundo-branco" className={className}>
      {children}
    </div>
  ),
}));

type ResumoDesignacaoProps = { defaultValues?: typeof mockResponse };

vi.mock("@/components/dashboard/Designacao/ResumoDesignacao", () => ({
  __esModule: true,
  default: (props: ResumoDesignacaoProps) => {
    mockResumoDesignacao(props);
    return (
      <div data-testid="resumo-designacao">{props.defaultValues?.servidor}</div>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao", () => ({
  __esModule: true,
  default: ({
    onBuscaDesignacao,
  }: {
    onBuscaDesignacao: (values: { rf: string; nome_do_servidor: string }) => void;
  }) => (
    <button
      data-testid="botao-buscar-designacao"
      onClick={() =>
        onBuscaDesignacao({
          rf: "123",
          nome_do_servidor: "Servidor Teste",
        })
      }
    >
      Buscar
    </button>
  ),
}));

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => (
    <svg data-testid="designacao-icon" {...props} />
  ),
}));

vi.mock("antd", () => ({
  Divider: (props: ComponentProps<"div">) => (
    <div data-testid="divider" {...props} />
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

describe("Designacoes page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({ success: true, data: mockResponse });
  });

  it("renderiza o header sem botão de voltar e com breadcrumbs corretos", () => {
    render(<DesignacoesPage />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Designação");
    expect(mockPageHeader).toHaveBeenCalledTimes(1);

    const { title, showBackButton, breadcrumbs, icon } =
      mockPageHeader.mock.calls[0][0];
    expect(title).toBe("Designação");
    expect(showBackButton).toBe(false);
    expect(breadcrumbs).toEqual([
      { title: "Início", href: "/" },
      { title: "Designação" },
    ]);
    expect(icon).toBeDefined();
  });

  it("renderiza resumo e stepper quando a busca retorna dados", async () => {
    render(<DesignacoesPage />);

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      rf: "123",
      nome_do_servidor: "Servidor Teste",
    });

    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    expect(screen.getByText("Servidor Teste")).toBeInTheDocument();
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
    expect(screen.getAllByTestId("fundo-branco").length).toBeGreaterThan(0);
    expect(mockResumoDesignacao).toHaveBeenCalledWith(
      expect.objectContaining({ defaultValues: mockResponse })
    );
  });
});