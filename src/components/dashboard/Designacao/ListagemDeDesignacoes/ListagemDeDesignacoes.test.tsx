import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { PaginationProps, TableProps } from "antd";
import type { ReactNode } from "react";
import ListagemDeDesignacoes from "./ListagemDeDesignacoes";
import { ListagemDesignacoesResponse, StatusDesignacao } from "@/types/designacao";

const tableMock = vi.fn<(props: TableProps<ListagemDesignacoesResponse>) => ReactNode>();
const paginationMock = vi.fn();
const dropdownMock = vi.fn();
const downloadCSVMock = vi.fn();

vi.mock("@/utils/export/exportCSV", () => ({
  downloadCSV: (...args: unknown[]) => downloadCSVMock(...args),
}));

vi.mock("antd", () => ({
  Table: (props: TableProps<ListagemDesignacoesResponse>) => {
    tableMock(props);
    return <div data-testid="table" />;
  },
  Pagination: (props: PaginationProps) => {
    paginationMock(props);
    return <div data-testid="pagination" />;
  },
  Dropdown: ({ children, menu }: { children: ReactNode; menu: unknown }) => {
    dropdownMock(menu);
    return <div data-testid="dropdown">{children}</div>;
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
  LeftOutlined: () => <span data-testid="left-outlined" />,
  RightOutlined: () => <span data-testid="right-outlined" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    className,
    onClick,
    variant,
    size,
  }: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: string;
    size?: string;
  }) => (
    <button className={className} data-variant={variant} data-size={size} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/assets/icons/Download", () => ({
  default: () => <span data-testid="download-icon" />,
}));
vi.mock("@/assets/icons/DocumentoAlerta", () => ({
  default: () => <span data-testid="documento-alerta-icon" />,
}));
vi.mock("@/assets/icons/Cancelar", () => ({
  default: () => <span data-testid="cancelar-icon" />,
}));
vi.mock("@/assets/icons/Apostilar", () => ({
  default: () => <span data-testid="apostilar-icon" />,
}));
vi.mock("@/assets/icons/Lixeira", () => ({
  default: () => <span data-testid="lixeira-icon" />,
}));
vi.mock("@/assets/icons/Eye", () => ({
  default: ({ className }: { className?: string }) => (
    <span data-testid="eye-icon" className={className} />
  ),
}));

const makeRow = (index: number): ListagemDesignacoesResponse => ({
  id: index,
  indicado_rf: "987654",
  indicado_nome_servidor: "Mateus Antônio Miranda",
  titular_rf: "654321",
  titular_nome_servidor: "Mateus Antônio Miranda",
  sei_numero: "123",
  numero_portaria: "123",
  ano_vigente: "2025",
  dre_nome: "DRE Centro",
  unidade_proponente: "Escola Alpha",
  cargo_vaga_display: "Diretor",
  cargo_vaga: null,
  data_inicio: "2025-01-01",
  data_fim: null,
  tipo_vaga: "vago",
  tipo_vaga_display: "Vago",
  status: [
    StatusDesignacao.PENDENTE,
    StatusDesignacao.AGUARD_PUBLICACAO,
    StatusDesignacao.PUBLICADO_COM_PENDENCIA,
    StatusDesignacao.PUBLICADO,
  ][index % 4],
});

const data: ListagemDesignacoesResponse[] = Array.from({ length: 20 }, (_, i) => makeRow(i));

