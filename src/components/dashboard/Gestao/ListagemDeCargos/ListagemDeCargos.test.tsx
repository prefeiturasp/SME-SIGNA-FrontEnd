import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaginationProps, TableProps } from "antd";
import type { ReactNode } from "react";
import ListagemDeCargos from "./ListagemDeCargos";
import { CargosBaseResponse, StatusCargosBase } from "@/types/gestao";

const tableMock = vi.fn<(props: TableProps<CargosBaseResponse>) => ReactNode>();
const paginationMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/pagination/utils", () => ({
  itemRender: vi.fn(),
  MostrarRegistros: ({ page, total }: { page: number; total: number }) => (
    <span data-testid="mostrar-registros">
      {page}-{total}
    </span>
  ),
}));

vi.mock("antd", () => ({
  Table: (props: TableProps<CargosBaseResponse>) => {
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
  }) => (
    <div data-testid="dropdown">
      {children}
      {menu?.items?.map((item) => (
        <button key={item.key} data-testid={`menu-item-${item.key}`} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
    </div>
  ),
  Badge: ({ color }: { color?: string }) => <span data-testid="status-badge" data-color={color} />,
  Tag: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@ant-design/icons", () => ({
  MoreOutlined: () => <span data-testid="more-outlined" />,
}));

vi.mock("@/assets/icons/Editar", () => ({
  default: () => <span data-testid="icon-editar" />,
}));

vi.mock("@/assets/icons/Apostilar", () => ({
  default: () => <span data-testid="icon-apostilar" />,
}));

vi.mock("@/assets/icons/Cancelar", () => ({
  default: () => <span data-testid="icon-cancelar" />,
}));

vi.mock("@/assets/icons/DocumentoErro", () => ({
  default: () => <span data-testid="icon-documento-erro" />,
}));

vi.mock("@/assets/icons/Delete", () => ({
  default: () => <span data-testid="icon-delete" />,
}));

const row: CargosBaseResponse = {
  id: 10,
  grupamento: "Docentes",
  descricao_resumida: "Professor",
  descricao_completa: "Professor de educacao basica",
  situacao_funcional: "Efetivo",
  utilizado_para_funcoes: true,
  utilizado_para_designacoes: false,
  utilizado_para_ste: true,
  utilizado_para_permutas: false,
  cargo_base_ficticio: true,
  status: StatusCargosBase.ATIVO,
};

describe("ListagemDeCargos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza título, tabela, paginação e props padrão", () => {
    render(<ListagemDeCargos data={[row]} total={12} page={1} />);

    expect(screen.getByText("Lista de cargos base")).toBeInTheDocument();
    expect(
      screen.getByText("Aqui você encontra todos os cargos base cadastrados no sistema."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(screen.getByTestId("mostrar-registros")).toHaveTextContent("1-12");

    const tableProps = tableMock.mock.calls[0][0];
    expect(tableProps.loading).toBe(false);
    expect(tableProps.dataSource).toEqual([row]);
    expect((tableProps.rowKey as (record: CargosBaseResponse) => string)(row)).toBe("10");
    expect(tableProps.pagination).toBe(false);
    expect(tableProps.columns).toHaveLength(11);

    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    expect(paginationProps.current).toBe(1);
    expect(paginationProps.pageSize).toBe(10);
    expect(paginationProps.total).toBe(12);
    expect(paginationProps.showSizeChanger).toBe(false);
  });

  it("repassa loading e callback da paginação", () => {
    const onPageChange = vi.fn();
    render(<ListagemDeCargos data={[row]} total={27} page={3} isLoading={true} onPageChange={onPageChange} />);

    const tableProps = tableMock.mock.calls[0][0];
    expect(tableProps.loading).toBe(true);

    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    paginationProps.onChange?.(4, 10);
    expect(onPageChange).toHaveBeenCalledWith(4, 10);
  });

  it("renderiza valores Sim/Não para colunas booleanas", () => {
    render(<ListagemDeCargos data={[row]} total={1} page={1} />);
    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<CargosBaseResponse>["columns"]>;

    const renderFuncoes = columns[4]?.render as ((_: unknown, record: CargosBaseResponse) => ReactNode) | undefined;
    const renderDesignacoes = columns[5]?.render as
      | ((_: unknown, record: CargosBaseResponse) => ReactNode)
      | undefined;
    const renderSte = columns[6]?.render as ((_: unknown, record: CargosBaseResponse) => ReactNode) | undefined;
    const renderPermutas = columns[7]?.render as ((_: unknown, record: CargosBaseResponse) => ReactNode) | undefined;
    const renderFicticio = columns[8]?.render as ((_: unknown, record: CargosBaseResponse) => ReactNode) | undefined;

    const { rerender } = render(
      <>
        {renderFuncoes?.(null, row)}
        {renderDesignacoes?.(null, row)}
        {renderSte?.(null, row)}
        {renderPermutas?.(null, row)}
        {renderFicticio?.(null, row)}
      </>,
    );

    expect(document.body).toHaveTextContent("Sim");
    expect(document.body).toHaveTextContent("Não");

    rerender(
      <>
        {renderFuncoes?.(null, { ...row, utilizado_para_funcoes: false })}
        {renderDesignacoes?.(null, { ...row, utilizado_para_designacoes: true })}
        {renderSte?.(null, { ...row, utilizado_para_ste: false })}
        {renderPermutas?.(null, { ...row, utilizado_para_permutas: true })}
        {renderFicticio?.(null, { ...row, cargo_base_ficticio: false })}
      </>,
    );

    expect(document.body).toHaveTextContent("Sim");
    expect(document.body).toHaveTextContent("Não");
  });

  it("renderiza status mapeado e fallback para status desconhecido", () => {
    render(<ListagemDeCargos data={[row]} total={1} page={1} />);
    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<CargosBaseResponse>["columns"]>;
    const renderStatus = columns[9]?.render as
      | ((status: StatusCargosBase, record: CargosBaseResponse) => ReactNode)
      | undefined;

    const { rerender } = render(<>{renderStatus?.(StatusCargosBase.ATIVO, row)}</>);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge")).toHaveAttribute("data-color", "#008809");

    rerender(<>{renderStatus?.(StatusCargosBase.INATIVO, row)}</>);
    expect(screen.getByText("Inativo")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge")).toHaveAttribute("data-color", "#9CA3B9");

    rerender(<>{renderStatus?.(StatusCargosBase.EXTINTO, row)}</>);
    expect(screen.getByText("Extinto")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge")).toHaveAttribute("data-color", "#B22B2A");

    rerender(<>{renderStatus?.("DESCONHECIDO" as StatusCargosBase, row)}</>);
    expect(screen.queryByText("Extinto")).not.toBeInTheDocument();
    expect(screen.getByTestId("status-badge")).toHaveAttribute("data-color", "#9CA3B9");
  });

  it("marca linha inativa e cria ação de edição com navegação", () => {
    render(<ListagemDeCargos data={[row]} total={1} page={1} />);
    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<CargosBaseResponse>["columns"]>;
    const actionRender = columns[10]?.render as ((record: CargosBaseResponse) => ReactNode) | undefined;

    expect(
      (tableProps.rowClassName as (record: CargosBaseResponse) => string)({
        ...row,
        status: StatusCargosBase.INATIVO,
      }),
    ).toBe("disabled-row");
    expect((tableProps.rowClassName as (record: CargosBaseResponse) => string)(row)).toBe("");

    render(<>{actionRender?.(row)}</>);
    expect(screen.getByTestId("more-outlined")).toBeInTheDocument();
    screen.getByTestId("menu-item-4").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/criar-editar-cargo-base?id=10");
  });
});
