import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm, type FieldValues, type UseFormReturn } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PortariaApostilaFields from "./PortariaApostilaFields";

const inputFieldSpy = vi.hoisted(() => vi.fn());

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: (props: {
    name: string;
    label: string;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    mask?: string;
  }) => {
    inputFieldSpy(props);
    return (
      <input
        aria-label={props.label}
        data-testid={`input-${props.name}`}
        disabled={props.disabled}
        placeholder={props.placeholder}
        type={props.type}
      />
    );
  },
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loading-spinner" />,
}));

function FormWrapper({
  children,
  onMethods,
}: {
  children: ReactNode;
  onMethods?: (methods: UseFormReturn<FieldValues>) => void;
}) {
  const methods = useForm<FieldValues>({
    defaultValues: {
      apostila: {
        numero_portaria: "",
        numero_sei: "",
        doc: "",
      },
    },
  });

  onMethods?.(methods);

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("PortariaApostilaFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra loading quando isLoading é true", () => {
    render(
      <FormWrapper>
        <PortariaApostilaFields isLoading />
      </FormWrapper>,
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(inputFieldSpy).not.toHaveBeenCalled();
  });

  it("renderiza campos da portaria de apostila com nomes e máscaras corretos", () => {
    render(
      <FormWrapper>
        <PortariaApostilaFields />
      </FormWrapper>,
    );

    expect(screen.getByTestId("input-apostila.numero_portaria")).toBeInTheDocument();
    expect(screen.getByTestId("input-apostila.numero_sei")).toBeInTheDocument();
    expect(screen.getByTestId("input-apostila.doc")).toBeDisabled();

    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "apostila.numero_portaria",
        label: "Nº Portaria",
        placeholder: "Número Portaria",
        type: "number",
      }),
    );
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "apostila.numero_sei",
        label: "Nº SEI",
        placeholder: "Número SEI",
        type: "string",
        mask: "9999.9999/9999999-9",
      }),
    );
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "apostila.doc",
        label: "D.O",
        placeholder: "D.O",
        disabled: true,
      }),
    );
  });
});
