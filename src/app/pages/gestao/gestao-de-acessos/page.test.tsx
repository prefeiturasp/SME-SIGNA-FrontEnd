import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GestaoDeAcessos from "./page";

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title, breadcrumbs }: { title: React.ReactNode; breadcrumbs?: { title: string }[] }) => (
    <header>
      <h1 data-testid="page-title">{title}</h1>
      <nav data-testid="breadcrumbs">
        {breadcrumbs?.map((crumb) => crumb.title).join(" > ")}
      </nav>
    </header>
  ),
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="quadro-branco">{children}</section>
  ),
}));

describe("GestaoDeAcessos", () => {
  it("renderiza o cabeçalho com título e breadcrumbs", () => {
    render(<GestaoDeAcessos />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("Gestão de acessos");
    expect(screen.getByTestId("breadcrumbs")).toHaveTextContent(
      "Início > Gestão > Gestão de acessos",
    );
  });

  it("renderiza o conteúdo da página dentro do quadro branco", () => {
    render(<GestaoDeAcessos />);

    expect(screen.getByTestId("quadro-branco")).toHaveTextContent(
      "Consulte e gerencie os acessos dos usuários ao sistema.",
    );
  });
});
