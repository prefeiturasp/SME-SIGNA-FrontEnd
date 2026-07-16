import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FiltroDeHistoricoDeAtosAdministrativos from "./FiltroDeHistoricoDeAtosAdministrativos";

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

describe("FiltroDeHistoricoDeAtosAdministrativos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(watchValues).forEach((key) => delete watchValues[key]);
    Object.keys(onChangeByField).forEach((key) => delete onChangeByField[key]);
  });

  it("renderiza campos e envia hasFilters=false ao FiltroAcoes", () => {
    render(<FiltroDeHistoricoDeAtosAdministrativos />);

    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByTestId("select-listar-para")).toBeInTheDocument();
    expect(screen.getByTestId("date-range-periodo")).toBeInTheDocument();
    expect(screen.getByTestId("input-observacao")).toBeInTheDocument();
    expect(screen.getByTestId("select-status-publicacao")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-DESIGNACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-PUBLICADO")).toBeInTheDocument();

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: false,
      })
    );
  });

  it("propaga alterações dos selects para o react-hook-form", () => {
    render(<FiltroDeHistoricoDeAtosAdministrativos />);

    const triggers = screen.getAllByRole("button", { name: "trigger-select" });
    triggers.forEach((button) => fireEvent.click(button));

    expect(onChangeByField.tipo).toHaveBeenCalledWith("mock-value");
    expect(onChangeByField.status_publicacao).toHaveBeenCalledWith("mock-value");
  });

  it("marca hasFilters=true e dispara onClear", () => {
    const onClear = vi.fn();
    watchValues.observacao = "texto";

    render(<FiltroDeHistoricoDeAtosAdministrativos onClear={onClear} />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: true,
      })
    );

    fireEvent.click(screen.getByTestId("mock-filtro-acoes"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
