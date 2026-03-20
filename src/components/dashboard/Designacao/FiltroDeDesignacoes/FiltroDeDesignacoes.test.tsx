import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import FiltroDeDesignacoes from "./FiltroDeDesignacoes";

const registerMock = vi.fn();
const onChangeByField: Record<string, ReturnType<typeof vi.fn>> = {};

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: registerMock,
    control: {},
  }),
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: ({
    name,
    label,
    "data-testid": dataTestId,
  }: {
    name: string;
    label: string;
    "data-testid"?: string;
  }) => <div data-testid={dataTestId ?? `input-${name}`}>{label}</div>,
  DateField: ({ name, label }: { name: string; label: string }) => (
    <div data-testid={`date-${name}`}>{label}</div>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({
    name,
    render,
  }: {
    name: string;
    render: (args: { field: { value: string; onChange: (value: string) => void } }) => ReactNode;
  }) => {
    const onChange = vi.fn();
    onChangeByField[name] = onChange;
    return <div data-testid={`form-field-${name}`}>{render({ field: { value: "", onChange } })}</div>;
  },
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormMessage: () => <span data-testid="form-message" />,
  FormLabel: ({ children, className }: { children: ReactNode; className?: string }) => (
    <label className={className}>{children}</label>
  ),
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onValueChange?.("mock-option")}>
        trigger-select
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectTrigger: ({
    children,
    "data-testid": dataTestId,
  }: {
    children: ReactNode;
    "data-testid"?: string;
  }) => <button data-testid={dataTestId}>{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    className,
  }: {
    children: ReactNode;
    type?: "button" | "submit" | "reset";
    className?: string;
  }) => (
    <button type={type} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Search: () => <svg data-testid="search-icon" />,
}));

describe("FiltroDeDesignacoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(onChangeByField).forEach((key) => delete onChangeByField[key]);
  });

  it("renderiza todos os campos e opções esperadas", () => {
    render(<FiltroDeDesignacoes />);

    expect(screen.getByTestId("input-rf")).toHaveTextContent("RF servidor Indicado / Titular");
    expect(screen.getByTestId("input-nome-servidor")).toHaveTextContent("Nome do servidor");
    expect(screen.getByTestId("date-periodo")).toHaveTextContent("Período");
    expect(screen.getByTestId("input-dre")).toHaveTextContent("DRE");

    expect(screen.getByTestId("select-cargo-base")).toBeInTheDocument();
    expect(screen.getByTestId("select-cargo-sobreposto")).toBeInTheDocument();
    expect(screen.getByTestId("select-unidade-escolar")).toBeInTheDocument();
    expect(screen.getByTestId("select-ano")).toBeInTheDocument();

    expect(screen.getAllByText("Diretor").length).toBeGreaterThan(0);
    expect(screen.getByText("Outro")).toBeInTheDocument();
    expect(screen.getByText("UE 01")).toBeInTheDocument();
    expect(screen.getByText(String(new Date().getFullYear()))).toBeInTheDocument();
    expect(screen.getByText("1980")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Pesquisar" })).toBeInTheDocument();
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });

  it("executa onChange dos selects quando valores são alterados", () => {
    render(<FiltroDeDesignacoes />);

    const triggerButtons = screen.getAllByRole("button", { name: "trigger-select" });
    triggerButtons.forEach((button) => fireEvent.click(button));

    expect(onChangeByField.cargo_base).toHaveBeenCalledWith("mock-option");
    expect(onChangeByField.cargo_sobreposto).toHaveBeenCalledWith("mock-option");
    expect(onChangeByField.unidade_escolar).toHaveBeenCalledWith("mock-option");
    expect(onChangeByField.ano).toHaveBeenCalledWith("mock-option");
  });
});
