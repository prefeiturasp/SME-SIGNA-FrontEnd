import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FiltroDeHistoricoDeAtosAdministrativos from "./FiltroDeHistoricoDeAtosAdministrativos";
import { fetchCargosDesignacoes } from "@/actions/designacao";

vi.mock("@/actions/designacao", () => ({
  fetchCargosDesignacoes: vi.fn(),
}));

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

vi.mock("../FiltroAcoes/FiltroAcoes", async () => {
  const { default: FiltroAcoes } = await vi.importActual<typeof import("../FiltroAcoes/FiltroAcoes")>("../FiltroAcoes/FiltroAcoes");
  return {
  default: ({ hasFilters, onClear, allowSearchWithoutFilters }: { hasFilters: boolean; onClear?: () => void; allowSearchWithoutFilters?: boolean }) => {
    filtroAcoesMock({ hasFilters, onClear });
    return (
      <>
      <FiltroAcoes hasFilters={hasFilters} onClear={onClear} allowSearchWithoutFilters={allowSearchWithoutFilters} />
      <button type="button" data-testid="mock-filtro-acoes" onClick={onClear}>
        {String(hasFilters)}
      </button>
      </>
    );
  },
};
});

describe("FiltroDeHistoricoDeAtosAdministrativos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchCargosDesignacoes).mockImplementation(() => new Promise(() => {}));
    Object.keys(watchValues).forEach((key) => delete watchValues[key]);
    Object.keys(onChangeByField).forEach((key) => delete onChangeByField[key]);
  });

  it("renderiza campos e envia hasFilters=false ao FiltroAcoes", () => {
    render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);

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

  it("marca hasFilters=true e dispara onClear", () => {
    const onClear = vi.fn();
    watchValues.observacao = "texto";

    render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" onClear={onClear} />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: true,
      })
    );

    fireEvent.click(screen.getByTestId("mock-filtro-acoes"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renderiza as opções retornadas pelo backend e mapeia o código nulo para TODOS", async () => {
    vi.mocked(fetchCargosDesignacoes).mockResolvedValue({
      success: true,
      data: [
        { codigoCargo: null, nomeCargo: "Todos os cargos", quantidade_designacoes: 2 },
        { codigoCargo: 9999, nomeCargo: "Cargo retornado pela API", quantidade_designacoes: 2 },
        { codigoCargo: 8888, nomeCargo: "Cargo sem designações", quantidade_designacoes: 0 },
      ],
    });
    render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);

    const cargo = within(screen.getByTestId("select-codigo-cargo-eol"));
    expect(await cargo.findByTestId("select-item-9999")).toHaveTextContent(/^Cargo retornado pela API \(2\)$/);
    expect(cargo.getByTestId("select-item-TODOS")).toHaveTextContent(/^Todos os cargos \(2\)$/);
    expect(cargo.getByTestId("select-item-8888")).toHaveTextContent(/^Cargo sem designações$/);
    expect(cargo.queryByTestId("select-item-3085")).not.toBeInTheDocument();
    expect(fetchCargosDesignacoes).toHaveBeenCalledTimes(1);
    expect(fetchCargosDesignacoes).toHaveBeenCalledWith("014591");
    expect(screen.getByText("Utilize os filtros para refinar a sua busca.")).toBeInTheDocument();
    expect(screen.getByText("Aguardando publicação")).toBeInTheDocument();
  });

  it("consulta novamente ao trocar a unidade proponente", () => {
    const { rerender } = render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);
    expect(fetchCargosDesignacoes).toHaveBeenLastCalledWith("014591");

    rerender(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="019453" />);
    expect(fetchCargosDesignacoes).toHaveBeenLastCalledWith("019453");
    expect(fetchCargosDesignacoes).toHaveBeenCalledTimes(2);
  });

  it("não consulta cargos sem unidade proponente", () => {
    render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="" />);
    expect(fetchCargosDesignacoes).not.toHaveBeenCalled();
  });

  it("exibe o erro quando a API não retorna os cargos", async () => {
    vi.mocked(fetchCargosDesignacoes).mockResolvedValue({ success: false, error: "Erro ao buscar os cargos das designações" });
    render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao buscar os cargos das designações");
    expect(screen.queryByTestId("select-item-3085")).not.toBeInTheDocument();
  });

  it("trata falhas inesperadas ao carregar cargos", async () => {
    vi.mocked(fetchCargosDesignacoes).mockRejectedValue(new Error("Falha de conexão"));
    render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Erro ao buscar os cargos das designações");
  });

  it.each([
    ["tipo", "DESIGNACAO"],
    ["periodo", { from: new Date(2026, 3, 1), to: new Date(2026, 3, 30) }],
    ["observacao", "Alteração de período"],
    ["status_publicacao", "PUBLICADO"],
  ])("marca hasFilters=true quando %s está preenchido", (campo, valor) => {
    watchValues[campo as string] = valor;
    render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({ hasFilters: true }),
    );
  });

  it.each([undefined, null, "", "TODOS"])("ignora filtros com valor %s", (valor) => {
    ["tipo", "periodo", "observacao", "status_publicacao"].forEach((campo) => {
      watchValues[campo] = valor;
    });
    render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);

    expect(filtroAcoesMock).toHaveBeenCalledWith(
      expect.objectContaining({ hasFilters: false }),
    );
  });

  it.each([null, { from: undefined, to: undefined }])("mantém a pesquisa habilitada após limpar o período para %s", (periodoVazio) => {
    watchValues.tipo = "TODOS";
    watchValues.cargo = "TODOS";
    watchValues.periodo = { from: new Date(2026, 3, 1), to: new Date(2026, 3, 30) };
    const onClear = vi.fn(() => { watchValues.periodo = periodoVazio; });
    const onSubmit = vi.fn((event) => event.preventDefault());
    const form = (
      <form onSubmit={onSubmit}>
        <FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" onClear={onClear} />
      </form>
    );
    const { rerender } = render(form);
    expect(screen.getByTestId("btn-pesquisar")).toBeEnabled();
    fireEvent.click(screen.getByTestId("btn-limpar-filtros"));
    rerender(
      <form onSubmit={onSubmit}>
        <FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" onClear={onClear} />
      </form>
    );
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("btn-limpar-filtros")).toBeDisabled();
    expect(screen.getByTestId("btn-pesquisar")).toBeEnabled();
    fireEvent.click(screen.getByTestId("btn-pesquisar"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("ignora a resposta de cargos depois que o filtro deixa de estar montado", async () => {
    let resolveCargos: (value: Awaited<ReturnType<typeof fetchCargosDesignacoes>>) => void = () => undefined;
    vi.mocked(fetchCargosDesignacoes).mockImplementation(
      () => new Promise((resolve) => {
        resolveCargos = resolve;
      })
    );

    const { unmount } = render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);
    unmount();

    await act(async () => {
      resolveCargos({ success: true, data: [] });
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("ignora falha de cargos depois que o filtro deixa de estar montado", async () => {
    let rejectCargos: (reason: Error) => void = () => undefined;
    vi.mocked(fetchCargosDesignacoes).mockImplementation(
      () => new Promise((_, reject) => {
        rejectCargos = reject;
      })
    );

    const { unmount } = render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);
    unmount();

    await act(async () => {
      rejectCargos(new Error("Falha de conexão"));
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("atualiza hasFilters após limpar os valores observados", () => {
    watchValues.tipo = "DESIGNACAO";
    const { rerender } = render(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);
    expect(screen.getByTestId("mock-filtro-acoes")).toHaveTextContent("true");

    watchValues.tipo = "";
    rerender(<FiltroDeHistoricoDeAtosAdministrativos codigoUe="014591" />);
    expect(screen.getByTestId("mock-filtro-acoes")).toHaveTextContent("false");
  });

});
