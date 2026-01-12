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
});

