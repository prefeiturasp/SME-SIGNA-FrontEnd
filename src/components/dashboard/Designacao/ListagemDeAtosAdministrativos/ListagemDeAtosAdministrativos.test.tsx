import { fireEvent, render, screen } from "@testing-library/react";
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
const formatarDataHoraMock = vi.fn((value: string) => `formatado-${value}`);
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

vi.mock("@/lib/utils", () => ({
  formatarDataHora: (...args: unknown[]) => formatarDataHoraMock(...args),
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
          <button key={item.key} data-testid={`menu-item-${item.key}`} onClick={item.onClick}>
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
    nome: "Servidor A",
    numero_sei: "SEI-1",
    observacoes: "obs 1",
    portaria: "100/2026",
    status_publicacao: StatusAtosAdministrativos.PUBLICADO,
    tipo: "DESIGNACAO",
    tipo_de_ato: "Designação",
  },
];

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

  it("formata data/hora na coluna criado_em", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const createdAtRender = columns[1]?.render as ((text: string) => ReactNode) | undefined;

    const rendered = createdAtRender?.("2026-06-01T12:00:00.000Z");
    expect(rendered).toBe("formatado-2026-06-01T12:00:00.000Z");
    expect(formatarDataHoraMock).toHaveBeenCalledWith("2026-06-01T12:00:00.000Z");
  });

  it("renderiza responsável com hífen fixo", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const responsavelRender = columns[5]?.render as (() => ReactNode) | undefined;

    const { unmount } = render(<>{responsavelRender?.()}</>);
    expect(screen.getByText("-")).toBeInTheDocument();
    unmount();
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

  it("renderiza coluna de ações e executa cliques de todos os itens de menu", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as (() => ReactNode) | undefined;

    render(<>{actionRender?.()}</>);
    expect(screen.getByTestId("more-outlined")).toBeInTheDocument();
    expect(dropdownMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("menu-item-1"));
    fireEvent.click(screen.getByTestId("menu-item-2"));
    fireEvent.click(screen.getByTestId("menu-item-3"));
    fireEvent.click(screen.getByTestId("menu-item-4"));
    fireEvent.click(screen.getByTestId("menu-item-5"));

    expect(consoleLogSpy).toHaveBeenCalledTimes(5);
    expect(consoleLogSpy).toHaveBeenCalledWith("clicar");
  });
});
