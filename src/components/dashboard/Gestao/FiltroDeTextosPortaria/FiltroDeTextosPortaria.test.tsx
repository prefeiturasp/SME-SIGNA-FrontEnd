import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FiltroDeTextosPortaria, { StatusOpcoes } from "./FiltroDeTextosPortaria";

interface FieldOption {
  value: string;
  label: string;
}

interface InputFieldMockProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  "data-testid"?: string;
}

interface SelectFieldMockProps extends InputFieldMockProps {
  options: FieldOption[];
}

interface TipoAtoSelectFieldMockProps {
  label: string;
  name: string;
  AtosOpcoes: Array<{ codigo: string; nome: string }>;
}

interface FiltroAcoesMockProps {
  hasFilters: boolean;
  onClear?: () => void;
}

const watchValues: Record<string, unknown> = {};
const inputFieldSpy = vi.fn<(props: InputFieldMockProps) => void>();
const selectFieldSpy = vi.fn<(props: SelectFieldMockProps) => void>();
const tipoAtoSelectFieldSpy = vi.fn<(props: TipoAtoSelectFieldMockProps) => void>();
const filtroAcoesMock = vi.fn<(props: FiltroAcoesMockProps) => void>();

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
  InputField: (props: InputFieldMockProps) => {
    inputFieldSpy(props);
    return <div data-testid={props["data-testid"] ?? `input-${props.name}`}>{props.label}</div>;
  },
  SelectField: (props: SelectFieldMockProps) => {
    selectFieldSpy(props);
    return (
      <div>
        <div data-testid={props["data-testid"] ?? `select-${props.name}`}>{props.label}</div>
        {props.options.map((option) => (
          <span key={option.value} data-testid={`select-item-${props.name}-${option.value}`}>
            {option.label}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock("../../Designacao/FiltroAcoes/FiltroAcoes", () => ({
  default: ({ hasFilters, onClear }: FiltroAcoesMockProps) => {
    filtroAcoesMock({ hasFilters, onClear });
    return (
      <button type="button" data-testid="mock-filtro-acoes" onClick={onClear}>
        {String(hasFilters)}
      </button>
    );
  },
}));

vi.mock("../../Designacao/FiltroDeAtosAdministrativos/FiltroDeAtosAdministrativos", () => ({
  AtosOpcoes: [
    { codigo: "PORTARIA", nome: "Portaria" },
    { codigo: "DESPACHO", nome: "Despacho" },
  ],
  TipoAtoSelectField: (props: TipoAtoSelectFieldMockProps) => {
    tipoAtoSelectFieldSpy(props);
    return <div data-testid={`tipo-ato-${props.name}`}>{props.label}</div>;
  },
}));

describe("FiltroDeTextosPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(watchValues).forEach((key) => delete watchValues[key]);
  });

  it("exporta as opções de status esperadas", () => {
    expect(StatusOpcoes).toEqual([
      { codigo: "ATIVO", nome: "Ativo" },
      { codigo: "INATIVO", nome: "Inativo" },
    ]);
  });

  it("renderiza os campos e envia hasFilters=false para FiltroAcoes sem filtros", () => {
    render(<FiltroDeTextosPortaria />);

    expect(screen.getByTestId("tipo-ato-tipo_portaria")).toHaveTextContent("Tipo de portaria");
    expect(screen.getByTestId("input-nome_modelo")).toHaveTextContent("Nome do Modelo");
    expect(screen.getByTestId("input-status")).toHaveTextContent("Status");
    expect(tipoAtoSelectFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "tipo_portaria",
        AtosOpcoes: [
          { codigo: "PORTARIA", nome: "Portaria" },
          { codigo: "DESPACHO", nome: "Despacho" },
        ],
      }),
    );
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "nome_modelo",
        placeholder: "Digite o nome do modelo...",
        type: "text",
      }),
    );
    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: false,
      }),
    );
  });

  it("mapeia opções de status e aciona onClear quando há filtro preenchido", () => {
    const onClear = vi.fn();
    watchValues.status = "ATIVO";

    render(<FiltroDeTextosPortaria onClear={onClear} />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: true,
      }),
    );
    expect(selectFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "status",
        options: [
          { value: "ATIVO", label: "Ativo" },
          { value: "INATIVO", label: "Inativo" },
        ],
      }),
    );
    expect(screen.getByTestId("select-item-status-ATIVO")).toHaveTextContent("Ativo");
    expect(screen.getByTestId("select-item-status-INATIVO")).toHaveTextContent("Inativo");

    fireEvent.click(screen.getByTestId("mock-filtro-acoes"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
