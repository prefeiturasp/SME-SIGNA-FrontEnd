import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import FiltroDeDesignacoes from "./FiltroDeDesignacoes";

const registerMock = vi.fn();
const resetMock = vi.fn();
const clearErrorsMock = vi.fn();
const setValueMock = vi.fn();
const onChangeByField: Record<string, ReturnType<typeof vi.fn>> = {};

const watchValues: Record<string, string> = {};

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: registerMock,
    control: {},
    watch: (fields?: string | string[]) => {
      if (!fields) return {};
      if (Array.isArray(fields)) return fields.map((f) => watchValues[f] ?? "");
      return watchValues[fields] ?? "";
    },
    setValue: setValueMock,
    clearErrors: clearErrorsMock,
    reset: resetMock,
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
  DateRangeField: ({ name, label }: { name: string; label: string }) => (
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
    return (
      <div data-testid={`form-field-${name}`}>
        {render({ field: { value: "", onChange } })}
      </div>
    );
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

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    onChange,
    placeholder,
  }: {
    onChange: (value: string) => void;
    placeholder?: string;
  }) => (
    <button
      type="button"
      data-testid="select-ue"
      onClick={() => onChange("mock-ue")}
    >
      {placeholder}
    </button>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    className,
    disabled,
    onClick,
    "data-testid": dataTestId,
  }: {
    children: ReactNode;
    type?: "button" | "submit" | "reset";
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    "data-testid"?: string;
  }) => (
    <button type={type} className={className} disabled={disabled} onClick={onClick} data-testid={dataTestId}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Search: () => <svg data-testid="search-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

vi.mock("@/hooks/useUnidades", () => ({
  useFetchDREs: () => ({
    data: [
      { codigoDRE: "01", nomeDRE: "DRE Centro", siglaDRE: "DC" },
      { codigoDRE: "02", nomeDRE: "DRE Norte", siglaDRE: "DN" },
    ],
  }),
  useFetchUEs: () => ({
    data: [
      { codigoEscola: "001", nomeEscola: "Escola Alpha", siglaTipoEscola: "EMEF" },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useCargos", () => ({
  useFetchCargos: () => ({
    data: [
      { codigoCargo: "1", nomeCargo: "Diretor" },
      { codigoCargo: "2", nomeCargo: "Coordenador" },
    ],
  }),
}));

vi.mock("@/hooks/useCargosBancoDeDados", () => ({
  useFetchCargosBase: () => ({
    data: [
      { codigoCargo: "10", nomeCargo: "Professor" },
      { codigoCargo: "20", nomeCargo: "Supervisor" },
    ],
  }),
}));

describe("FiltroDeDesignacoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(onChangeByField).forEach((key) => delete onChangeByField[key]);
  });

  it("renderiza todos os campos esperados", () => {
    render(<FiltroDeDesignacoes />);

    expect(screen.getByTestId("input-rf")).toHaveTextContent("RF servidor Indicado / Titular");
    expect(screen.getByTestId("input-nome-servidor")).toHaveTextContent("Nome do servidor");
    expect(screen.getByTestId("date-range-periodo")).toHaveTextContent("Período");

    expect(screen.getByTestId("select-cargo-base")).toBeInTheDocument();
    expect(screen.getByTestId("select-cargo-sobreposto")).toBeInTheDocument();
    expect(screen.getByTestId("select-ano")).toBeInTheDocument();
    expect(screen.getByTestId("select-dre")).toBeInTheDocument();
    expect(screen.getByTestId("select-ue")).toBeInTheDocument();

    expect(screen.getByText(String(new Date().getFullYear()))).toBeInTheDocument();
    expect(screen.getByText("1980")).toBeInTheDocument();

    expect(screen.getByTestId("btn-pesquisar")).toBeInTheDocument();
    expect(screen.getByTestId("btn-limpar-filtros")).toBeInTheDocument();
  });

  it("renderiza as opções de cargos (base e sobrepostos)", () => {
    render(<FiltroDeDesignacoes />);

    expect(screen.getAllByText("Professor").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Supervisor").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Diretor").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Coordenador").length).toBeGreaterThan(0);
  });

  it("renderiza as opções de DRE vindas do hook", () => {
    render(<FiltroDeDesignacoes />);

    expect(screen.getByText("DRE Centro")).toBeInTheDocument();
    expect(screen.getByText("DRE Norte")).toBeInTheDocument();
  });

  it("executa onChange dos selects quando valores são alterados", () => {
    render(<FiltroDeDesignacoes />);

    const triggerButtons = screen.getAllByRole("button", { name: "trigger-select" });
    triggerButtons.forEach((button) => fireEvent.click(button));

    expect(onChangeByField.cargo_base).toHaveBeenCalledWith("mock-option");
    expect(onChangeByField.cargo_sobreposto).toHaveBeenCalledWith("mock-option");
    expect(onChangeByField.ano).toHaveBeenCalledWith("mock-option");
    expect(onChangeByField.dre).toHaveBeenCalledWith("mock-option");
  });

  it("reseta unidade_escolar ao trocar DRE", () => {
    render(<FiltroDeDesignacoes />);

    const triggerButtons = screen.getAllByRole("button", { name: "trigger-select" });

    fireEvent.click(triggerButtons[3]);

    expect(setValueMock).toHaveBeenCalledWith("unidade_escolar", "");
    expect(clearErrorsMock).toHaveBeenCalledWith("dre");
  });

  it("executa onChange do Combobox de unidade escolar", () => {
    render(<FiltroDeDesignacoes />);

    const combobox = screen.getByTestId("select-ue");
    fireEvent.click(combobox);

    expect(onChangeByField.unidade_escolar).toHaveBeenCalledWith("mock-ue");
  });

  it("botões de ação estão desabilitados quando não há filtros", () => {
    render(<FiltroDeDesignacoes />);

    expect(screen.getByTestId("btn-pesquisar")).toBeDisabled();
    expect(screen.getByTestId("btn-limpar-filtros")).toBeDisabled();
  });

  it("chama onClear ao clicar em 'Limpar filtros'", () => {
    const onClearMock = vi.fn();

    watchValues["rf"] = "12345";

    render(<FiltroDeDesignacoes onClear={onClearMock} />);

    const btnLimpar = screen.getByTestId("btn-limpar-filtros");
    fireEvent.click(btnLimpar);

    expect(onClearMock).toHaveBeenCalled();

    delete watchValues["rf"];
  });
});