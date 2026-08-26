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
const formatarDataHoraMock = vi.fn((value: string) => {
  void value;
  return `01/06/2026, 12:00`;
});
const pushMock = vi.fn();
const modalConfirmMock = vi.fn();
const notificationSuccessMock = vi.fn();
const notificationErrorMock = vi.fn();
const mutateAsyncMock = vi.fn();
const domEventStopPropagationMock = vi.fn();

type TestRowClickEvent = { target: { closest: (selector: string) => unknown } };
type TestOnRow = (record: ListagemAtosAdministrativosResponse) => {
  onClick: (event: TestRowClickEvent) => void;
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/utils", () => ({
  formatarDataHora: (value: string) => formatarDataHoraMock(value),
}));

vi.mock("@/hooks/useExcluirDesignacao", () => ({
  useExcluirDesignacao: () => ({ mutateAsync: mutateAsyncMock }),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: notificationSuccessMock,
    error: notificationErrorMock,
  }),
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
    menu?: {
      items?: Array<{ key: string; label?: ReactNode; onClick?: (info: { domEvent: { preventDefault: () => void; stopPropagation: () => void } }) => void }>;
      onClick?: (info: { domEvent: { preventDefault: () => void; stopPropagation: () => void } }) => void;
    };
  }) => {
    dropdownMock(menu);
    return (
      <div data-testid="dropdown">
        {children}
        {menu?.items?.map((item) => (
          <button
            key={item.key}
            data-testid={`menu-item-${item.key}`}
            onClick={() => {
              const info = { domEvent: { preventDefault: vi.fn(), stopPropagation: domEventStopPropagationMock } };
              item.onClick?.(info);
              menu.onClick?.(info);
            }}
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
  Modal: {
    useModal: () => [
      { confirm: (options: { onOk?: () => void | Promise<void> }) => modalConfirmMock(options) },
      <div data-testid="modal-context-holder" key="modal-context-holder" />,
    ],
  },
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
    numero_sei: "SEI-1",
    observacoes: "obs 1",
    numero_portaria: "100/2026",
    status_publicacao: StatusAtosAdministrativos.PUBLICADO,
    tipo: "DESIGNACAO",
    tipo_insubsistencia: null,
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
    const rfRender = columns[5]?.render as
      | ((rf: string | null, record: ListagemAtosAdministrativosResponse, index: number) => ReactNode)
      | undefined;

    expect(coluna?.title).toBe("Registro Funcional (RF)");
    expect(coluna?.dataIndex).toBe("rf");

    const { unmount, rerender } = render(<>{rfRender?.("1234567", rows[0], 0)}</>);
    expect(screen.getByText("1234567")).toBeInTheDocument();

    rerender(<>{rfRender?.(null, rows[0], 0)}</>);
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

    screen.getByTestId("menu-item-1").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/apostila?id=1&origem=designacao");
    expect(domEventStopPropagationMock).toHaveBeenCalled();

    screen.getByTestId("menu-item-2").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/cessacao?id=1");

    screen.getByTestId("menu-item-3").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/insubsistencia?id=1&origem=designacao");

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

    screen.getByTestId("menu-item-4").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-2?id=1");
  });

  it("abre confirmação e exclui a designação ao clicar em Excluir", async () => {
    const onAtoExcluido = vi.fn();
    mutateAsyncMock.mockResolvedValueOnce({ success: true });

    render(
      <ListagemDeAtosAdministrativos data={rows} total={1} page={1} onAtoExcluido={onAtoExcluido} />
    );

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

    screen.getByTestId("menu-item-5").click();

    expect(modalConfirmMock).toHaveBeenCalledTimes(1);
    const confirmOptions = modalConfirmMock.mock.calls[0][0];
    await confirmOptions.onOk();

    expect(mutateAsyncMock).toHaveBeenCalledWith(1);
    expect(notificationSuccessMock).toHaveBeenCalledWith({ title: "Designação excluída com sucesso!" });
    expect(onAtoExcluido).toHaveBeenCalledTimes(1);
  });

  it("monta menu de ações para cessação, apostila e insubsistência", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as ((record: RowWithRelations) => ReactNode) | undefined;

    const { rerender } = render(
      <>{actionRender?.({ ...rows[0], tipo: "CESSACAO", ato_pai_id: 99 })}</>
    );
    expect(screen.getByTestId("menu-item-1")).toHaveTextContent("Apostilar");
    expect(screen.getByTestId("menu-item-3")).toHaveTextContent("Tornar insubsistente");

    screen.getByTestId("menu-item-1").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/apostila?id=99&origem=cessacao");

    screen.getByTestId("menu-item-3").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/insubsistencia?id=99&origem=cessacao");

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

    render(<>{actionRender?.({ ...rows[0], tipo: "OUTRO" })}</>);
    expect(screen.queryByTestId(/menu-item-/)).not.toBeInTheDocument();
  });

  it("não exibe item de tornar sem efeito para insubsistência sem tipo relacionado", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as ((record: RowWithRelations) => ReactNode) | undefined;

    render(<>{actionRender?.({ ...rows[0], tipo: "INSUBSISTENCIA", tipo_insubsistencia: null })}</>);
    expect(screen.queryByTestId("menu-item-7")).not.toBeInTheDocument();
  });

  it("remove ações de apostila e sem efeito quando já há insubsistência", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as ((record: RowWithRelations) => ReactNode) | undefined;

    const { rerender } = render(
      <>{actionRender?.({ ...rows[0], tipo: "APOSTILA", insubsistencia: { id: 1 } })}</>
    );
    expect(screen.queryByTestId("menu-item-6")).not.toBeInTheDocument();

    rerender(
      <>
        {actionRender?.({
          ...rows[0],
          tipo: "INSUBSISTENCIA",
          tipo_insubsistencia: "CESSACAO",
          insubsistencia: { id: 2 },
        })}
      </>
    );
    expect(screen.queryByTestId("menu-item-7")).not.toBeInTheDocument();
  });

  it("notifica erro específico quando exclusão retorna success false", async () => {
    mutateAsyncMock.mockResolvedValueOnce({ success: false, error: "Não foi possível excluir" });
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

    screen.getByTestId("menu-item-5").click();
    const confirmOptions = modalConfirmMock.mock.calls[0][0];
    await confirmOptions.onOk();

    expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Não foi possível excluir" });
  });

  it("notifica erro genérico quando mutateAsync lança exceção", async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error("Falha inesperada"));
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

    screen.getByTestId("menu-item-5").click();
    const confirmOptions = modalConfirmMock.mock.calls[0][0];
    await confirmOptions.onOk();

    expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Erro ao excluir a designação" });
  });

  it("navega pelo clique da linha quando o tipo possui rota", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const onRow = tableProps.onRow as unknown as TestOnRow;
    const rowClick = onRow({ ...rows[0], tipo: "CESSACAO" }).onClick;

    rowClick({
      target: {
        closest: vi.fn(() => null),
      },
    });

    expect(pushMock).toHaveBeenCalledWith("/pages//visualizar-cessacao/1");
  });

  it("não navega no clique da linha quando o clique vem de elemento com data-no-row-click", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const onRow = tableProps.onRow as unknown as TestOnRow;
    const rowClick = onRow({ ...rows[0], tipo: "DESIGNACAO" }).onClick;

    rowClick({
      target: {
        closest: vi.fn(() => ({})),
      },
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("não navega no clique da linha quando o tipo não possui rota mapeada", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const onRow = tableProps.onRow as unknown as TestOnRow;
    const rowClick = onRow({ ...rows[0], tipo: "OUTRO" }).onClick;

    rowClick({
      target: {
        closest: vi.fn(() => null),
      },
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("exibe tags de portaria e servidor indicado com título e subtítulo customizados", () => {
    render(
      <ListagemDeAtosAdministrativos
        data={rows}
        total={1}
        page={1}
        portaria="100/2026"
        servidor_indicado="Servidor A"
        titulo="Histórico de atos"
        subtitulo="Subtítulo customizado"
      />
    );

    expect(screen.getByText("Histórico de atos")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo customizado")).toBeInTheDocument();
    expect(screen.getByText("Nº da portaria:")).toBeInTheDocument();
    expect(screen.getByText("100/2026")).toBeInTheDocument();
    expect(screen.getByText("Servidor indicado:")).toBeInTheDocument();
    expect(screen.getByText("Servidor A")).toBeInTheDocument();
  });

  it("remove colunas extras quando showCamposExtras é falso", () => {
    render(
      <ListagemDeAtosAdministrativos data={rows} total={1} page={1} showCamposExtras={false} />
    );

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const titulos = columns.map((coluna) => (coluna as { title?: string }).title);

    expect(columns).toHaveLength(6);
    expect(titulos).not.toContain("Portaria do ato");
    expect(titulos).not.toContain("Servidor indicado");
  });

  it("extrai o conteúdo da célula quando o valor é um objeto com children", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const tipoRender = columns[0]?.render as
      | ((value: unknown, record: ListagemAtosAdministrativosResponse, index: number) => ReactNode)
      | undefined;

    const { unmount } = render(
      <>{tipoRender?.({ children: "Conteúdo da célula" }, rows[0], 0)}</>
    );
    expect(screen.getByText("Conteúdo da célula")).toBeInTheDocument();
    unmount();

    const semChildren = render(<>{tipoRender?.({ children: undefined }, rows[0], 0)}</>);
    expect(screen.getByText("-")).toBeInTheDocument();
    semChildren.unmount();

    render(<>{tipoRender?.(null, rows[0], 0)}</>);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("navega para tornar sem efeito ao acionar a ação de insubsistência", () => {
    render(<ListagemDeAtosAdministrativos data={rows} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = tableProps.columns as NonNullable<TableProps<ListagemAtosAdministrativosResponse>["columns"]>;
    const actionRender = columns[7]?.render as ((record: RowWithRelations) => ReactNode) | undefined;

    render(
      <>{actionRender?.({ ...rows[0], tipo: "INSUBSISTENCIA", tipo_insubsistencia: "DESIGNACAO" })}</>
    );

    screen.getByTestId("menu-item-7").click();
    expect(pushMock).toHaveBeenCalledWith("/pages/tornar-sem-efeito?id=1");
  });

  it("exclui designação sem callback de atualização configurado", async () => {
    mutateAsyncMock.mockResolvedValueOnce({ success: true });
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

    screen.getByTestId("menu-item-5").click();
    const confirmOptions = modalConfirmMock.mock.calls[0][0];
    await confirmOptions.onOk();

    expect(notificationSuccessMock).toHaveBeenCalledWith({
      title: "Designação excluída com sucesso!",
    });
  });
});