describe("ListagemDeDesignacoes", () => {
  beforeEach(() => {
    tableMock.mockClear();
    paginationMock.mockClear();
    dropdownMock.mockClear();
    downloadCSVMock.mockClear();
  });

  it("renderiza o cabeçalho e configura a tabela corretamente", () => {
    render(<ListagemDeDesignacoes data={data} />);

    expect(screen.getByText("Lista de designações")).toBeInTheDocument();
    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    expect(screen.getByTestId("download-icon")).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();

    expect(tableMock).toHaveBeenCalledTimes(1);
    const props = tableMock.mock.calls[0][0];

    expect(props.className).toBe("tabela-designacoes w-full");
    expect(props.scroll).toEqual({ x: "max-content" });
    expect(typeof props.rowKey).toBe("function");
    expect((props.rowKey as (r: ListagemDesignacoesResponse) => string)(makeRow(5))).toBe("5");
    expect(props.pagination).toBe(false);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(paginationMock).toHaveBeenCalledTimes(1);
    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    expect(paginationProps.current).toBe(1);
    expect(paginationProps.pageSize).toBe(10);
    expect(paginationProps.total).toBe(0);
    expect(paginationProps.showSizeChanger).toBe(false);
    expect(typeof paginationProps.itemRender).toBe("function");
    expect(props.columns).toHaveLength(12);
  });

  it("exibe o total de registros ao lado da paginação", () => {
    render(<ListagemDeDesignacoes data={data} total={107} />);
    expect(screen.getByText("107")).toBeInTheDocument();
    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    expect(paginationProps.total).toBe(107);
  });

  it("chama downloadCSV ao clicar em Exportar CSV", () => {
    render(<ListagemDeDesignacoes data={data} />);

    fireEvent.click(screen.getByRole("button", { name: /Exportar CSV/i }));

    expect(downloadCSVMock).toHaveBeenCalledTimes(1);
    const [receivedData, receivedColumns] = downloadCSVMock.mock.calls[0];
    expect(receivedData).toEqual(data);
    expect(receivedColumns).toHaveLength(12);
  });

  it("renderiza o status para todos os valores previstos", () => {
    render(<ListagemDeDesignacoes data={data} />);
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<ListagemDesignacoesResponse>["columns"]>;
    const statusRender = columns[10]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    const expected = [
      { status: StatusDesignacao.PENDENTE, text: "PENDENTE", color: "#B22B2A" },
      { status: StatusDesignacao.AGUARD_PUBLICACAO, text: "AGUARD. PUBLICAÇÃO", color: "#764FC3" },
      { status: StatusDesignacao.PUBLICADO_COM_PENDENCIA, text: "PÚBLICADO COM PENDÊNCIA", color: "#FE9239" },
      { status: StatusDesignacao.PUBLICADO, text: "PUBLICADO", color: "#10A957" },
    ];

    expected.forEach(({ status, text, color }) => {
      const record: ListagemDesignacoesResponse = { ...makeRow(0), status };
      const { unmount } = render(<>{statusRender?.(null, record)}</>);
      const tag = screen.getByTestId("tag");
      expect(tag).toHaveTextContent(text);
      expect(tag).toHaveAttribute("data-color", color);
      unmount();
    });
  });

  it("renderiza status INDISPONÍVEL quando status é undefined", () => {
    render(<ListagemDeDesignacoes data={data} />);
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<ListagemDesignacoesResponse>["columns"]>;
    const statusRender = columns[10]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    const record = { ...makeRow(0), status: undefined as unknown as StatusDesignacao };
    const { unmount } = render(<>{statusRender?.(null, record)}</>);
    const tag = screen.getByTestId("tag");
    expect(tag).toHaveTextContent("INDISPONÍVEL");
    expect(tag).toHaveAttribute("data-color", "#9E9E9E");
    unmount();
  });

  it("renderiza a coluna de ação e executa os callbacks do menu", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    render(<ListagemDeDesignacoes data={data} />);
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<ListagemDesignacoesResponse>["columns"]>;
    const actionRender = columns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    const row = makeRow(0);
    render(<>{actionRender?.(null, row)}</>);

    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
    expect(screen.getByTestId("more-outlined")).toBeInTheDocument();
    expect(dropdownMock).toHaveBeenCalledTimes(1);

    const menu = dropdownMock.mock.calls[0][0] as { items: Array<{ onClick: () => void }> };
    expect(menu.items).toHaveLength(4);
    menu.items.forEach((item) => item.onClick());

    expect(logSpy).toHaveBeenNthCalledWith(1, "Apostilar");
    expect(logSpy).toHaveBeenNthCalledWith(2, "Cessar");
    expect(logSpy).toHaveBeenNthCalledWith(3, "Tornar Insubsistente");
    expect(logSpy).toHaveBeenNthCalledWith(4, "Deletar");

    logSpy.mockRestore();
  });

  it("mantém prev/next desabilitados quando o elemento original estiver desabilitado", () => {
    render(<ListagemDeDesignacoes data={data} />);

    expect(paginationMock).toHaveBeenCalledTimes(1);
    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    const itemRenderFn = paginationProps.itemRender as NonNullable<PaginationProps["itemRender"]>;
    expect(typeof itemRenderFn).toBe("function");

    const prevOriginal = <button aria-disabled="true">prev</button>;
    const nextOriginal = <button aria-disabled="true">next</button>;
    const pageOriginal = <button>2</button>;

    const renderedPrev = itemRenderFn(1, "prev", prevOriginal);
    const renderedNext = itemRenderFn(2, "next", nextOriginal);
    const renderedPage = itemRenderFn(2, "page", pageOriginal);

    const { rerender } = render(<>{renderedPrev}</>);
    const prevLabel = screen.getByText("Anterior");
    expect(prevLabel).toBeInTheDocument();
    expect(prevLabel.closest("button")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByTestId("left-outlined")).toBeInTheDocument();

    rerender(<>{renderedNext}</>);
    const nextLabel = screen.getByText("Próximo");
    expect(nextLabel).toBeInTheDocument();
    expect(nextLabel.closest("button")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByTestId("right-outlined")).toBeInTheDocument();

    rerender(<>{renderedPage}</>);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});