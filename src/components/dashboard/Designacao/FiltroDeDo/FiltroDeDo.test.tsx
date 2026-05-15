import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FiltroDeDo from "./FiltroDeDo";

const watchValues: Record<string, string> = {};
const onChangeByField: Record<string, ReturnType<typeof vi.fn>> = {};

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: vi.fn(),
    control: {},
    watch: (fields?: string | string[]) => {
      if (!fields) return {};
      if (Array.isArray(fields)) return fields.map((f) => watchValues[f] ?? "");
      return watchValues[fields] ?? "";
    },
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
    return <div>{render({ field: { value: "", onChange } })}</div>;
  },
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormMessage: () => <span data-testid="form-message" />,
  FormLabel: ({ children }: { children: ReactNode }) => <label>{children}</label>,
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
      <button type="button" onClick={() => onValueChange?.("mock-value")}>
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
    disabled,
    onClick,
    type,
    "data-testid": dataTestId,
  }: {
    children: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    "data-testid"?: string;
  }) => (
    <button type={type} disabled={disabled} onClick={onClick} data-testid={dataTestId}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Search: () => <svg data-testid="search-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

describe("FiltroDeDo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(watchValues).forEach((key) => delete watchValues[key]);
    Object.keys(onChangeByField).forEach((key) => delete onChangeByField[key]);
  });

  it("renderiza campos, selects e ações esperadas", () => {
    render(<FiltroDeDo />);

    expect(screen.getByTestId("input-numero_sei")).toBeInTheDocument();
    expect(screen.getByTestId("input-portaria-inicial")).toBeInTheDocument();
    expect(screen.getByTestId("input-portaria-final")).toBeInTheDocument();
    expect(screen.getByTestId("select-ano")).toBeInTheDocument();
    expect(screen.getByTestId("select-listar-para")).toBeInTheDocument();
    expect(
      screen.getByText("Cargos (Designação / Cessação)")
    ).toBeInTheDocument();
    expect(screen.getByText(String(new Date().getFullYear()))).toBeInTheDocument();
  });

  it("mantém botões desabilitados quando não há filtros", () => {
    render(<FiltroDeDo />);

    expect(screen.getByTestId("btn-limpar-filtros")).toBeDisabled();
    expect(screen.getByTestId("btn-pesquisar")).toBeDisabled();
  });

  it("habilita botões e chama onClear quando há filtros preenchidos", () => {
    const onClear = vi.fn();
    watchValues.numero_sei = "1234.5678/0000000-0";

    render(<FiltroDeDo onClear={onClear} />);

    const btnLimpar = screen.getByTestId("btn-limpar-filtros");
    const btnPesquisar = screen.getByTestId("btn-pesquisar");

    expect(btnLimpar).toBeEnabled();
    expect(btnPesquisar).toBeEnabled();

    fireEvent.click(btnLimpar);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("propaga mudança dos selects para o react-hook-form", () => {
    render(<FiltroDeDo />);

    const triggerButtons = screen.getAllByRole("button", { name: "trigger-select" });
    triggerButtons.forEach((btn) => fireEvent.click(btn));

    expect(onChangeByField.ano).toHaveBeenCalledWith("mock-value");
    expect(onChangeByField.tipo_ato).toHaveBeenCalledWith("mock-value");
  });
});
