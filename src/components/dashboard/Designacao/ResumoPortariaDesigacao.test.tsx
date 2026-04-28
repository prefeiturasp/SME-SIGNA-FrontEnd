import { render, screen } from "@testing-library/react";
import ResumoPortariaDesigacao from "./ResumoPortariaDesigacao";

describe("ResumoPortariaDesigacao", () => {
  const baseDefaultValues = {
    numero_portaria: "77",
    ano_vigente: "2026",
    sei_numero: "6016.2026/0001111-1",
    doc: "DOC 01",
    data_inicio: "2026-01-10",
    data_fim: "2026-12-31",
    carater_excepcional: true,
    impedimento_substituicao: "Licença",
    motivo_afastamento: "Afastamento legal",
    pendencias: "Nenhuma",
  };

  it("renderiza o loading quando isLoading é true", () => {
    render(
      <ResumoPortariaDesigacao defaultValues={baseDefaultValues} isLoading />
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("renderiza os dados e aplica fallback de campos opcionais", () => {
    render(
      <ResumoPortariaDesigacao
        className="classe-teste"
        isLoading={false}
        defaultValues={{
          ...baseDefaultValues,
          doc: null as unknown as string,
          data_inicio: null as unknown as string,
          data_fim: null,
          impedimento_substituicao: null,
          motivo_afastamento: null as unknown as string,
          pendencias: null as unknown as string,
        }}
      />
    );

    expect(screen.getByText("Portaria da designação")).toBeInTheDocument();
    expect(screen.getByText("77")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("6016.2026/0001111-1")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    expect(screen.getByText("Sim")).toBeInTheDocument();
  });

  it("renderiza 'Não' quando caráter especial for false", () => {
    render(
      <ResumoPortariaDesigacao
        defaultValues={{ ...baseDefaultValues, carater_excepcional: false }}
      />
    );

    expect(screen.getByText("Não")).toBeInTheDocument();
  });

  it("não renderiza campos extras quando showExtraFields é false", () => {
    render(
      <ResumoPortariaDesigacao
        defaultValues={baseDefaultValues}
        showExtraFields={false}
      />
    );

    expect(screen.queryByText("A partir de")).not.toBeInTheDocument();
    expect(screen.queryByText("Até")).not.toBeInTheDocument();
    expect(screen.queryByText("Caráter Especial")).not.toBeInTheDocument();
    expect(screen.queryByText("Impedimento para substituição:")).not.toBeInTheDocument();
    expect(screen.queryByText("Motivo do afastamento:")).not.toBeInTheDocument();
    expect(screen.queryByText("Pendência:")).not.toBeInTheDocument();
  });
});
