import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import PageHeader from "./PageHeader";
import { vi,describe, it, expect } from "vitest";

const backMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: backMock,
  }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild: _asChild, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("@/assets/icons/ArrowLeft", () => ({
  __esModule: true,
  default: () => <svg data-testid="arrow-left" />,
}));

vi.mock("@/assets/icons/ArrowCircleDark", () => ({
  __esModule: true,
  default: (props: any) => <svg data-testid="arrow-circle-dark" {...props} />,
}));

vi.mock("@/assets/icons/Home", () => ({
  __esModule: true,
  default: (props: any) => <svg data-testid="home-icon" {...props} />,
}));

describe("PageHeader", () => {
  it("renderiza título e breadcrumbs com ícone inicial e separador", () => {
    render(
      <PageHeader
        title="Designação"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Designação" },
        ]}
        icon={<span data-testid="header-icon" />}
      />
    );

    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Designação");
    expect(screen.getAllByTestId("arrow-circle-dark")).toHaveLength(1);
    expect(screen.getByTestId("header-icon")).toBeInTheDocument();
  });

  it("renderiza breadcrumbs com ícone inicial e separadores customizados", () => {
    render(
      <PageHeader
        title="Designação"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Designação" },
        ]}
        icon={<span data-testid="header-icon" />}
        showBackButton={false}
      />
    );

    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getAllByText("Designação").length).toBeGreaterThanOrEqual(1);

    const separators = screen.getAllByTestId("arrow-circle-dark");
    expect(separators).toHaveLength(1);

    expect(screen.getByTestId("header-icon")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Designação");
  });

  it("mostra botão de voltar quando habilitado", () => {
    render(
      <PageHeader
        title="Página"
        breadcrumbs={[{ title: "Início", href: "/" }]}
        showBackButton={true}
      />
    );

    const backButton = screen.getByRole("button", { name: /voltar/i });
    expect(backButton).toBeInTheDocument();
    expect(screen.getByTestId("arrow-left")).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it("não renderiza botão de voltar quando showBackButton for false", () => {
    render(<PageHeader title="Test Title" showBackButton={false} />);
    expect(screen.queryByRole("button", { name: /voltar/i })).not.toBeInTheDocument();
  });

  it("renderiza createButton quando informado", () => {
    render(
      <PageHeader
        title="Test Title"
        createButton={<button type="button">Criar</button>}
      />
    );

    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
  });
});
