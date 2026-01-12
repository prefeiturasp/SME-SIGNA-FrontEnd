import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import PageHeader from "./PageHeader";
import { describe, it, expect } from "vitest";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
    const onBack = vi.fn();

    render(
      <PageHeader
        title="Página"
        breadcrumbs={[{ title: "Início", href: "/" }]}
        onClickBack={onBack}
      />
    );

    const backButton = screen.getByRole("button", { name: /voltar/i });
    expect(backButton).toBeInTheDocument();
    expect(screen.getByTestId("arrow-left")).toBeInTheDocument();

    const backLink = screen.getByRole("link", { name: /voltar/i });

    fireEvent.click(backLink);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});



describe("PageHeader", () => {
    it("deve renderizar o título", () => {
        render(<PageHeader title="Test Title" />);
        expect(
            screen.getByRole("heading", { name: /test title/i })
        ).toBeInTheDocument();
    });

    it("deve renderizar o link de voltar por padrão", () => {
        render(<PageHeader title="Test Title" />);
        const link = screen.getByRole("link", { name: /voltar/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("não deve renderizar o link de voltar se showBackButton for false", () => {
        render(<PageHeader title="Test Title" showBackButton={false} />);
        expect(
            screen.queryByRole("link", { name: /voltar/i })
        ).not.toBeInTheDocument();
    });
});
