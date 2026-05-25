import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ResumoPortariaCessacao from "./ResumoPortariaCessacao";
import { Cessacao } from "@/types/designacao";

const cessacaoBase: Cessacao = {
  id: 1,
  numero_portaria: "050",
  ano_vigente: "2025",
  sei_numero: "6016.2025/0002-0",
  doc: "DOC-50",
  a_pedido: false,
  remocao: false,
  aposentadoria: false,
  data_designacao: "2025-03-01",
  criado_em: "2025-03-01T00:00:00Z",
  is_deleted: false,
  deleted_at: null,
  designacao: 10,
  insubsistencia: {
    numero_portaria: "100",
    ano_vigente: "2025",
    sei_numero: "SEI-100",
    doc: undefined,
    observacoes: undefined,
    tipo_insubsistencia: "designacao",
    designacao: 10,
  },
};

describe("ResumoPortariaCessacao", () => {
  it("renderiza os dados da cessação corretamente", () => {
    render(<ResumoPortariaCessacao defaultValues={cessacaoBase} />);

    expect(screen.getByText("Nº Portaria de Cessação")).toBeInTheDocument();
    expect(screen.getByText("050")).toBeInTheDocument();
    expect(screen.getByText("Ano da Cessação")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("Nº SEI")).toBeInTheDocument();
    expect(screen.getByText("6016.2025/0002-0")).toBeInTheDocument();
    expect(screen.getByText("D.O")).toBeInTheDocument();
    expect(screen.getByText("DOC-50")).toBeInTheDocument();
  });

  it("aplica className passada via prop", () => {
    const { container } = render(
      <ResumoPortariaCessacao defaultValues={cessacaoBase} className="classe-custom" />
    );

    expect(container.firstChild).toHaveClass("classe-custom");
  });

  it("renderiza sem className quando não é passada", () => {
    const { container } = render(
      <ResumoPortariaCessacao defaultValues={cessacaoBase} />
    );

    expect(container.firstChild).not.toHaveClass("classe-custom");
  });
});
