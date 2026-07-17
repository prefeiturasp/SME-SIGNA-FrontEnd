import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ResumoPortariaCessacao from "./ResumoPortariaCessacao";
import { Cessacao } from "@/types/designacao";

const cessacaoBase: Cessacao = {
  id: 1,
  numero_portaria: "050",
  ano_vigente: "2025",
  sei_numero: "6016.2025/0002-0",
  doc: "2025-10-10",
  a_pedido: false,
  remocao: false,
  aposentadoria: false,
  data_cessacao: "2025-03-01",
  criado_em: "2025-03-01T00:00:00Z",
  status: "cessada",
  ato_pai_id: 10,
  apostilas: [],
  insubsistencia: null,
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
    expect(screen.getByText("10/10/2025")).toBeInTheDocument();
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

  it("usa campo portaria como fallback e mostra campos extras formatados", () => {
    const cessacaoSemNumero = {
      ...cessacaoBase,
      numero_portaria: "",
      portaria: "PORT-FALLBACK",
      data_cessacao: "2025-12-30",
      a_pedido: true,
      remocao: true,
      aposentadoria: true,
    };

    render(
      <ResumoPortariaCessacao
        defaultValues={cessacaoSemNumero}
        showExtraFields
      />
    );

    expect(screen.getByText("PORT-FALLBACK")).toBeInTheDocument();
    expect(screen.getByText("Cessar a partir de")).toBeInTheDocument();
    expect(screen.getByText("30/12/2025")).toBeInTheDocument();
    expect(screen.getByText("A pedido")).toBeInTheDocument();
    expect(screen.getByText("Remoção")).toBeInTheDocument();
    expect(screen.getByText("Aposentadoria")).toBeInTheDocument();
    expect(screen.getAllByText("Sim")).toHaveLength(3);
  });

  it("mostra valores 'Não' para todos os booleanos extras", () => {
    render(
      <ResumoPortariaCessacao
        defaultValues={{
          ...cessacaoBase,
          data_cessacao: "2026-01-01",
          a_pedido: false,
          remocao: false,
          aposentadoria: false,
        }}
        showExtraFields
      />
    );

    expect(screen.getByText("01/01/2026")).toBeInTheDocument();
    expect(screen.getAllByText("Não")).toHaveLength(3);
  });

  it("não renderiza campos extras quando showExtraFields é false", () => {
    render(<ResumoPortariaCessacao defaultValues={cessacaoBase} showExtraFields={false} />);

    expect(screen.queryByText("Cessar a partir de")).not.toBeInTheDocument();
    expect(screen.queryByText("A pedido")).not.toBeInTheDocument();
    expect(screen.queryByText("Remoção")).not.toBeInTheDocument();
    expect(screen.queryByText("Aposentadoria")).not.toBeInTheDocument();
  });

  it("exibe '-' no campo D.O quando doc não é informado", () => {
    render(
      <ResumoPortariaCessacao
        defaultValues={{
          ...cessacaoBase,
          doc: "",
        }}
      />
    );

    expect(screen.getByText("D.O")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
