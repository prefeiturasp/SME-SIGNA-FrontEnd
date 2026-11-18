import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CargoDisplay } from "./CargoDisplay";

vi.mock("@ant-design/icons", () => ({
  InfoCircleOutlined: () => <span data-testid="info-icon" />,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button type="button" {...rest}>
      {children}
    </button>
  ),
  TooltipContent: ({ children, side }: { children: React.ReactNode; side?: string }) => (
    <span data-testid="tooltip-content" data-side={side}>
      {children}
    </span>
  ),
}));

describe("CargoDisplay", () => {
  it("exibe código e descrição do cargo", () => {
    render(<CargoDisplay codigoCargo="1234567" descricaoCompleta="Professor do Ensino Fundamental I" />);

    expect(screen.getByText("Cargo:")).toBeInTheDocument();
    expect(screen.getByTestId("cargo-painel")).toHaveTextContent(
      "1234567 - Professor do Ensino Fundamental I",
    );
  });

  it("exibe código com valor numérico", () => {
    render(<CargoDisplay codigoCargo={3360} descricaoCompleta="DIRETOR DE ESCOLA" />);

    expect(screen.getByTestId("cargo-painel")).toHaveTextContent("3360 - DIRETOR DE ESCOLA");
  });

  it("exibe apenas o código quando não há descrição", () => {
    render(<CargoDisplay codigoCargo="3360" />);

    expect(screen.getByTestId("cargo-painel")).toHaveTextContent(/^3360$/);
  });

  it("exibe travessão quando não há cargo selecionado", () => {
    render(<CargoDisplay />);

    expect(screen.getByTestId("cargo-painel")).toHaveTextContent(/^-$/);
  });

  it("exibe o loading no lugar do cargo", () => {
    render(<CargoDisplay codigoCargo="3360" isLoading />);

    expect(screen.getByTestId("cargo-painel")).toHaveTextContent("Carregando cargo...");
  });

  it("usa um texto de loading customizado", () => {
    render(<CargoDisplay isLoading loadingText="Buscando..." />);

    expect(screen.getByTestId("cargo-painel")).toHaveTextContent("Buscando...");
  });

  it("renderiza o ícone de ajuda com o tooltip padrão à esquerda", () => {
    render(<CargoDisplay codigoCargo="3360" />);

    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sobre o cargo" })).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-content")).toHaveAttribute("data-side", "left");
    expect(screen.getByTestId("tooltip-content")).toHaveTextContent("Aparece em listagens e resumos.");
  });

  it("permite customizar o tooltip, o data-testid e o className", () => {
    render(
      <CargoDisplay
        codigoCargo="1"
        data-testid="cargo-personalizado"
        className="mb-6"
      />,
    );

    const painel = screen.getByTestId("cargo-personalizado");
    expect(painel).toBeInTheDocument();
    expect(screen.queryByTestId("cargo-painel")).not.toBeInTheDocument();
    expect(screen.getByTestId("tooltip-content")).toHaveTextContent("Texto customizado");
    expect(painel.parentElement?.parentElement).toHaveClass("mb-6");
  });
});
