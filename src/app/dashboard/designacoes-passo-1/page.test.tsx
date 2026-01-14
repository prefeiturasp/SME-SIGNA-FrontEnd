import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPage from "./page";

const mockPageHeader = vi.fn();

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: any) => {
    mockPageHeader(props);
    return <div data-testid="page-header">{props.title}</div>;
  },
}));

vi.mock("@/components/dashboard/Designacao/FormDesignacao", () => ({
  __esModule: true,
  default: () => <div data-testid="form-designacao" />,
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
  default: (props: any) => <svg data-testid="designacao-icon" {...props} />,
}));

vi.mock("antd", () => ({
  Divider: (props: any) => <div data-testid="divider" {...props} />,
}));

describe("Designacoes page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("renderiza o todos os campos do resumo corretamente", () => {
    render(<DesignacoesPage />);

    expect(screen.getByText("Servidor")).toBeInTheDocument();
    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText("Vínculo")).toBeInTheDocument();
    expect(screen.getByText("Lotação")).toBeInTheDocument();
    expect(screen.getByText("Cargo base")).toBeInTheDocument();
    expect(screen.getByText("Aulas atribuídas")).toBeInTheDocument();
  
    expect(screen.getByText("Função")).toBeInTheDocument();
    expect(screen.getByText("Cargo sobreposto")).toBeInTheDocument();
    expect(screen.getByText("Laudo Médico")).toBeInTheDocument();
    
    expect(screen.getByText("Cursos/Títulos")).toBeInTheDocument();
    expect(screen.getByText("Estágio probatório")).toBeInTheDocument();
    expect(screen.getByText("Aprovado em concurso")).toBeInTheDocument();

  });

   
});

