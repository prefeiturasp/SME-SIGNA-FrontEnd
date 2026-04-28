import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, it, expect, vi } from "vitest";
import PortariaApostilaFields from "./PortariaApostilaFields";

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
    <div data-testid="select-ano-field">{label}</div>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ value, onChange, ...props }: any) => (
    <textarea data-testid="input-observacoes" value={value} onChange={onChange} {...props} />
  ),
}));

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: {
      apostila: {
        numero_sei: "",
        doc: "",
        observacoes: "",
        tipo_apostila: "designacao",
      },
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("PortariaApostilaFields", () => {
  it("exibe o spinner quando isLoading é true", () => {
    render(
      <FormWrapper>
        <PortariaApostilaFields isLoading />
      </FormWrapper>
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("input-observacoes")).not.toBeInTheDocument();
  });

  it("renderiza os campos corretos de apostila quando não está carregando", () => {
    render(
      <FormWrapper>
        <PortariaApostilaFields />
      </FormWrapper>
    );

    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    
    expect(screen.getByTestId("input-field-apostila.numero_sei")).toBeInTheDocument();
    expect(screen.getByTestId("input-field-apostila.doc")).toBeInTheDocument();
    expect(screen.getByTestId("input-apostila.observacoes")).toBeInTheDocument();
  });

  it("exibe as labels corretas conforme definido no array inputFields", () => {
    render(
      <FormWrapper>
        <PortariaApostilaFields />
      </FormWrapper>
    );

    expect(screen.getByText("Nº SEI")).toBeInTheDocument();
    expect(screen.getByText("D.O")).toBeInTheDocument();
    expect(screen.getByText("Observações")).toBeInTheDocument();
  });

  it("permite a interação com o campo de observações", () => {
    render(
      <FormWrapper>
        <PortariaApostilaFields />
      </FormWrapper>
    );

    const textarea = screen.getByTestId("input-apostila.observacoes");
    fireEvent.change(textarea, { target: { value: "Texto de teste para apostila" } });
    
    expect((textarea as HTMLTextAreaElement).value).toBe("Texto de teste para apostila");
  });

  it("valida se o campo D.O está renderizado (conforme configurado no componente)", () => {
    render(
      <FormWrapper>
        <PortariaApostilaFields />
      </FormWrapper>
    );

    const fieldDo = screen.getByTestId("input-field-apostila.doc");
    expect(fieldDo).toBeInTheDocument();
  });
});