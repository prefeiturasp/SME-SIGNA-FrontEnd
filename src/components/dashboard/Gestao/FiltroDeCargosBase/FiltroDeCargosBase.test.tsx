import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FiltroDeCargosBase, {
  CargosBaseGrupamento,
  SituacaoFuncionalOpcoes,
  StatusOpcoes,
} from "./FiltroDeCargosBase";

const watchValues: Record<string, unknown> = {};
const inputFieldSpy = vi.fn();
const selectFieldSpy = vi.fn();
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
  InputField: (props: { name: string; label: string; "data-testid"?: string }) => {
    inputFieldSpy(props);
    return <div data-testid={props["data-testid"] ?? `input-${props.name}`}>{props.label}</div>;
  },
  SelectField: (props: {
    name: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    "data-testid"?: string;
  }) => {
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
  default: ({ hasFilters, onClear }: { hasFilters: boolean; onClear?: () => void }) => {
    filtroAcoesMock({ hasFilters, onClear });
    return (
      <button type="button" data-testid="mock-filtro-acoes" onClick={onClear}>
        {String(hasFilters)}
      </button>
    );
  },
}));

describe("FiltroDeCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(watchValues).forEach((key) => delete watchValues[key]);
  });

  it("exporta as listas de opções esperadas", () => {
    expect(SituacaoFuncionalOpcoes).toEqual([
      { codigo: "COMISSIONADO", nome: "Cargo em comissão" },
      { codigo: "EFETIVO", nome: "Efetivo" },
      { codigo: "CONTRATADO", nome: "Contratado" },
    ]);
    expect(StatusOpcoes).toEqual([
      { codigo: "ATIVO", nome: "Ativo" },
      { codigo: "INATIVO", nome: "Inativo" },
      { codigo: "EXTINTO", nome: "Extinto" },
    ]);
    expect(CargosBaseGrupamento).toEqual([
      { codigo: "APOIO_EDUCACAO", nome: "Apoio - educação" },
      { codigo: "DOCENTES", nome: "Docentes" },
      { codigo: "GESTORES_EDUCACAO", nome: "Gestores - educação" },
    ]);
  });

  it("renderiza os campos e envia hasFilters=false para FiltroAcoes sem filtros", () => {
    render(<FiltroDeCargosBase />);

    expect(screen.getByTestId("input-grupamento")).toBeInTheDocument();
    expect(screen.getByTestId("input-descricao_resumida")).toBeInTheDocument();
    expect(screen.getByTestId("input-descricao_completa")).toBeInTheDocument();
    expect(screen.getByTestId("input-situacao_funcional")).toBeInTheDocument();
    expect(screen.getByTestId("input-status")).toBeInTheDocument();
    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: false,
      }),
    );
  });

  it("mapeia opções para selects e aciona onClear quando clicado no filtro de ações", () => {
    const onClear = vi.fn();
    watchValues.grupamento = "DOCENTES";

    render(<FiltroDeCargosBase onClear={onClear} />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: true,
      }),
    );

    expect(screen.getByTestId("select-item-grupamento-APOIO_EDUCACAO")).toHaveTextContent("Apoio - educação");
    expect(screen.getByTestId("select-item-situacao_funcional-EFETIVO")).toHaveTextContent("Efetivo");
    expect(screen.getByTestId("select-item-status-EXTINTO")).toHaveTextContent("Extinto");

    fireEvent.click(screen.getByTestId("mock-filtro-acoes"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
