import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResumoPesquisaDaUnidade from "./ResumoPesquisaDaUnidade";

describe("ResumoPesquisaDaUnidade", () => {
  it("renderiza os dados da pesquisa quando não está carregando", () => {
    render(
      <ResumoPesquisaDaUnidade
        className="wrapper-custom"
        defaultValues={{ dre: "123", lotacao: "456", estrutura_hierarquica: "789" }}
        isLoading={false}
      />,
    );

    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("456")).toBeInTheDocument();
    expect(screen.getByText("789")).toBeInTheDocument();
    expect(document.querySelector(".wrapper-custom")).toBeInTheDocument();
  });

  it("renderiza '-' quando estrutura_hierarquica vier vazia", () => {
    render(
      <ResumoPesquisaDaUnidade
        defaultValues={{ dre: "DRE", lotacao: "UE", estrutura_hierarquica: "   " }}
        isLoading={false}
      />,
    );

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renderiza o loading quando isLoading é true e oculta os dados", () => {
    render(
      <ResumoPesquisaDaUnidade
        defaultValues={{ dre: "123", lotacao: "456", estrutura_hierarquica: "789" }}
        isLoading={true}
      />,
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.queryByText("123")).not.toBeInTheDocument();
    expect(screen.queryByText("456")).not.toBeInTheDocument();
  });
});