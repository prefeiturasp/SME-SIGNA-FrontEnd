import { render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { SelectAnoField } from "./SelectAnoField";

const anoAtual = new Date().getFullYear().toString();

// Expõe o valor gravado no formulário, que é o que a validação enxerga.
const ValorNoFormulario = () => {
  const valor = useWatch({ name: "cessacao.ano" });
  return <output data-testid="valor-formulario">{valor}</output>;
};

const Harness = ({ ano }: { ano: string }) => {
  const metodos = useForm({ defaultValues: { cessacao: { ano } } });
  return (
    <FormProvider {...metodos}>
      <SelectAnoField name="cessacao.ano" />
      <ValorNoFormulario />
    </FormProvider>
  );
};

describe("SelectAnoField", () => {
  it("grava o ano atual no formulário quando o valor inicial é vazio", async () => {
    render(<Harness ano="" />);

    await waitFor(() => {
      expect(screen.getByTestId("valor-formulario")).toHaveTextContent(anoAtual);
    });
    expect(screen.getByTestId("select-ano")).toHaveTextContent(anoAtual);
  });

  it("preserva o ano já informado", async () => {
    render(<Harness ano="2020" />);

    await waitFor(() => {
      expect(screen.getByTestId("select-ano")).toHaveTextContent("2020");
    });
    expect(screen.getByTestId("valor-formulario")).toHaveTextContent("2020");
  });
});
