import React from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GestaoDeAcessos from "./page";

const pageHeaderSpy = vi.fn();
const quadroBrancoSpy = vi.fn();

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: {
    title: React.ReactNode;
    showBackButton?: boolean;
    breadcrumbs?: { title: string; href?: string }[];
  }) => {
    pageHeaderSpy(props);
    return (
      <header>
        <h1 data-testid="page-title">{props.title}</h1>
        <nav data-testid="breadcrumbs">
          {props.breadcrumbs?.map((crumb) => `${crumb.title} (${crumb.href ?? ""})`).join(" > ")}
        </nav>
      </header>
    );
  },
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    quadroBrancoSpy({ className });
    return <section data-testid="quadro-branco">{children}</section>;
  },
}));

describe("GestaoDeAcessos", () => {
  beforeEach(() => {
    pageHeaderSpy.mockClear();
    quadroBrancoSpy.mockClear();
  });

  it("renderiza o cabeçalho sem botão de voltar e com breadcrumbs navegáveis", () => {
    render(<GestaoDeAcessos />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("Gestão de acessos");
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        showBackButton: false,
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/" },
          { title: "Gestão de acessos", href: "" },
        ],
      }),
    );
    expect(screen.getByTestId("breadcrumbs")).toHaveTextContent(
      "Início (/) > Gestão (/) > Gestão de acessos ()",
    );
  });

  it("aplica a margem padrão do quadro branco", () => {
    render(<GestaoDeAcessos />);

    expect(quadroBrancoSpy).toHaveBeenCalledWith({ className: "mb-4 mt-8" });
  });

  it("renderiza título e descrição dentro do quadro branco", () => {
    render(<GestaoDeAcessos />);

    const quadro = screen.getByTestId("quadro-branco");

    expect(within(quadro).getByText("Gestão de acessos")).toBeInTheDocument();
    expect(
      within(quadro).getByText("Consulte e gerencie os acessos dos usuários ao sistema."),
    ).toBeInTheDocument();
  });
});
