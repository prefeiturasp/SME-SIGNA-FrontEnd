import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { vi } from "vitest";
import PortariaDesigacaoFields from "./PortariaDesigacaoFields";

// Simplifica dependências de UI (Radix/Shadcn) para facilitar interação e cobrir callbacks.
vi.mock("@/components/ui/button", () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({
    onSelect,
  }: {
    selected?: Date;
    onSelect?: (d: Date) => void;
    mode?: string;
  }) => (
    <button
      type="button"
      data-testid="mock-calendar-select"
      onClick={() => onSelect?.(new Date("2024-01-02T00:00:00.000Z"))}
    >
      Selecionar data
    </button>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      data-testid="mock-select"
      value={value || ""}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder || "placeholder"}</option>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
    defaultValue?: string;
  }) => (
    <div data-testid="mock-radio-group" data-value={value}>
      <button type="button" onClick={() => onValueChange("sim")}>
        marcar sim
      </button>
      <button type="button" onClick={() => onValueChange("nao")}>
        marcar nao
      </button>
      {children}
    </div>
  ),
  RadioGroupItem: (props: { value: string; id: string }) => (
    <input type="radio" value={props.value} id={props.id} readOnly />
  ),
}));

vi.mock("lucide-react", async () => {
  const React = await import("react");
  return {
    CalendarIcon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg data-testid="calendar-icon" {...props} />
    ),
    Loader2: (props: React.SVGProps<SVGSVGElement>) => (
      <svg data-testid="loading-spinner" {...props} />
    ),
  };
});

function FormWrapper({
  children,
  defaultValues,
  onMethods,
}: {
  children: React.ReactNode;
  defaultValues?: any;
  onMethods: (m: any) => void;
}) {
  const methods = useForm({
    defaultValues: defaultValues ?? {
      portaria_designacao: "",
      numero_sei: "",
      a_partir_de: undefined,
      designacao_data_final: undefined,
      ano: "",
      doc: "",
      carater_especial: "",
      motivo_cancelamento: "",
      impedimento_substituicao: "",
    },
  });

  React.useEffect(() => {
    onMethods(methods);
  }, [methods, onMethods]);

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("PortariaDesigacaoFields", () => {
  it("mostra loading quando isLoading é true", () => {
    render(
      <FormWrapper onMethods={() => {}}>
        <PortariaDesigacaoFields setDisableProximo={vi.fn()} isLoading={true} />
      </FormWrapper>
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("renderiza campos e atualiza valores do formulário via callbacks", () => {
    let methods: any;
    render(
      <FormWrapper onMethods={(m) => (methods = m)}>
        <PortariaDesigacaoFields setDisableProximo={vi.fn()} isLoading={false} />
      </FormWrapper>
    );

    // Inputs (onChange com field.onChange(value.target.value))
    fireEvent.change(screen.getByTestId("input-portaria-designacao"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByTestId("input-numero-sei"), {
      target: { value: "SEI-1" },
    });
    fireEvent.change(screen.getByTestId("input-doc"), {
      target: { value: "DOC-1" },
    });
    fireEvent.change(screen.getByTestId("input-motivo-cancelamento"), {
      target: { value: "Motivo" },
    });

    expect(methods.getValues("portaria_designacao")).toBe("123");
    expect(methods.getValues("numero_sei")).toBe("SEI-1");
    expect(methods.getValues("doc")).toBe("DOC-1");
    expect(methods.getValues("motivo_cancelamento")).toBe("Motivo");

    // Selects (onValueChange -> field.onChange)
    const selects = screen.getAllByTestId("mock-select");
    // 0: ano, 1: impedimento_substituicao
    fireEvent.change(selects[0], { target: { value: `${new Date().getFullYear()}` } });
    fireEvent.change(selects[1], { target: { value: "1" } });

    expect(methods.getValues("ano")).toBe(`${new Date().getFullYear()}`);
    expect(methods.getValues("impedimento_substituicao")).toBe("1");

    // RadioGroup (onValueChange -> field.onChange)
    fireEvent.click(screen.getByRole("button", { name: /marcar sim/i }));
    expect(methods.getValues("carater_especial")).toBe("sim");

    // Calendar (onSelect -> field.onChange)
    const calendars = screen.getAllByTestId("mock-calendar-select");
    fireEvent.click(calendars[0]);
    fireEvent.click(calendars[1]);

    expect(methods.getValues("a_partir_de")).toBeInstanceOf(Date);
    expect(methods.getValues("designacao_data_final")).toBeInstanceOf(Date);
  });
});


