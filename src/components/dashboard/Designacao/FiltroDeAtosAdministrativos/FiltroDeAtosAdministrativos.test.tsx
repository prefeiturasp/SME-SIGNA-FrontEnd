import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatusAtosAdministrativos } from "@/types/designacao";
import FiltroDeAtosAdministrativos, {
  AtosOpcoes,
  StatusPublicacaoOpcoes,
  TipoAtoSelectField,
} from "./FiltroDeAtosAdministrativos";

const watchValues: Record<string, unknown> = {};
const onChangeByField: Record<string, ReturnType<typeof vi.fn>> = {};
const filtroAcoesMock = vi.fn();

type SelectFieldProps = {
  name: string;
  label: string;
  dataTestId?: string;
  "data-testid"?: string;
  options: { value: string; label: string }[];
};

const selectFieldProps: SelectFieldProps[] = [];

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
  SelectField: ({
    name,
    label,
    dataTestId,
    "data-testid": testId,
    options,
  }: SelectFieldProps) => {
    selectFieldProps.push({ name, label, dataTestId, "data-testid": testId, options });
    return (
      <div data-testid={dataTestId ?? testId ?? `select-${name}`}>
        {label}
        {options.map((option) => (
          <div key={option.value} data-testid={`select-item-${option.value}`}>
            {option.label}
          </div>
        ))}
      </div>
    );
  },
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

describe("FiltroDeAtosAdministrativos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(watchValues).forEach((key) => delete watchValues[key]);
    Object.keys(onChangeByField).forEach((key) => delete onChangeByField[key]);
    selectFieldProps.length = 0;
  });

  it("renderiza campos, opcoes de tipo e status, e envia hasFilters=false ao FiltroAcoes", () => {
    render(<FiltroDeAtosAdministrativos />);

    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByTestId("input-numero_sei")).toBeInTheDocument();
    expect(screen.getByTestId("input-portaria")).toBeInTheDocument();
    expect(screen.getByTestId("input-nome-titular-e-indicado")).toBeInTheDocument();
    expect(screen.getByTestId("input-rf")).toBeInTheDocument();
    expect(screen.getByTestId("date-range-periodo")).toBeInTheDocument();

    expect(screen.getByTestId("select-listar-para")).toBeInTheDocument();
    expect(screen.getByTestId("select-status-publicacao")).toBeInTheDocument();
    expect(screen.getByTestId("select-listar-para")).toHaveTextContent("Tipo");
    expect(screen.getByTestId("select-item-DESIGNACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-CESSACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-INSUBSISTENCIA_DESIGNACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-INSUBSISTENCIA_CESSACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-APOSTILA_DESIGNACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-APOSTILA_CESSACAO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-INSUBSISTENCIA_APOSTILA")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-INSUBSISTENCIA_INSUBSISTENCIA")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-NAO_PUBLICADO")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-PUBLICADO")).toBeInTheDocument();

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: false,
      })
    );
  });

  it("renderiza o select de status com as opções de publicação e o name do formulário", () => {
    render(<FiltroDeAtosAdministrativos />);

    const status = selectFieldProps.find((props) => props.name === "status_publicacao");

    expect(status).toBeDefined();
    expect(status?.label).toBe("Status");
    expect(status?.options).toEqual(StatusPublicacaoOpcoes);
    expect(screen.getByTestId("select-status-publicacao")).toHaveTextContent("Status");
    expect(screen.getByTestId("select-status-publicacao")).toHaveTextContent("Aguardando publicação");
    expect(screen.getByTestId("select-status-publicacao")).toHaveTextContent("Publicado");
  });

  it("marca hasFilters=true quando algum filtro estiver preenchido e executa onClear", () => {
    const onClear = vi.fn();
    watchValues.numero_sei = "1234.5678/9012345-6";

    render(<FiltroDeAtosAdministrativos onClear={onClear} />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: true,
      })
    );

    fireEvent.click(screen.getByTestId("mock-filtro-acoes"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("exporta as opções de atos administrativos e status de publicação", () => {
    expect(AtosOpcoes).toEqual([
      { codigo: "DESIGNACAO", nome: "Designação" },
      { codigo: "CESSACAO", nome: "Cessação" },
      { codigo: "INSUBSISTENCIA_DESIGNACAO", nome: "Insubsistência de Designação" },
      { codigo: "INSUBSISTENCIA_CESSACAO", nome: "Insubsistência de Cessação" },
      { codigo: "APOSTILA_DESIGNACAO", nome: "Apostila de Designação" },
      { codigo: "APOSTILA_CESSACAO", nome: "Apostila de Cessação" },
      { codigo: "INSUBSISTENCIA_APOSTILA", nome: "Anulação de Apostila" },
      { codigo: "INSUBSISTENCIA_INSUBSISTENCIA", nome: "Tornar sem efeito" },
    ]);
    expect(StatusPublicacaoOpcoes).toEqual([
      { value: StatusAtosAdministrativos.NAO_PUBLICADO, label: "Aguardando publicação" },
      { value: StatusAtosAdministrativos.PUBLICADO, label: "Publicado" },
    ]);
  });

  it("permite customizar label, name e opções do TipoAtoSelectField", () => {
    const opcoesCustomizadas = [{ codigo: "DESIGNACAO", nome: "Designação" }];

    render(
      <TipoAtoSelectField
        label="Tipo de portaria"
        name="tipo_portaria"
        AtosOpcoes={opcoesCustomizadas}
      />,
    );

    expect(screen.getByTestId("select-listar-para")).toHaveTextContent("Tipo de portaria");
    expect(screen.getByTestId("select-item-DESIGNACAO")).toHaveTextContent("Designação");
    expect(screen.queryByTestId("select-item-CESSACAO")).not.toBeInTheDocument();
  });
});
