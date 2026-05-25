import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, it, expect, vi } from "vitest";
import PortariaInsubsistenciaFields from "./PortariaInsubsistenciaFields";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("lucide-react", () => ({
  Loader2: () => <svg data-testid="loading-spinner" />,
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: ({ name, label }: { name: string; label: string }) => (
    <div data-testid={`input-field-${name}`}>{label}</div>
  ),
}));

vi.mock("@/components/ui/SelectAnoField", () => ({
  SelectAnoField: ({ label }: { label: string }) => (
    <div data-testid="select-ano-field">{label}*</div>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ value, onChange, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea data-testid="input-observacoes" value={value} onChange={onChange} {...props} />
  ),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      insubsistencia: {
        numero_portaria: "",
        ano: "",
        numero_sei: "",
        doc: "",
        observacoes: "",
        tipo_insubsistencia: "designacao",
      },
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe("PortariaInsubsistenciaFields", () => {
  it("exibe o spinner quando isLoading é true", () => {
    render(
      <FormWrapper>
        <PortariaInsubsistenciaFields isLoading />
      </FormWrapper>
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("input-observacoes")).not.toBeInTheDocument();
  });

  it("renderiza os campos quando não está carregando", () => {
    render(
      <FormWrapper>
        <PortariaInsubsistenciaFields />
      </FormWrapper>
    );

    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    expect(screen.getByTestId("input-field-insubsistencia.numero_portaria")).toBeInTheDocument();
    expect(screen.getByTestId("input-field-insubsistencia.numero_sei")).toBeInTheDocument();
    expect(screen.getByTestId("input-field-insubsistencia.doc")).toBeInTheDocument();
    expect(screen.getByTestId("select-ano-field")).toBeInTheDocument();
    expect(screen.getByTestId("input-observacoes")).toBeInTheDocument();
  });

  it("renderiza o SelectAnoField no lugar de InputField para o campo 'ano'", () => {
    render(
      <FormWrapper>
        <PortariaInsubsistenciaFields />
      </FormWrapper>
    );

    expect(screen.queryByTestId("input-field-insubsistencia.ano")).not.toBeInTheDocument();
    expect(screen.getByTestId("select-ano-field")).toBeInTheDocument();
  });

  it("exibe o label dos campos", () => {
    render(
      <FormWrapper>
        <PortariaInsubsistenciaFields />
      </FormWrapper>
    );

    expect(screen.getByText("Portaria de insubsistência")).toBeInTheDocument();
    expect(screen.getByText("Nº SEI")).toBeInTheDocument();
    expect(screen.getByText("D.O")).toBeInTheDocument();
    expect(screen.getByText("Ano Vigente*")).toBeInTheDocument();
    expect(screen.getByText("Observações")).toBeInTheDocument();
  });

  it("permite digitar no campo de observações", () => {
    render(
      <FormWrapper>
        <PortariaInsubsistenciaFields />
      </FormWrapper>
    );

    const textarea = screen.getByTestId("input-observacoes");
    fireEvent.change(textarea, { target: { value: "nova observação" } });
    expect((textarea as HTMLTextAreaElement).value).toBe("nova observação");
  });
});
