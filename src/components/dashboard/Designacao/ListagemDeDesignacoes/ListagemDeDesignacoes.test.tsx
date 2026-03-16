import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { TableProps } from "antd";
import type { ReactNode } from "react";
import ListagemDeDesignacoes from "./ListagemDeDesignacoes";

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
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <button className={className}>{children}</button>,
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

describe("ListagemDeDesignacoes", () => {
  beforeEach(() => {
    tableMock.mockClear();
    dropdownMock.mockClear();
  });

  it("renderiza o cabeçalho e configura a tabela corretamente", () => {
    render(<ListagemDeDesignacoes />);

    expect(screen.getByText("Lista de designações")).toBeInTheDocument();
    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    expect(screen.getByText("Exportar PDF")).toBeInTheDocument();
    expect(screen.getAllByTestId("download-icon")).toHaveLength(2);
    expect(screen.getByTestId("table")).toBeInTheDocument();

    expect(tableMock).toHaveBeenCalledTimes(1);
    const props = tableMock.mock.calls[0][0];

    expect(props.className).toBe("tabela-designacoes");
    expect(props.dataSource).toHaveLength(20);
    expect(props.pagination).toEqual({
      pageSize: 10,
      defaultPageSize: 10,
      placement: ["bottomCenter"],
    });
    expect(props.columns).toHaveLength(12);
  });

  it("executa todos os sorters e renderizadores das colunas", () => {
    render(<ListagemDeDesignacoes />);
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

    const indicatedRender = columns[1]?.render as
      | ((value: string) => ReactNode)
      | undefined;
    const titularRender = columns[3]?.render as
      | ((value: string) => ReactNode)
      | undefined;

    render(<>{indicatedRender?.("Servidor de Teste")}</>);
    render(<>{titularRender?.("Titular de Teste")}</>);

    expect(screen.getByText("Servidor de Teste")).toBeInTheDocument();
    expect(screen.getByText("Titular de Teste")).toBeInTheDocument();
  });

  it("renderiza o status para todos os valores previstos", () => {
    render(<ListagemDeDesignacoes />);
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
    render(<ListagemDeDesignacoes />);
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

    const menu = dropdownMock.mock.calls[0][0] as { items: Array<{ onClick: () => void }> };
    expect(menu.items).toHaveLength(4);
    menu.items.forEach((item) => item.onClick());

    expect(logSpy).toHaveBeenNthCalledWith(1, "Apostilar");
    expect(logSpy).toHaveBeenNthCalledWith(2, "Cessar");
    expect(logSpy).toHaveBeenNthCalledWith(3, "Tornar Insubsistente");
    expect(logSpy).toHaveBeenNthCalledWith(4, "Deletar");

    logSpy.mockRestore();
  });
});
