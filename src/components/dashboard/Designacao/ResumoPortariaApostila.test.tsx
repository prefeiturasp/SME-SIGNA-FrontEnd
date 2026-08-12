import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResumoPortariaApostila from "./ResumoPortariaApostila";

const apostilaBase = {
  id: 1,
  numero_portaria: "050",
  tipo: "APOSTILA",
  ato_apostilado: "DESIGNACAO",
  ato_apostilado_display: "Designação",
  sei_numero: "6016.2025/0002-0",
  doc: "2025-10-10",
  status: "ativa",
  observacao: "Observação",
  criado_em: "2025-03-01T00:00:00Z",
  designacao: {},
  cessacao: {},
};

describe("ResumoPortariaApostila", () => {
  it("renderiza os dados da apostila corretamente", () => {
    render(<ResumoPortariaApostila defaultValues={apostilaBase as never} />);

    expect(screen.getByText("Portaria da apostila")).toBeInTheDocument();
    expect(screen.getByText("050")).toBeInTheDocument();
    expect(screen.getByText("Tipo de apostila")).toBeInTheDocument();
    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByText("Nº SEI")).toBeInTheDocument();
    expect(screen.getByText("6016.2025/0002-0")).toBeInTheDocument();
    expect(screen.getByText("D.O")).toBeInTheDocument();
    expect(screen.getByText("10/10/2025")).toBeInTheDocument();
  });

  it("aplica className passada via prop", () => {
    const { container } = render(
      <ResumoPortariaApostila defaultValues={apostilaBase as never} className="classe-custom" />,
    );

    expect(container.firstChild).toHaveClass("classe-custom");
  });

  it("exibe '-' no campo D.O quando doc não é informado", () => {
    render(
      <ResumoPortariaApostila
        defaultValues={{
          ...apostilaBase,
          doc: "",
        } as never}
      />,
    );

    expect(screen.getByText("D.O")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
