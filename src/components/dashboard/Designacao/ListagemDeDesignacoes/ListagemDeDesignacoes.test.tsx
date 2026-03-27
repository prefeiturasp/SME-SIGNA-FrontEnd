import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { PaginationProps, TableProps } from "antd";
import type { ReactNode } from "react";
import ListagemDeDesignacoes from "./ListagemDeDesignacoes";
import { ListagemDesignacoesResponse } from "@/types/designacao";

type Row = {
  key: string;
  servidor_indicado: string;
  rf_servidor_indicado: number;
  servidor_titular: string;
  rf_servidor_titular: number;
  sei_titular: number;
  portaria_designacao: number;
  ano_designacao: number;
  sei_designacao: number;
  portaria_cessacao: number;
  ano_cessacao: number;
  status: number;
};

const tableMock = vi.fn<(props: TableProps<Row>) => ReactNode>();
const dropdownMock = vi.fn();
const downloadCSVMock = vi.fn();
const pushMock = vi.fn();

vi.mock("@/utils/export/exportCSV", () => ({
  downloadCSV: (...args: unknown[]) => downloadCSVMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => pushMock(...args),
  }),
}));

vi.mock("antd", () => ({
  Table: (props: TableProps<Row>) => {
    tableMock(props);
    return <div data-testid="table" />;
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
  }: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <button className={className} onClick={onClick}>
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
  default: ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <span data-testid="eye-icon" className={className} onClick={onClick} />
  ),
}));
const data: ListagemDesignacoesResponse[] = Array.from({ length: 20 }).map((_, index) => ({
  key: index.toString(),
  servidor_indicado: 'Mateus Antônio Miranda',
  rf_servidor_indicado: 987654,
  servidor_titular: 'Mateus Antônio Miranda',
  rf_servidor_titular: 654321,
  sei_titular: 123,
  portaria_designacao: 123,
  ano_designacao: 2025,
  sei_designacao: 123,
  portaria_cessacao: 123,
  ano_cessacao: 123,
  status: index % 4,
}))
describe("ListagemDeDesignacoes", () => {
  beforeEach(() => {
    tableMock.mockClear();
    dropdownMock.mockClear();
    downloadCSVMock.mockClear();
    pushMock.mockClear();
  });

  it("renderiza o cabeçalho e configura a tabela corretamente", () => {
    render(<ListagemDeDesignacoes data={data} />);

    expect(screen.getByText("Lista de designações")).toBeInTheDocument();
    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    expect(screen.getByText("Exportar PDF")).toBeInTheDocument();
    expect(screen.getAllByTestId("download-icon")).toHaveLength(2);
    expect(screen.getByTestId("table")).toBeInTheDocument();

    expect(tableMock).toHaveBeenCalledTimes(1);
    const props = tableMock.mock.calls[0][0];

    expect(props.className).toBe("tabela-designacoes");
     expect(props.pagination).toMatchObject({
      pageSize: 10,
      defaultPageSize: 10,
      placement: ["bottomCenter"],
    });
    const pagination = props.pagination as PaginationProps | undefined;
    expect(pagination).toBeDefined();
    expect(typeof pagination?.itemRender).toBe("function");
    expect(props.columns).toHaveLength(12);
  });

  it("chama downloadCSV ao clicar em Exportar CSV", () => {
    render(<ListagemDeDesignacoes data={data} />);

    fireEvent.click(screen.getByRole("button", { name: /Exportar CSV/i }));

    expect(downloadCSVMock).toHaveBeenCalledTimes(1);
    const [receivedData, receivedColumns] = downloadCSVMock.mock.calls[0];
    expect(receivedData).toEqual(data);
    expect(receivedColumns).toHaveLength(12);
  });

  it("executa todos os sorters das colunas", () => {
    render(<ListagemDeDesignacoes data={data} />);
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<Row>["columns"]>;

    const rowA: Row = {
      key: "a",
      servidor_indicado: "Servidor A",
      rf_servidor_indicado: 100,
      servidor_titular: "Titular A",
      rf_servidor_titular: 200,
      sei_titular: 300,
      portaria_designacao: 400,
      ano_designacao: 2024,
      sei_designacao: 500,
      portaria_cessacao: 600,
      ano_cessacao: 2025,
      status: 0,
    };
    const rowB: Row = {
      ...rowA,
      key: "b",
      rf_servidor_indicado: 101,
      rf_servidor_titular: 201,
      sei_titular: 301,
      portaria_designacao: 401,
      ano_designacao: 2025,
      sei_designacao: 501,
      portaria_cessacao: 601,
      ano_cessacao: 2026,
    };

    const sortableIndexes = [0, 2, 4, 5, 6, 7, 8, 9];
    sortableIndexes.forEach((index) => {
      const sorter = columns[index]?.sorter as
        | ((a: Row, b: Row) => number)
        | undefined;
      expect(sorter).toBeTypeOf("function");
      expect(sorter?.(rowA, rowB)).toBe(-1);
    });
  });

  it("renderiza o status para todos os valores previstos", () => {
    render(<ListagemDeDesignacoes data={data} />);
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<Row>["columns"]>;
    const statusRender = columns[10]?.render as
      | ((_: unknown, record: Row) => ReactNode)
      | undefined;

    const expected = [
      { status: 0, text: "PENDENTE", color: "#B22B2A" },
      { status: 1, text: "AGUARD. PUBLICAÇÃO", color: "#764FC3" },
      { status: 2, text: "PÚBLICADO COM PENDÊNCIA", color: "#FE9239" },
      { status: 3, text: "PUBLICADO", color: "#10A957" },
    ];

    expected.forEach(({ status, text, color }) => {
      const { unmount } = render(
        <>{statusRender?.(null, { ...(props.dataSource?.[0] as Row), key: String(status), status })}</>,
      );
      const tag = screen.getByTestId("tag");
      expect(tag).toHaveTextContent(text);
      expect(tag).toHaveAttribute("data-color", color);
      unmount();
    });
  });

  it("renderiza a coluna de ação e executa os callbacks do menu", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    render(<ListagemDeDesignacoes data={data} />);
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<Row>["columns"]>;
    const actionRender = columns[11]?.render as
      | ((_: unknown, record: Row) => ReactNode)
      | undefined;

    const row = (props.dataSource?.[0] as Row) ?? {
      key: "0",
      servidor_indicado: "",
      rf_servidor_indicado: 0,
      servidor_titular: "",
      rf_servidor_titular: 0,
      sei_titular: 0,
      portaria_designacao: 0,
      ano_designacao: 0,
      sei_designacao: 0,
      portaria_cessacao: 0,
      ano_cessacao: 0,
      status: 0,
    };

    render(<>{actionRender?.(null, row)}</>);

    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
    expect(screen.getByTestId("more-outlined")).toBeInTheDocument();
    expect(dropdownMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("eye-icon"));
    expect(pushMock).toHaveBeenCalledWith(
      `/pages/listagem-designacoes/visualizar-designacao/${row.key}`
    );

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
    render(<ListagemDeDesignacoes data={data}   />);
    const props = tableMock.mock.calls[0][0];
    const pagination = props.pagination as PaginationProps | undefined;
    expect(pagination).toBeDefined();
    const itemRender = pagination?.itemRender;
    expect(typeof itemRender).toBe("function");
    if (!itemRender) {
      throw new Error("itemRender não foi configurado na paginação");
    }

    const prevOriginal = <button aria-disabled="true">prev</button>;
    const nextOriginal = <button aria-disabled="true">next</button>;
    const pageOriginal = <button>2</button>;

    const renderedPrev = itemRender(
      1,
      "prev",
      prevOriginal
    );
    const renderedNext = itemRender(
      2,
      "next",
      nextOriginal
    );
    const renderedPage = itemRender(
      2,
      "page",
      pageOriginal
    );

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
