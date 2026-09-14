import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SimpleTableHeader, { SimpleHeaderWithBorder } from "./SimpleTableHeader";

describe("SimpleTableHeader", () => {
  it("renderiza título e subtítulo recebidos por props", () => {
    render(
      <SimpleTableHeader
        title="Informações do cargo"
        subtitle="Dados de identificação e classificação funcional."
      />,
    );

    expect(screen.getByText("Informações do cargo")).toBeInTheDocument();
    expect(screen.getByText("Dados de identificação e classificação funcional.")).toBeInTheDocument();
  });

  it("renderiza cabeçalho com borda sem botão à direita", () => {
    render(
      <SimpleHeaderWithBorder
        title="Crie um novo texto"
        subtitle="Cadastre um novo modelo para portarias."
      />,
    );

    expect(screen.getByText("Crie um novo texto")).toBeInTheDocument();
    expect(screen.getByText("Cadastre um novo modelo para portarias.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renderiza botão à direita quando informado", () => {
    render(
      <SimpleHeaderWithBorder
        title="Crie um novo texto"
        subtitle="Cadastre um novo modelo para portarias."
        buttonRight={<button type="button">Cadastrar</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Cadastrar" })).toBeInTheDocument();
  });
});
