import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SimpleTableHeader from "./SimpleTableHeader";

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
});
