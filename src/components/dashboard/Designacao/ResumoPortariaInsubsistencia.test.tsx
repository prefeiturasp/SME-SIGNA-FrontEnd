import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ResumoPortariaInsubsistencia from "./ResumoPortariaInsubsistencia";

describe("ResumoPortariaInsubsistencia", () => {
  it("renderiza todos os campos e formata data do D.O quando existir", () => {
    render(
      <ResumoPortariaInsubsistencia
        className="classe-teste"
        titulo_portaria="Portaria de Insubsistência"
        defaultValues={{
          id: 1,
          numero_portaria: "100",
          ano_vigente: "2026",
          sei_numero: "SEI-100",
          doc: "2026-01-31",
          observacoes: "Observação importante",
          texto_apostila: "",
          doc_do_ato_insubstituido: "",
          criado_em: "",
          status: "",
          observacao: "",
          designacao: {} as never,
          cessacao: {} as never,
          insubsistencia: {} as never,
          ato_apostilado: "",
          ato_apostilado_display: "",
          tipo_insubsistencia: "",
          tipo: "",
        }}
      />
    );

    expect(screen.getByText("Portaria de Insubsistência")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("SEI-100")).toBeInTheDocument();
    expect(screen.getByText("31/01/2026")).toBeInTheDocument();
    expect(screen.getByText("Observação importante")).toBeInTheDocument();
  });

  it("mostra '-' no D.O quando doc não existe", () => {
    render(
      <ResumoPortariaInsubsistencia
        titulo_portaria="Portaria"
        defaultValues={{
          id: 2,
          numero_portaria: "200",
          ano_vigente: "2027",
          sei_numero: "SEI-200",
          doc: "" as never,
          observacoes: "Sem doc",
          texto_apostila: "",
          doc_do_ato_insubstituido: "",
          criado_em: "",
          status: "",
          observacao: "",
          designacao: {} as never,
          cessacao: {} as never,
          insubsistencia: {} as never,
          ato_apostilado: "",
          ato_apostilado_display: "",
          tipo_insubsistencia: "",
          tipo: "",
        }}
      />
    );

    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
