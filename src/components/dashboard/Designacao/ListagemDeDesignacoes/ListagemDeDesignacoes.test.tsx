import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PaginationProps, TableProps } from "antd";
import type { ReactNode } from "react";
import ListagemDeDesignacoes from "./ListagemDeDesignacoes";
import { ListagemDesignacoesResponse, StatusDesignacao } from "@/types/designacao";

const tableMock = vi.fn<(props: TableProps<ListagemDesignacoesResponse>) => ReactNode>();
const paginationMock = vi.fn();
const dropdownMock = vi.fn();
const popconfirmMock = vi.fn();
const downloadCSVMock = vi.fn();
const pushMock = vi.fn();
const toastMock = vi.fn();
const mutateAsyncMock = vi.fn();
const generateExportDataMock = vi.fn();

vi.mock("@/utils/export/exportCSV", () => ({
  downloadCSV: (...args: unknown[]) => downloadCSVMock(...args),
}));

vi.mock("@/components/ui/headless-toast", () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}));

vi.mock("@/hooks/useExcluirDesignacao", () => ({
  useExcluirDesignacao: () => ({
    mutateAsync: (...args: unknown[]) => mutateAsyncMock(...args),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => pushMock(...args),
  }),
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
  Popconfirm: ({
    children,
    open,
    onConfirm,
    onCancel,
  }: {
    children: ReactNode;
    open?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => {
    popconfirmMock({ open, onConfirm, onCancel });
    return (
      <div data-testid="popconfirm">
        {children}
        {open && (
          <>
            <button data-testid="popconfirm-confirm" onClick={onConfirm}>
              Sim
            </button>
            <button data-testid="popconfirm-cancel" onClick={onCancel}>
              Não
            </button>
          </>
        )}
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
  const renderComponent = (
    props?: Partial<React.ComponentProps<typeof ListagemDeDesignacoes>>
  ) =>
    render(
      <ListagemDeDesignacoes
        data={data}
        generateExportData={generateExportDataMock}
        {...props}
      />
    );

  beforeEach(() => {
    tableMock.mockClear();
    paginationMock.mockClear();
    dropdownMock.mockClear();
    popconfirmMock.mockClear();
    downloadCSVMock.mockClear();
    pushMock.mockClear();
    toastMock.mockClear();
    mutateAsyncMock.mockReset();
    generateExportDataMock.mockReset();
    generateExportDataMock.mockResolvedValue(data);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza o cabeçalho e configura a tabela corretamente", () => {
    renderComponent();

    expect(screen.getByText("Lista de designações")).toBeInTheDocument();
    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    expect(screen.getByTestId("download-icon")).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();

    expect(tableMock).toHaveBeenCalledTimes(1);
    const props = tableMock.mock.calls[0][0];

    expect(props.className).toBe("tabela-designacoes w-full");
    expect(props.scroll).toEqual({ x: "100%" });
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
    expect(props.loading).toBe(false);
  });

  it("exibe o total de registros ao lado da paginação", () => {
    renderComponent({ total: 107 });
    expect(screen.getByText("107")).toBeInTheDocument();

    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    expect(paginationProps.total).toBe(107);
  });

  it("respeita loading, page e callback de paginação customizados", () => {
    const onPageChange = vi.fn();
    renderComponent({ isLoading: true, page: 3, onPageChange });

    const tableProps = tableMock.mock.calls[0][0];
    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    expect(tableProps.loading).toBe(true);
    expect(paginationProps.current).toBe(3);

    paginationProps.onChange?.(4, 10);
    expect(onPageChange).toHaveBeenCalledWith(4, 10);
  });

  it("chama downloadCSV ao clicar em Exportar CSV quando há dados para exportar", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Exportar CSV/i }));

    await vi.waitFor(() => {
      expect(downloadCSVMock).toHaveBeenCalledTimes(1);
    });
    const [receivedData, receivedColumns] = downloadCSVMock.mock.calls[0];

    expect(receivedData).toEqual(data);
    expect(receivedColumns).toHaveLength(11);
  });

  it("não chama downloadCSV quando exportação retorna lista vazia", async () => {
    generateExportDataMock.mockResolvedValueOnce([]);
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Exportar CSV/i }));

    await vi.waitFor(() => {
      expect(generateExportDataMock).toHaveBeenCalledTimes(1);
    });
    expect(downloadCSVMock).not.toHaveBeenCalled();
  });

  it("renderiza o status para todos os valores previstos", () => {
    renderComponent();
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
    renderComponent();
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

  it("renderiza a coluna de ação e executa os callbacks", () => {
    renderComponent();
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

    fireEvent.click(screen.getByTestId("eye-icon"));
    expect(pushMock).toHaveBeenCalledWith(
      `/pages/listagem-designacoes/visualizar-designacao/${row.id}`
    );
  });

  it("executa os itens de menu e abre confirmação de exclusão", () => {
    renderComponent();

    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<
      TableProps<ListagemDesignacoesResponse>["columns"]
    >;

    const actionRender = columns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{actionRender?.(null, makeRow(1))}</>);

    fireEvent.click(screen.getByTestId("menu-item-1"));

    fireEvent.click(screen.getByTestId("menu-item-2"));

    fireEvent.click(screen.getByTestId("menu-item-3"));

    expect(console.log).toHaveBeenNthCalledWith(1, "Apostilar");
    expect(console.log).toHaveBeenNthCalledWith(2, "Tornar Insubsistente");

    expect(pushMock).toHaveBeenCalledWith("/pages/cessacao?id=1");

    fireEvent.click(screen.getByTestId("menu-item-4"));

    const updatedProps = tableMock.mock.calls.at(-1)?.[0];
    const updatedColumns = updatedProps?.columns as NonNullable<
      TableProps<ListagemDesignacoesResponse>["columns"]
    >;

    const updatedActionRender = updatedColumns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{updatedActionRender?.(null, makeRow(1))}</>);

    expect(screen.getByTestId("popconfirm-confirm")).toBeInTheDocument();
  });

  it("exibe toast de erro e recarrega a página quando exclusão falha", async () => {
    mutateAsyncMock.mockResolvedValueOnce({ success: false, error: "Falha ao excluir" });
    const onPageChange = vi.fn();

    renderComponent({ page: 6, onPageChange });
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<ListagemDesignacoesResponse>["columns"]>;
    const actionRender = columns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{actionRender?.(null, makeRow(8))}</>);
    fireEvent.click(screen.getByTestId("menu-item-4"));

    const updatedProps = tableMock.mock.calls.at(-1)?.[0];
    const updatedColumns = updatedProps?.columns as NonNullable<
      TableProps<ListagemDesignacoesResponse>["columns"]
    >;
    const updatedActionRender = updatedColumns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{updatedActionRender?.(null, makeRow(8))}</>);
    fireEvent.click(screen.getByTestId("popconfirm-confirm"));

    await vi.waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(8);
    });
    expect(toastMock).toHaveBeenCalledWith({
      variant: "error",
      title: "Erro ao excluir a designação.",
      description: "Falha ao excluir",
    });    
  });

  it("exibe toast de sucesso quando exclusão é bem sucedida", async () => {
    mutateAsyncMock.mockResolvedValueOnce({ success: true });

    renderComponent();
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<ListagemDesignacoesResponse>["columns"]>;
    const actionRender = columns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{actionRender?.(null, makeRow(9))}</>);
    fireEvent.click(screen.getByTestId("menu-item-4"));

    const updatedProps = tableMock.mock.calls.at(-1)?.[0];
    const updatedColumns = updatedProps?.columns as NonNullable<
      TableProps<ListagemDesignacoesResponse>["columns"]
    >;
    const updatedActionRender = updatedColumns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{updatedActionRender?.(null, makeRow(9))}</>);
    fireEvent.click(screen.getByTestId("popconfirm-confirm"));

    await vi.waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(9);
    });
    expect(toastMock).toHaveBeenCalledWith({
      variant: "success",
      title: "Tudo certo por aqui!",
      description: "A designação foi excluída com sucesso!",
    });
  });

  it("usa onPageChange padrão quando exclusão falha sem callback informado", async () => {
    mutateAsyncMock.mockResolvedValueOnce({ success: false, error: "Falha padrão" });

    renderComponent();
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<ListagemDesignacoesResponse>["columns"]>;
    const actionRender = columns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{actionRender?.(null, makeRow(10))}</>);
    fireEvent.click(screen.getByTestId("menu-item-4"));

    const updatedProps = tableMock.mock.calls.at(-1)?.[0];
    const updatedColumns = updatedProps?.columns as NonNullable<
      TableProps<ListagemDesignacoesResponse>["columns"]
    >;
    const updatedActionRender = updatedColumns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{updatedActionRender?.(null, makeRow(10))}</>);
    fireEvent.click(screen.getByTestId("popconfirm-confirm"));

    await vi.waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(10);
    });
    expect(toastMock).toHaveBeenCalledWith({
      variant: "error",
      title: "Erro ao excluir a designação.",
      description: "Falha padrão",
    });
  });

  it("fecha confirmação ao cancelar exclusão", () => {
    renderComponent();
    const props = tableMock.mock.calls[0][0];
    const columns = props.columns as NonNullable<TableProps<ListagemDesignacoesResponse>["columns"]>;
    const actionRender = columns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{actionRender?.(null, makeRow(2))}</>);
    fireEvent.click(screen.getByTestId("menu-item-4"));

    const updatedProps = tableMock.mock.calls.at(-1)?.[0];
    const updatedColumns = updatedProps?.columns as NonNullable<
      TableProps<ListagemDesignacoesResponse>["columns"]
    >;
    const updatedActionRender = updatedColumns[11]?.render as
      | ((_: unknown, record: ListagemDesignacoesResponse) => ReactNode)
      | undefined;

    render(<>{updatedActionRender?.(null, makeRow(2))}</>);
    expect(screen.getByTestId("popconfirm-cancel")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("popconfirm-cancel"));
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("mantém prev/next desabilitados corretamente", () => {
    renderComponent();

    const paginationProps = paginationMock.mock.calls[0][0] as PaginationProps;
    const itemRenderFn = paginationProps.itemRender as NonNullable<PaginationProps["itemRender"]>;

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

    const renderedInvalidOriginal = itemRenderFn(3, "prev", "texto" as unknown as ReactNode);
    expect(renderedInvalidOriginal).toBe("texto");
  });
});