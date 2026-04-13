import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { vi } from "vitest";
import PortariaCessacaoFields from "./PortariaCessacaoFields";

// 🔹 Mock Select (igual ao outro teste)
vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  const SelectContext = React.createContext<any>(null);


  return {
    Select: ({ value, onValueChange, children }: any) => {
    const contextValue = React.useMemo(
        () => ({ value, onValueChange }),
        [value, onValueChange]
    );

    return (
        <SelectContext.Provider value={contextValue}>
        <div>{children}</div>
        </SelectContext.Provider>
    );
    },
    SelectTrigger: ({ children }: any) => <button>{children}</button>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ value, children }: any) => {
      const ctx = React.useContext(SelectContext);
      return (
        <button
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
  Popconfirm: ({ open, onConfirm, onCancel }: any) =>
    open ? (
      <div data-testid="popconfirm">
        <button data-testid="confirm" onClick={onConfirm}>
          confirmar
        </button>
        <button data-testid="cancel" onClick={onCancel}>
          cancelar
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: () => <div>InputField</div>,
  DateField: () => <div>DateField</div>,
  CheckboxField: ({ name, register }: any) => (
    <input
      data-testid={name}
      type="checkbox"
      onChange={(e) => register(name).onChange(e)}
    />
  ),
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <svg data-testid="loading" />,
}));

function FormWrapper({
  children,
  onMethods,
  defaultValues,
}: {
  children: React.ReactNode;
  onMethods: (m: UseFormReturn<FieldValues>) => void;
  defaultValues?: DefaultValues<FieldValues>;
}) {
  const methods = useForm({
    defaultValues: defaultValues ?? {
      cessacao: {
        numero_portaria: "",
        ano: "",
        numero_sei: "",
        doc: "",
        data_inicio: undefined,
        a_pedido: "nao",
        remocao: "nao",
        aposentadoria: "nao",
      },
    },
  });

  React.useEffect(() => {
    onMethods(methods);
  }, [methods, onMethods]);

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("PortariaCessacaoFields", () => {
  it("mostra loading quando isLoading=true", () => {
    render(
      <FormWrapper onMethods={() => {}}>
        <PortariaCessacaoFields isLoading />
      </FormWrapper>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renderiza campos quando não está loading", () => {
    render(
      <FormWrapper onMethods={() => {}}>
        <PortariaCessacaoFields />
      </FormWrapper>
    );

    expect(screen.getByText("Ano Vigente*")).toBeInTheDocument();
    expect(screen.getAllByText("InputField").length).toBeGreaterThan(0);
  });

  it("abre popconfirm ao trocar ano diferente", () => {
    render(
      <FormWrapper onMethods={() => {}}>
        <PortariaCessacaoFields />
      </FormWrapper>
    );

    const otherYear = `${new Date().getFullYear() - 1}`;

    fireEvent.click(screen.getByTestId(`select-item-${otherYear}`));

    expect(screen.getByTestId("popconfirm")).toBeInTheDocument();
  });

  it("confirma mudança de ano", () => {
    let methods!: UseFormReturn<FieldValues>;

    render(
      <FormWrapper onMethods={(m) => (methods = m)}>
        <PortariaCessacaoFields />
      </FormWrapper>
    );

    const otherYear = `${new Date().getFullYear() - 1}`;

    fireEvent.click(screen.getByTestId(`select-item-${otherYear}`));
    fireEvent.click(screen.getByTestId("confirm"));

    expect(methods.getValues("cessacao.ano")).toBe(otherYear);
  });

  it("cancela mudança de ano", () => {
    let methods!: UseFormReturn<FieldValues>;

    render(
      <FormWrapper onMethods={(m) => (methods = m)}>
        <PortariaCessacaoFields />
      </FormWrapper>
    );

    const otherYear = `${new Date().getFullYear() - 1}`;

    fireEvent.click(screen.getByTestId(`select-item-${otherYear}`));
    fireEvent.click(screen.getByTestId("cancel"));

    expect(methods.getValues("cessacao.ano")).toBe("");
  });
});