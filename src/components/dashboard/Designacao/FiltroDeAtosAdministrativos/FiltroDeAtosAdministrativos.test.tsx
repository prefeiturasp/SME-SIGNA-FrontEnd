import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FiltroDeATosAdministrativos from "./FiltroDeAtosAdministrativos";

const watchValues: Record<string, unknown> = {};
const onChangeByField: Record<string, ReturnType<typeof vi.fn>> = {};
const filtroAcoesMock = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: vi.fn(),
    control: {},
    watch: (fields?: string | string[]) => {
      if (!fields) return {};
      if (Array.isArray(fields)) return fields.map((field) => watchValues[field] ?? "");
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
  DateRangePickerField: ({ name, label }: { name: string; label: string }) => (
    <div data-testid={`date-range-${name}`}>{label}</div>
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

vi.mock("../FiltroAcoes/FiltroAcoes", () => ({
  default: ({ hasFilters, onClear }: { hasFilters: boolean; onClear?: () => void }) => {
    filtroAcoesMock({ hasFilters, onClear });
    return (
      <button type="button" data-testid="mock-filtro-acoes" onClick={onClear}>
        {String(hasFilters)}
      </button>
    );
  },
}));

describe("FiltroDeATosAdministrativos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(watchValues).forEach((key) => delete watchValues[key]);
    Object.keys(onChangeByField).forEach((key) => delete onChangeByField[key]);
  });

  it("renderiza campos, opcoes de tipo e status, e envia hasFilters=false ao FiltroAcoes", () => {
    render(<FiltroDeATosAdministrativos />);

    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByTestId("input-numero_sei")).toBeInTheDocument();
    expect(screen.getByTestId("input-portaria")).toBeInTheDocument();
    expect(screen.getByTestId("input-nome-titular-e-indicado")).toBeInTheDocument();
    expect(screen.getByTestId("input-rf")).toBeInTheDocument();
    expect(screen.getByTestId("date-range-periodo")).toBeInTheDocument();

    expect(screen.getByTestId("select-listar-para")).toBeInTheDocument();
    expect(screen.getByTestId("select-status-publicacao")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-DESIGNACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-CESSACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-INSUBSISTENCIA_DESIGNACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-INSUBSISTENCIA_CESSACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-APOSTILA_DESIGNACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-APOSTILA_CESSACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-NAO_PUBLICADO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-PUBLICADO")).toBeInTheDocument();

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: false,
      })
    );
  });

  it("propaga alteracoes dos selects para o react-hook-form", () => {
    render(<FiltroDeATosAdministrativos />);

    const triggerButtons = screen.getAllByRole("button", { name: "trigger-select" });
    triggerButtons.forEach((button) => fireEvent.click(button));

    expect(onChangeByField.tipo).toHaveBeenCalledWith("mock-value");
    expect(onChangeByField.status_publicacao).toHaveBeenCalledWith("mock-value");
  });

  it("marca hasFilters=true quando algum filtro estiver preenchido e executa onClear", () => {
    const onClear = vi.fn();
    watchValues.numero_sei = "1234.5678/9012345-6";

    render(<FiltroDeATosAdministrativos onClear={onClear} />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: true,
      })
    );

    fireEvent.click(screen.getByTestId("mock-filtro-acoes"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
