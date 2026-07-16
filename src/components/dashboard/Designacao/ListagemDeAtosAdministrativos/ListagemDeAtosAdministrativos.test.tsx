import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaginationProps, TableProps } from "antd";
import type { ReactNode } from "react";
import ListagemDeAtosAdministrativos from "./ListagemDeAtosAdministrativos";
import {
  ListagemAtosAdministrativosResponse,
  StatusAtosAdministrativos,
} from "@/types/designacao";

const tableMock = vi.fn<(props: TableProps<ListagemAtosAdministrativosResponse>) => ReactNode>();
const paginationMock = vi.fn();
const dropdownMock = vi.fn();
const formatarDataHoraMock = vi.fn((_value: string) => `01/06/2026, 12:00`);
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/utils", () => ({
  formatarDataHora: (value: string) => formatarDataHoraMock(value),
}));

vi.mock("antd", () => ({
  Table: (props: TableProps<ListagemAtosAdministrativosResponse>) => {
    tableMock(props);
    return <div data-testid="table" />;
  },
  Pagination: (props: PaginationProps) => {
    paginationMock(props);
    return <div data-testid="pagination" />;
  },
  Dropdown: ({
    children,
    menu,
  }: {
    children: ReactNode;
    menu?: { items?: Array<{ key: string; label?: ReactNode; onClick?: () => void }> };
  }) => {
    dropdownMock(menu);
    return (
      <div data-testid="dropdown">
        {children}
        {menu?.items?.map((item) => (
          <button
            key={item.key}
            data-testid={`menu-item-${item.key}`}
            onClick={() =>
              item.onClick?.({
                domEvent: { preventDefault: vi.fn() },
              } as any)
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  },
  Tag: ({
    children,
    color,
    className,
  }: {
    children: ReactNode;
    color?: string;
    className?: string;
  }) => (
    <span data-testid="tag" data-color={color} className={className}>
      {children}
    </span>
  ),
  Tooltip: ({ children, title }: { children: ReactNode; title?: ReactNode }) => (
    <div data-testid="tooltip">
      <div data-testid="tooltip-title">{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@ant-design/icons", () => ({
  MoreOutlined: () => <span data-testid="more-outlined" />,
}));

vi.mock("@/components/pagination/utils", () => ({
  itemRender: vi.fn(),
  MostrarRegistros: ({ page, total }: { page: number; total: number }) => (
    <span data-testid="mostrar-registros">
      {page}-{total}
    </span>
  ),
}));

vi.mock("@/assets/icons/Editar", () => ({ default: () => <span data-testid="icon-editar" /> }));
vi.mock("@/assets/icons/Apostilar", () => ({ default: () => <span data-testid="icon-apostilar" /> }));
vi.mock("@/assets/icons/Cancelar", () => ({ default: () => <span data-testid="icon-cancelar" /> }));
vi.mock("@/assets/icons/DocumentoErro", () => ({
  default: () => <span data-testid="icon-documento-erro" />,
}));
vi.mock("@/assets/icons/Delete", () => ({ default: () => <span data-testid="icon-delete" /> }));

const rows: ListagemAtosAdministrativosResponse[] = [
  {
    id: 1,
    ano_vigente: "2026",
    criado_em: "2026-06-01T12:00:00.000Z",
    criado_por_nome: "Fulano da Silva",
    nome: "Servidor A",
    rf: "1234567",
    sei_numero: "SEI-1",
    observacoes: "obs 1",
    portaria: "100/2026",
    status_publicacao: StatusAtosAdministrativos.PUBLICADO,
    tipo: "DESIGNACAO",
    tipo_de_ato: "Designação",
  },
];

type RowWithRelations = ListagemAtosAdministrativosResponse & {
  cessacao?: unknown;
  insubsistencia?: unknown;
};

describe("ListagemDeAtosAdministrativos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza cabeçalho e configura tabela/paginação com props padrão", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={25} page={1} />);

    expect(screen.getByText("Lista de atos administrativos")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Aqui você encontra todos os atos administrativos realizados no sistema/i
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(screen.getByTestId("mostrar-registros")).toHaveTextContent("1-25");

    expect(tableMock).toHaveBeenCalledTimes(1);
    const tableProps = tableMock.mock.calls[0][0];
    expect(tableProps.loading).toBe(false);
    expect(tableProps.dataSource).toBe(rows);
    expect((tableProps.rowKey as (r: ListagemAtosAdministrativosResponse) => string)(rows[0])).toBe(
      "1"
    );
    expect(tableProps.pagination).toBe(false);
    expect(tableProps.columns).toHaveLength(8);

    expect(paginationMock).toHaveBeenCalledTimes(1);
    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    expect(paginationProps.current).toBe(1);
    expect(paginationProps.pageSize).toBe(10);
    expect(paginationProps.total).toBe(25);
    expect(paginationProps.showSizeChanger).toBe(false);
  });

  it("repassa loading e callback de paginação quando informado", () => {
    const onPageChange = vi.fn();
    render(
      <ListagemDeAtosAdministrativos
        data={rows}
        total={9}
        page={3}
        isLoading={true}
        onPageChange={onPageChange}
      />
    );

    const tableProps = tableMock.mock.calls[0][0];
    expect(tableProps.loading).toBe(true);

    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    expect(paginationProps.current).toBe(3);
    paginationProps.onChange?.(4, 10);
    expect(onPageChange).toHaveBeenCalledWith(4, 10);
  });

  it("exibe a coluna Nº SEI no lugar de Data/hora", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const coluna = columns[1] as { title?: string; dataIndex?: string };

    expect(coluna?.title).toBe("Nº SEI");
    expect(coluna?.dataIndex).toBe("sei_numero");
  });

  it("exibe a coluna Servidor com o nome do indicado/titular", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const coluna = columns[4] as { title?: string; dataIndex?: string };

    expect(coluna?.title).toBe("Servidor indicado");
    expect(coluna?.dataIndex).toBe("nome");
  });

  it("exibe a coluna Registro Funcional (RF) no lugar de Responsável", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const coluna = columns[5] as { title?: string; dataIndex?: string };
    const rfRender = columns[5]?.render as ((rf: string | null) => ReactNode) | undefined;

    expect(coluna?.title).toBe("Registro Funcional (RF)");
    expect(coluna?.dataIndex).toBe("rf");

    const { unmount, rerender } = render(<>{rfRender?.("1234567")}</>);
    expect(screen.getByText("1234567")).toBeInTheDocument();

    rerender(<>{rfRender?.(null)}</>);
    expect(screen.getByText("-")).toBeInTheDocument();
    unmount();
  });

  it("exibe tooltip no status com nome do responsável, data e hora da criação", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const statusRender = columns[6]?.render as
      | ((_: unknown, record: ListagemAtosAdministrativosResponse) => ReactNode)
      | undefined;

    render(<>{statusRender?.(null, rows[0])}</>);

    expect(formatarDataHoraMock).toHaveBeenCalledWith(rows[0].criado_em);
    expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Fulano da Silva");
    expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Data: 01/06/2026");
    expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Hora: 12:00");
  });

  it("exibe 'Não informado' no tooltip quando não há responsável pela criação", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const statusRender = columns[6]?.render as
      | ((_: unknown, record: ListagemAtosAdministrativosResponse) => ReactNode)
      | undefined;

    render(<>{statusRender?.(null, { ...rows[0], criado_por_nome: null })}</>);

    expect(screen.getByTestId("tooltip-title")).toHaveTextContent("Não informado");
  });

  it("renderiza status publicado e Aguardando publicação com cores corretas", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const statusRender = columns[6]?.render as
      | ((_: unknown, record: ListagemAtosAdministrativosResponse) => ReactNode)
      | undefined;

    const { rerender } = render(
      <>{statusRender?.(null, { ...rows[0], status_publicacao: StatusAtosAdministrativos.PUBLICADO })}</>
    );
    expect(screen.getByTestId("tag")).toHaveTextContent("Publicado");
    expect(screen.getByTestId("tag")).toHaveAttribute("data-color", "#008809");

    rerender(
      <>
        {statusRender?.(null, {
          ...rows[0],
          status_publicacao: StatusAtosAdministrativos.NAO_PUBLICADO,
        })}
      </>
    );
    expect(screen.getByTestId("tag")).toHaveTextContent("Aguardando publicação");
    expect(screen.getByTestId("tag")).toHaveAttribute("data-color", "#9E9E9E");
  });

  it("renderiza status indisponível quando status é ausente", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const statusRender = columns[6]?.render as
      | ((_: unknown, record: ListagemAtosAdministrativosResponse) => ReactNode)
      | undefined;

    render(<>{statusRender?.(null, { ...rows[0], status_publicacao: undefined as unknown as string })}</>);
    expect(screen.getByTestId("tag")).toHaveTextContent("INDISPONÍVEL");
    expect(screen.getByTestId("tag")).toHaveAttribute("data-color", "#9E9E9E");
  });

  it("monta menu de ações para designação publicada e remove itens já executados", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as ((record: RowWithRelations) => ReactNode) | undefined;

    const baseRecord: RowWithRelations = {
      ...rows[0],
      tipo: "DESIGNACAO",
      status_publicacao: StatusAtosAdministrativos.PUBLICADO,
    };

    const { rerender } = render(<>{actionRender?.(baseRecord)}</>);

    expect(screen.getByTestId("menu-item-1")).toHaveTextContent("Apostilar");
    expect(screen.getByTestId("menu-item-2")).toHaveTextContent("Cessar");
    expect(screen.getByTestId("menu-item-3")).toHaveTextContent("Tornar insubsistente");
    expect(screen.queryByTestId("menu-item-4")).not.toBeInTheDocument();
    expect(screen.queryByTestId("menu-item-5")).not.toBeInTheDocument();

    rerender(<>{actionRender?.({ ...baseRecord, cessacao: { id: 11 } })}</>);
    expect(screen.queryByTestId("menu-item-2")).not.toBeInTheDocument();

    rerender(<>{actionRender?.({ ...baseRecord, insubsistencia: { id: 22 } })}</>);
    expect(screen.queryByTestId("menu-item-3")).not.toBeInTheDocument();
  });

  it("monta menu de ações para designação não publicada", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as ((record: RowWithRelations) => ReactNode) | undefined;

    render(
      <>
        {actionRender?.({
          ...rows[0],
          tipo: "DESIGNACAO",
          status_publicacao: StatusAtosAdministrativos.NAO_PUBLICADO,
        })}
      </>
    );

    expect(screen.getByTestId("menu-item-4")).toHaveTextContent("Editar");
    expect(screen.getByTestId("menu-item-1")).toHaveTextContent("Apostilar");
    expect(screen.getByTestId("menu-item-2")).toHaveTextContent("Cessar");
    expect(screen.getByTestId("menu-item-3")).toHaveTextContent("Tornar insubsistente");
    expect(screen.getByTestId("menu-item-5")).toHaveTextContent("Excluir");
  });

  it("monta menu de ações para cessação, apostila e insubsistência", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as ((record: RowWithRelations) => ReactNode) | undefined;

    const { rerender } = render(<>{actionRender?.({ ...rows[0], tipo: "CESSACAO" })}</>);
    expect(screen.getByTestId("menu-item-1")).toHaveTextContent("Apostilar");
    expect(screen.getByTestId("menu-item-3")).toHaveTextContent("Tornar insubsistente");

    rerender(<>{actionRender?.({ ...rows[0], tipo: "APOSTILA" })}</>);
    expect(screen.getByTestId("menu-item-6")).toHaveTextContent("Anular Apostila");
    screen.getByTestId("menu-item-6").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/anular-apostila?id=1");

    rerender(<>{actionRender?.({ ...rows[0], tipo: "INSUBSISTENCIA", tipo_insubsistencia: "DESIGNACAO" })}</>);
    expect(screen.getByTestId("menu-item-7")).toHaveTextContent("Tornar sem efeito");

    rerender(<>{actionRender?.({ ...rows[0], tipo: "INSUBSISTENCIA", tipo_insubsistencia: "CESSACAO" })}</>);
    expect(screen.getByTestId("menu-item-7")).toHaveTextContent("Tornar sem efeito");

    
  });

  it("não exibe itens de ação para tipo não mapeado", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as ((record: RowWithRelations) => ReactNode) | undefined;

    render(<>{actionRender?.({ ...rows[0], tipo: "OUTRO" as any })}</>);
    expect(screen.queryByTestId(/menu-item-/)).not.toBeInTheDocument();
  });
});
