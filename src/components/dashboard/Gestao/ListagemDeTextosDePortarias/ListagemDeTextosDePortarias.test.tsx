import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaginationProps, TableProps } from "antd";
import type { ReactNode } from "react";
import ListagemDeTextosDePortarias from "./ListagemDeTextosDePortarias";
import { StatusCargosBase, TextosDePortariasResponse } from "@/types/gestao";

const tableMock = vi.fn<(props: TableProps<TextosDePortariasResponse>) => ReactNode>();
const paginationMock = vi.fn<(props: PaginationProps) => ReactNode>();
const badgeStatusMock = vi.fn<(status: StatusCargosBase, dataTestId: string) => ReactNode>();

vi.mock("@/components/pagination/utils", () => ({
  itemRender: vi.fn(),
  MostrarRegistros: ({ page, total }: { page: number; total: number }) => (
    <span data-testid="mostrar-registros">
      {page}-{total}
    </span>
  ),
}));

vi.mock("antd", () => ({
  Table: (props: TableProps<TextosDePortariasResponse>) => {
    tableMock(props);
    return <div data-testid="table" />;
  },
  Pagination: (props: PaginationProps) => {
    paginationMock(props);
    return <div data-testid="pagination" />;
  },
}));

vi.mock("../ListagemDeCargos/ListagemDeCargos", () => ({
  BadgeStatusCargosBase: (status: StatusCargosBase, dataTestId: string) => {
    badgeStatusMock(status, dataTestId);
    return <span data-testid={dataTestId}>{status}</span>;
  },
}));

const textoPortaria: TextosDePortariasResponse = {
  id: 10,
  tipo_portaria: "Portaria",
  nome_modelo: "Modelo de portaria",
  status: StatusCargosBase.ATIVO,
  criado_em: "2026-06-11T08:05:00",
  atualizado_em: "2026-06-11T10:00:00",
};

describe("ListagemDeTextosDePortarias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza cabeçalho, tabela, paginação e props padrão", () => {
    render(<ListagemDeTextosDePortarias data={[textoPortaria]} total={12} page={1} />);

    expect(screen.getByText("Lista de textos de portarias")).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(screen.getByTestId("mostrar-registros")).toHaveTextContent("1-12");

    const tableProps = tableMock.mock.calls[0][0];
    expect(tableProps.loading).toBe(false);
    expect(tableProps.dataSource).toEqual([textoPortaria]);
    expect((tableProps.rowKey as (record: TextosDePortariasResponse) => string)(textoPortaria)).toBe("10");
    expect(tableProps.pagination).toBe(false);
    expect(tableProps.columns).toHaveLength(5);

    const paginationProps = paginationMock.mock.calls[0][0];
    expect(paginationProps.current).toBe(1);
    expect(paginationProps.pageSize).toBe(10);
    expect(paginationProps.total).toBe(12);
    expect(paginationProps.showSizeChanger).toBe(false);
  });

  it("repassa loading e callback da paginação", () => {
    const onPageChange = vi.fn();
    render(
      <ListagemDeTextosDePortarias
        data={[textoPortaria]}
        total={27}
        page={3}
        isLoading={true}
        onPageChange={onPageChange}
      />,
    );

    const tableProps = tableMock.mock.calls[0][0];
    expect(tableProps.loading).toBe(true);

    const paginationProps = paginationMock.mock.calls[0][0];
    paginationProps.onChange?.(4, 10);
    expect(onPageChange).toHaveBeenCalledWith(4, 10);
  });

  it("renderiza status usando badge e marca linhas inativas", () => {
    render(<ListagemDeTextosDePortarias data={[textoPortaria]} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<TextosDePortariasResponse>["columns"]>;
    const renderStatus = columns[2]?.render as
      | ((status: StatusCargosBase, record: TextosDePortariasResponse) => ReactNode)
      | undefined;

    render(<>{renderStatus?.(StatusCargosBase.ATIVO, textoPortaria)}</>);

    expect(screen.getByTestId("10_status")).toHaveTextContent(StatusCargosBase.ATIVO);
    expect(badgeStatusMock).toHaveBeenCalledWith(StatusCargosBase.ATIVO, "10_status");
    expect(
      (tableProps.rowClassName as (record: TextosDePortariasResponse) => string)({
        ...textoPortaria,
        status: StatusCargosBase.INATIVO,
      }),
    ).toBe("disabled-row");
    expect((tableProps.rowClassName as (record: TextosDePortariasResponse) => string)(textoPortaria)).toBe("");
  });

  it("formata as colunas de data e hora", () => {
    render(<ListagemDeTextosDePortarias data={[textoPortaria]} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<TextosDePortariasResponse>["columns"]>;
    const renderCriadoEm = columns[3]?.render as ((text: string | null) => ReactNode) | undefined;
    const renderAtualizadoEm = columns[4]?.render as ((text: string | null) => ReactNode) | undefined;

    expect(renderCriadoEm?.(textoPortaria.criado_em)).toBe("11/06/2026 08:05");
    expect(renderAtualizadoEm?.(textoPortaria.atualizado_em)).toBe("11/06/2026 10:00");
  });
});
