import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FiltroDeHistoricoDeAtosAdministrativos, { CargoSelectField, StatusPublicacaoSelectField } from "./FiltroDeHistoricoDeAtosAdministrativos";

const watchValues: Record<string, unknown> = {};
const onChangeByField: Record<string, ReturnType<typeof vi.fn>> = {};
const filtroAcoesMock = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: vi.fn(),
    control: {},
    watch: (fields?: string | string[]) => {
      if (!fields) return {};
      if (Array.isArray(fields)) return fields.map((field) => watchValues[field]);
      return watchValues[fields];
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
  SelectField: ({
    name,
    label,
    dataTestId,
    "data-testid": testId,
    extraContent,
    options,
  }: {
    name: string;
    label: string;
    dataTestId?: string;
    "data-testid"?: string;
    extraContent?: ReactNode;
    options: { value: string; label: string }[];
  }) => (
    <div data-testid={dataTestId ?? testId ?? `select-${name}`}>
      {label}
      {extraContent}
      {options.map((option) => (
        <div key={option.value} data-testid={`select-item-${option.value}`}>
          {option.label}
        </div>
      ))}
    </div>
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
    expect(within(screen.getByTestId("select-listar-para")).getByText("Todos os atos")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-DESIGNACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-PUBLICADO")).toBeInTheDocument();

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: false,
      })
    );
  });

  it("propaga alteracoes do select de status para o react-hook-form", () => {
    render(<StatusPublicacaoSelectField StatusPublicacaoOpcoes={[{ codigo: "PUBLICADO", nome: "Publicado" }]} />);

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-PUBLICADO")).toHaveTextContent("Publicado");
    const triggers = screen.getAllByRole("button", { name: "trigger-select" });
    triggers.forEach((button) => fireEvent.click(button));

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

  it("renderiza as opções de cargo e o texto de orientação", () => {
    render(<FiltroDeHistoricoDeAtosAdministrativos />);

    const cargo = within(screen.getByTestId("select-codigo-cargo-eol"));
    ["Todos os cargos", "Cargo 1", "Cargo 2", "Cargo 3"].forEach((opcao) => {
      expect(cargo.getByText(opcao)).toBeInTheDocument();
    });
    expect(cargo.getByText(/O número entre parênteses indica/)).toBeInTheDocument();
    expect(screen.getByText("Utilize os filtros para refinar a sua busca.")).toBeInTheDocument();
    expect(screen.getByText("Aguardando publicação")).toBeInTheDocument();
  });

  it.each([
    ["tipo", "DESIGNACAO"],
    ["periodo", { from: new Date(2026, 3, 1), to: new Date(2026, 3, 30) }],
    ["observacao", "Alteração de período"],
    ["status_publicacao", "PUBLICADO"],
  ])("marca hasFilters=true quando %s está preenchido", (campo, valor) => {
    watchValues[campo as string] = valor;
    render(<FiltroDeHistoricoDeAtosAdministrativos />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({ hasFilters: true }),
    );
  });

  it.each([undefined, null, ""])("ignora filtros com valor %s", (valor) => {
    ["tipo", "periodo", "observacao", "status_publicacao"].forEach((campo) => {
      watchValues[campo] = valor;
    });
    render(<FiltroDeHistoricoDeAtosAdministrativos />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({ hasFilters: false }),
    );
  });

  it("atualiza hasFilters após limpar os valores observados", () => {
    watchValues.tipo = "DESIGNACAO";
    const { rerender } = render(<FiltroDeHistoricoDeAtosAdministrativos />);
    expect(screen.getByTestId("mock-filtro-acoes")).toHaveTextContent("true");

    watchValues.tipo = "";
    rerender(<FiltroDeHistoricoDeAtosAdministrativos />);
    expect(screen.getByTestId("mock-filtro-acoes")).toHaveTextContent("false");
  });

  it("renderiza cargos personalizados e propaga a seleção ao formulário", () => {
    render(<CargoSelectField CargoOpcoes={[{ codigo: "42", nome: "Diretor (2)" }]} />);

    expect(screen.getByText("Cargo")).toBeInTheDocument();
    expect(screen.getByTestId("select-cargo")).toHaveTextContent("Selecione");
    expect(screen.getByTestId("select-item-42")).toHaveTextContent("Diretor (2)");
    fireEvent.click(screen.getByRole("button", { name: "trigger-select" }));
    expect(onChangeByField.cargo).toHaveBeenCalledWith("mock-value");
  });

});
