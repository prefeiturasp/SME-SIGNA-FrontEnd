import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
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
      onClick={() => onSelect?.(new Date(2024, 0, 2))}
    >
      Selecionar data
    </button>
  ),
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  type SelectCtx = { value?: string; onValueChange: (v: string) => void };
  const SelectContext = React.createContext<SelectCtx | null>(null);

  function useSelectCtx() {
    const ctx = React.useContext(SelectContext);
    if (!ctx) {
      throw new Error("SelectItem must be used within Select");
    }
    return ctx;
  }

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value?: string;
      onValueChange: (v: string) => void;
      children: React.ReactNode;
    }) => (
      <SelectContext.Provider value={{ value, onValueChange }}>
        <div data-testid="mock-select" data-value={value ?? ""}>
          {children}
        </div>
      </SelectContext.Provider>
    ),
    SelectTrigger: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      children: React.ReactNode;
    }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => (
      <span>{placeholder || "placeholder"}</span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => {
      const ctx = useSelectCtx();
      return (
        <button
          type="button"
          data-testid={`select-item-${value}`}
          onClick={() => ctx.onValueChange(value)}
        >
          {children}
        </button>
      );
    },
  };
});

vi.mock("antd", () => ({
  Popconfirm: ({
    open,
    onConfirm,
    onCancel,
    okText,
    cancelText,
    title,
    description,
  }: {
    open?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    okText?: string;
    cancelText?: string;
    title?: string;
    description?: string;
  }) =>
    open ? (
      <div data-testid="popconfirm">
        <div>{title}</div>
        <div>{description}</div>
        <button type="button" data-testid="popconfirm-confirm" onClick={() => onConfirm?.()}>
          {okText || "OK"}
        </button>
        <button type="button" data-testid="popconfirm-cancel" onClick={() => onCancel?.()}>
          {cancelText || "Cancel"}
        </button>
      </div>
    ) : null,
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
  defaultValues?: DefaultValues<FieldValues>;
  onMethods: (m: UseFormReturn<FieldValues>) => void;
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
      com_afastamento: "",
      motivo_afastamento: "",
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
    let methods!: UseFormReturn<FieldValues>;
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
    const currentYear = `${new Date().getFullYear()}`;
    fireEvent.click(screen.getByTestId(`select-item-${currentYear}`));
    fireEvent.click(screen.getByTestId("select-item-1"));

    expect(methods.getValues("ano")).toBe(currentYear);
    expect(methods.getValues("impedimento_substituicao")).toBe("1");

    // RadioGroup (onValueChange -> field.onChange)
    const [caraterEspecialGroup] = screen.getAllByTestId("mock-radio-group");
    fireEvent.click(within(caraterEspecialGroup).getByRole("button", { name: /marcar sim/i }));
    expect(methods.getValues("carater_especial")).toBe("sim");

    // Calendar (onSelect -> field.onChange)
    const calendars = screen.getAllByTestId("mock-calendar-select");
    fireEvent.click(calendars[0]);
    fireEvent.click(calendars[1]);

    expect(methods.getValues("a_partir_de")).toBeInstanceOf(Date);
    expect(methods.getValues("designacao_data_final")).toBeInstanceOf(Date);
    // e renderiza a data formatada quando tem valor
    expect(screen.getAllByText("02/01/2024").length).toBeGreaterThanOrEqual(1);
  });

  it("abre Popconfirm ao selecionar um ano diferente e permite cancelar/confirmar", () => {
    let methods!: UseFormReturn<FieldValues>;
    render(
      <FormWrapper onMethods={(m) => (methods = m)}>
        <PortariaDesigacaoFields setDisableProximo={vi.fn()} isLoading={false} />
      </FormWrapper>
    );

    const currentYear = new Date().getFullYear();
    const otherYear = `${currentYear - 1}`;

    // selecionar outro ano abre o popconfirm e não altera o valor imediatamente
    fireEvent.click(screen.getByTestId(`select-item-${otherYear}`));
    expect(screen.getByTestId("popconfirm")).toBeInTheDocument();
    expect(methods.getValues("ano")).toBe("");

    // cancelar fecha e mantém o valor
    fireEvent.click(screen.getByTestId("popconfirm-cancel"));
    expect(screen.queryByTestId("popconfirm")).not.toBeInTheDocument();
    expect(methods.getValues("ano")).toBe("");

    // confirmar aplica o ano pendente
    fireEvent.click(screen.getByTestId(`select-item-${otherYear}`));
    fireEvent.click(screen.getByTestId("popconfirm-confirm"));
    expect(methods.getValues("ano")).toBe(otherYear);
  });

  it("quando pendingValue é vazio, confirmar não altera o ano", () => {
    let methods!: UseFormReturn<FieldValues>;
    render(
      <FormWrapper onMethods={(m) => (methods = m)}>
        <PortariaDesigacaoFields setDisableProximo={vi.fn()} isLoading={false} />
      </FormWrapper>
    );

    // o trigger do impedimento chama handleValueChange(field.value); no início é string vazia
    fireEvent.click(screen.getByTestId("select-impedimento-substituicao"));
    expect(screen.getByTestId("popconfirm")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("popconfirm-confirm"));
    expect(methods.getValues("ano")).toBe("");
  });

  it("controla o campo condicional de afastamento (mostra/esconde textarea e atualiza valor)", () => {
    let methods!: UseFormReturn<FieldValues>;
    render(
      <FormWrapper
        onMethods={(m) => (methods = m)}
        defaultValues={{
          portaria_designacao: "",
          numero_sei: "",
          a_partir_de: undefined,
          designacao_data_final: undefined,
          ano: "",
          doc: "",
          carater_especial: "",
          motivo_cancelamento: "",
          impedimento_substituicao: "",
          com_afastamento: "nao",
          motivo_afastamento: "",
        }}
      >
        <PortariaDesigacaoFields setDisableProximo={vi.fn()} isLoading={false} />
      </FormWrapper>
    );

    // inicialmente não mostra textarea
    expect(screen.queryByTestId("input-motivo-afastamento")).not.toBeInTheDocument();

    const radioGroups = screen.getAllByTestId("mock-radio-group");
    const afastamentoGroup = radioGroups[1];

    // marcar "sim" exibe textarea e permite digitar
    fireEvent.click(within(afastamentoGroup).getByRole("button", { name: /marcar sim/i }));
    expect(methods.getValues("com_afastamento")).toBe("sim");
    const textarea = screen.getByTestId("input-motivo-afastamento");
    fireEvent.change(textarea, { target: { value: "Precisa se afastar" } });
    expect(methods.getValues("motivo_afastamento")).toBe("Precisa se afastar");

    // marcar "nao" esconde novamente
    fireEvent.click(within(afastamentoGroup).getByRole("button", { name: /marcar nao/i }));
    expect(methods.getValues("com_afastamento")).toBe("nao");
    expect(screen.queryByTestId("input-motivo-afastamento")).not.toBeInTheDocument();
  });
});


