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
  nome: "Servidor Teste",
  rf: "123",
  vinculo_cargo_sobreposto: "Ativo",
  lotacao_cargo_sobreposto: "Escola X",
  cargo_base: "Professor",
  aulas_atribuidas: "20",
  funcao_atividade: "Docente",
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
    return (
      <div data-testid="page-header">
        {props.title}
        {props.icon}
      </div>
    );
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
      <div data-testid="resumo-designacao">{props.defaultValues?.nome}</div>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao", () => ({
  __esModule: true,
  default: function MockFormularioBuscaDesignacao({
    onBuscaDesignacao,
  }: {
    onBuscaDesignacao: (values: { rf: string }) => void;
  }) {
    const [rf, setRf] = React.useState("");
    return (
      <div>
        <input
          data-testid="input-rf"
          value={rf}
          onChange={(event) => setRf(event.currentTarget.value)}
        />
        <button
          data-testid="botao-buscar-designacao"
          onClick={() => onBuscaDesignacao({ rf: rf || "123" })}
        >
          Buscar
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  __esModule: true,
  default: ({
    disableAnterior,
    disableProximo,
    onProximo,
    onAnterior,
  }: {
    disableAnterior: boolean;
    disableProximo: boolean;
    onProximo: () => void;
    onAnterior: () => void;
  }) => (
    <div>
      <button
        data-testid="botao-anterior"
        disabled={disableAnterior}
        onClick={onAnterior}
      >
        Anterior
      </button>
      <button
        data-testid="botao-proximo"
        disabled={disableProximo}
        onClick={onProximo}
      >
        Próximo
      </button>
    </div>
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
      rf: "123"
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


  it("não renderiza resumo e stepper quando a busca retorna erro", async () => {
    mockMutateAsync.mockResolvedValue({ success: false, error: "Erro ao buscar servidor" });
    render(<DesignacoesPage />);

       
    await userEvent.click(screen.getByTestId("input-rf"));
    await userEvent.type(screen.getByTestId("input-rf"), "123456");

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    await waitFor(() => {
      expect(screen.getByText("Erro ao buscar servidor")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("resumo-designacao")).not.toBeInTheDocument();
    
    
    expect(mockResumoDesignacao).not.toHaveBeenCalled();
  });


  it("renderiza resumo e stepper quando a busca retorna dados", async () => {
    mockMutateAsync.mockResolvedValue({ success: true, data: mockResponse });
    render(<DesignacoesPage />);

       
    await userEvent.click(screen.getByTestId("input-rf"));
    await userEvent.type(screen.getByTestId("input-rf"), "123456");

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

 
    expect(screen.queryByTestId("resumo-designacao")).toBeInTheDocument();
    
    
    
  });



  it("navega para o próximo passo ao clicar no botão próximo", async () => {
    mockMutateAsync.mockImplementation(async (values: { rf: string }) => ({
      success: true,
      data: {
        ...mockResponse,
        rf: values.rf,
      },
    }));

    render(<DesignacoesPage />);
 
    await userEvent.type(screen.getByTestId("input-rf"), "456");
    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      rf: "456"
     });

    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("botao-proximo"));

    expect(mockRouterPush).toHaveBeenCalledWith("/pages/designacoes-passo-2?456");

  });

  it("não exibe conteúdo da designação quando data.nome não existe", () => {
    render(<DesignacoesPage />);

    expect(screen.queryByTestId("resumo-designacao")).not.toBeInTheDocument();
    expect(screen.queryByText("Validar dados")).not.toBeInTheDocument();
    expect(screen.queryByTestId("botao-proximo")).not.toBeInTheDocument();
  });

  it("desabilita o botão anterior sempre", async () => {
    render(<DesignacoesPage />);

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    await waitFor(() => {
      expect(screen.getByTestId("botao-anterior")).toBeDisabled();
    });
  });


  it("exibe mensagem de erro personalizada quando a API retorna erro", async () => {
    mockMutateAsync.mockResolvedValue({ 
      success: false, 
      error: "Servidor não encontrado" 
    });

    render(<DesignacoesPage />);

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    await waitFor(() => {
      expect(screen.getByText("Servidor não encontrado")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("resumo-designacao")).not.toBeInTheDocument();
  });

  it("limpa o erro quando uma nova busca com sucesso é realizada", async () => {
    mockMutateAsync.mockResolvedValueOnce({ 
      success: false, 
      error: "Erro inicial" 
    });

    const { rerender } = render(<DesignacoesPage />);

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    await waitFor(() => {
      expect(screen.getByText("Erro inicial")).toBeInTheDocument();
    });

    mockMutateAsync.mockResolvedValueOnce({ 
      success: true, 
      data: mockResponse 
    });

    rerender(<DesignacoesPage />);

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });
  });



  it("não navega para o próximo passo se não houver dados", async () => {
    render(<DesignacoesPage />);

    expect(screen.queryByTestId("botao-proximo")).not.toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });


  it("exibe todos os componentes quando a busca é bem-sucedida", async () => {
    render(<DesignacoesPage />);

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
      expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
      expect(screen.getAllByTestId("fundo-branco").length).toBeGreaterThan(0);
      expect(screen.getByTestId("botao-proximo")).toBeInTheDocument();
      expect(screen.getByTestId("botao-anterior")).toBeInTheDocument();
    });
  });

 

  it("renderiza título do header de acordo com breadcrumb", () => {
    render(<DesignacoesPage />);

    expect(mockPageHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Designação" },
        ],
      })
    );
  });

  it("passa os dados corretos para o ResumoDesignacao", async () => {
    render(<DesignacoesPage />);

    await userEvent.click(screen.getByTestId("botao-buscar-designacao"));

    await waitFor(() => {
      expect(mockResumoDesignacao).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: expect.objectContaining({
            nome: "Servidor Teste",
            rf: "123",
            vinculo_cargo_sobreposto: "Ativo",
            lotacao_cargo_sobreposto: "Escola X",
          }),
        })
      );
    });
  });


});
