import React, { type HTMLAttributes, type ReactNode, type SVGProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPage from "./page";

const mockPageHeader = vi.fn();
let mockSearchParams: URLSearchParams;

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: {
    title: string;
    showBackButton?: boolean;
    breadcrumbs?: { title: string; href?: string }[];
    icon?: ReactNode;
  }) => {
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
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="fundo-branco" className={className}>
      {children}
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
  Divider: (props: HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="divider" {...props} />
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

describe("Designacoes page", () => {
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
});

