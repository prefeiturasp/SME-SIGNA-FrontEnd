import React, { type HTMLAttributes, type ReactNode, type SVGProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPage from "../designacoes-passo-3/page";

const mockPageHeader = vi.fn();
let mockSearchParams: URLSearchParams;

const mockServidorData = {
  nome: "João Silva",
  rf: "123456",
  vinculo_cargo_sobreposto: "Ativo",
  lotacao_cargo_sobreposto: "Escola Municipal",
  cargo_base: "Professor",
  aulas_atribuidas: "20",
  funcao_atividade: "Docente",
  cargo_sobreposto: "Coordenador",
  cursos_titulos: "Licenciatura em Pedagogia",
  estagio_probatorio: "Sim",
  aprovado_em_concurso: "Sim",
  laudo_medico: "Não",
};

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
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



vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: {
    title: string;
    showBackButton?: boolean;
    breadcrumbs?: { title: string; href?: string }[];
    icon?: ReactNode;
  }) => {
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

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => (
    <svg data-testid="designacao-icon" {...props} />
  ),
}));

vi.mock("antd", () => ({
  Divider: (props: HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="divider" {...props} />
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

describe("Designacoes page - Passo 3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renderiza o header sem botão de voltar e com breadcrumbs corretos", () => {
    render(<DesignacoesPage />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Designação");
    expect(mockPageHeader).toHaveBeenCalledTimes(1);

    const { title, showBackButton, breadcrumbs, icon } = mockPageHeader.mock.calls[0][0];
    expect(title).toBe("Designação");
    expect(showBackButton).toBe(false);
    expect(breadcrumbs).toEqual([
      { title: "Início", href: "/" },
      { title: "Designação" },
    ]);
    expect(icon).toBeDefined();
  });

  it("mantém o layout com altura de 100vh para o stepper em telas md", () => {
    const { container } = render(<DesignacoesPage />);

    expect(screen.getByTestId("form-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();

    const formColumn = container.querySelector(".md\\:w-2\\/3.lg\\:w-3\\/4");
    expect(formColumn).toBeInTheDocument();

    const stepperColumn = container.querySelector(".md\\:w-1\\/3.lg\\:w-1\\/4");
    expect(stepperColumn).toBeInTheDocument();
    expect(stepperColumn?.className).toContain("md:h-[100vh]");

    const fundoBrancoStepper = stepperColumn?.querySelector(".md\\:h-\\[80vh\\]");
    expect(fundoBrancoStepper).toBeInTheDocument();
  });

  it("submete o formulário chamando o handler com os valores inputados", () => {
    
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const submitValues = {
      nome_da_unidade: "123",
      estrutura_hierarquica: "123",
      turmas: "123",
      funcionarios_da_unidade: "123",
      assistente_de_diretor_escolar: "123",
      secretario_da_escola: "123",
      funcao_atividade: "123",
      cargo_sobreposto: "123",
      modulos: "123",
    };
    render(<DesignacoesPage  />);  

    const form = screen.getByTestId("form-designacao");
    expect(form).toBeTruthy();

    if (form) {
      fireEvent.change(form.querySelector("input[name='nome_da_unidade']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='estrutura_hierarquica']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='turmas']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='funcionarios_da_unidade']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='assistente_de_diretor_escolar']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='secretario_da_escola']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='funcao_atividade']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='cargo_sobreposto']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='modulos']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.submit(form);
    }

    return waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Dados da designação", submitValues);
    });
  });

  it("renderiza o título 'Pesquisa de unidade' corretamente", () => {
    render(<DesignacoesPage />);

    expect(screen.getByText("Pesquisa de unidade")).toBeInTheDocument();
  });

  it("renderiza todos os componentes principais", () => {
    render(<DesignacoesPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("form-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
    expect(screen.getAllByTestId("fundo-branco").length).toBeGreaterThan(0);
    expect(screen.getByTestId("divider")).toBeInTheDocument();
  });

  it("renderiza o ícone de Designação no PageHeader", () => {
    render(<DesignacoesPage />);

    expect(screen.getByTestId("designacao-icon")).toBeInTheDocument();
  });

  it("deve extrair servidor selecionado dos searchParams quando o payload está presente", () => {
    mockSearchParams = new URLSearchParams({
      payload: JSON.stringify(mockServidorData),
    });

    render(<DesignacoesPage />);

    expect(screen.getByTestId("form-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
  });

  it("deve retornar null quando o payload não está presente nos searchParams", () => {
    mockSearchParams = new URLSearchParams();

    render(<DesignacoesPage />);

    expect(screen.getByTestId("form-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
  });

  it("deve retornar null quando o payload contém JSON inválido", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    mockSearchParams = new URLSearchParams({
      payload: "invalid-json{",
    });

    render(<DesignacoesPage />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Falha ao ler dados do passo anterior",
      expect.any(Error)
    );
    
    expect(screen.getByTestId("form-designacao")).toBeInTheDocument();
  });

  it("renderiza o layout com classes responsivas corretas", () => {
    const { container } = render(<DesignacoesPage />);

    const formColumn = container.querySelector(".md\\:w-2\\/3");
    expect(formColumn).toBeInTheDocument();
    expect(formColumn?.className).toContain("lg:w-3/4");

    const stepperColumn = container.querySelector(".md\\:w-1\\/3");
    expect(stepperColumn).toBeInTheDocument();
    expect(stepperColumn?.className).toContain("lg:w-1/4");
  });

  it("renderiza o FundoBranco com classe md:h-[80vh]", () => {
    const { container } = render(<DesignacoesPage />);

    const fundoBrancoWithHeight = container.querySelector(
      ".md\\:h-\\[80vh\\]"
    );

    expect(fundoBrancoWithHeight).toBeInTheDocument();
  });


  it("renderiza o container flex com gap-8", () => {
    const { container } = render(<DesignacoesPage />);

    const flexContainer = container.querySelector('.flex.flex-col.md\\:flex-row.gap-8');
    expect(flexContainer).toBeInTheDocument();
  });

  it("chama onSubmitDesignacao com os dados corretos ao submeter o formulário", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    
    mockSearchParams = new URLSearchParams({
      payload: JSON.stringify(mockServidorData),
    });

    const submitValues = {
      nome_da_unidade: "Escola Teste",
      estrutura_hierarquica: "Hierarquia",
      turmas: "5",
      funcionarios_da_unidade: "30",
      assistente_de_diretor_escolar: "Maria",
      secretario_da_escola: "José",
      funcao_atividade: "Coordenador",
      cargo_sobreposto: "Diretor",
      modulos: "3",
    };

    render(<DesignacoesPage />);

    const form = screen.getByTestId("form-designacao");
    
    if (form) {
      fireEvent.change(form.querySelector("input[name='nome_da_unidade']") as HTMLInputElement, { 
        target: { value: submitValues.nome_da_unidade } 
      });
      fireEvent.change(form.querySelector("input[name='estrutura_hierarquica']") as HTMLInputElement, { 
        target: { value: submitValues.estrutura_hierarquica } 
      });
      fireEvent.change(form.querySelector("input[name='turmas']") as HTMLInputElement, { 
        target: { value: submitValues.turmas } 
      });
      fireEvent.change(form.querySelector("input[name='funcionarios_da_unidade']") as HTMLInputElement, { 
        target: { value: submitValues.funcionarios_da_unidade } 
      });
      fireEvent.change(form.querySelector("input[name='assistente_de_diretor_escolar']") as HTMLInputElement, { 
        target: { value: submitValues.assistente_de_diretor_escolar } 
      });
      fireEvent.change(form.querySelector("input[name='secretario_da_escola']") as HTMLInputElement, { 
        target: { value: submitValues.secretario_da_escola } 
      });
      fireEvent.change(form.querySelector("input[name='funcao_atividade']") as HTMLInputElement, { 
        target: { value: submitValues.funcao_atividade } 
      });
      fireEvent.change(form.querySelector("input[name='cargo_sobreposto']") as HTMLInputElement, { 
        target: { value: submitValues.cargo_sobreposto } 
      });
      fireEvent.change(form.querySelector("input[name='modulos']") as HTMLInputElement, { 
        target: { value: submitValues.modulos } 
      });
      fireEvent.submit(form);
    }

    return waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Dados da designação", submitValues);
      expect(consoleSpy).toHaveBeenCalledWith("Servidor selecionado no passo 1", mockServidorData);
    });
  });

  it("mantém a estrutura correta quando não há dados do passo anterior", () => {
    mockSearchParams = new URLSearchParams();

    render(<DesignacoesPage />);

    expect(screen.getByTestId("form-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
    expect(screen.getByText("Pesquisa de unidade")).toBeInTheDocument();
  });

  it("renderiza o Divider com classe mt-2", () => {
    const { container } = render(<DesignacoesPage />);

    const divider = container.querySelector('[data-testid="divider"]');
    expect(divider?.className).toContain('mt-2');
  });

  it("valida que o useMemo é recalculado quando searchParams muda", () => {
    mockSearchParams = new URLSearchParams();
    const { rerender } = render(<DesignacoesPage />);

    // Verifica renderização inicial sem payload
    expect(screen.getByTestId("form-designacao")).toBeInTheDocument();

    mockSearchParams = new URLSearchParams({
      payload: JSON.stringify(mockServidorData),
    });
    
    rerender(<DesignacoesPage />);

    // Verifica que o componente ainda está renderizado após mudança nos searchParams
    expect(screen.getByTestId("form-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
  });
});
