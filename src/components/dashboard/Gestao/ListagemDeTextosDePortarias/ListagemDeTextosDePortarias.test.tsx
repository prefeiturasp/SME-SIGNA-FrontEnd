import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaginationProps, TableProps } from "antd";
import type { ColumnType } from "antd/es/table";
import type { Key, ReactNode } from "react";
import ListagemDeTextosDePortarias from "./ListagemDeTextosDePortarias";
import { StatusCargosBase, TextosDePortariasResponse } from "@/types/gestao";

const tableMock = vi.fn<(props: TableProps<TextosDePortariasResponse>) => ReactNode>();
const paginationMock = vi.fn<(props: PaginationProps) => ReactNode>();
const badgeStatusMock = vi.fn<(status: StatusCargosBase, dataTestId: string) => ReactNode>();

const { pushMock, itemRenderMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  itemRenderMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/pagination/utils", () => ({
  itemRender: itemRenderMock,
  MostrarRegistros: ({ page, total }: { page: number; total: number }) => (
    <span data-testid="mostrar-registros">
      {page}-{total}
    </span>
  ),
}));

vi.mock("antd", () => ({
  Table: (props: TableProps<TextosDePortariasResponse>) => {
    tableMock(props);
    const dataSource = props.dataSource ?? [];

    return (
      <div data-testid="table">
        {dataSource.map((record) => (
          <button
            key={record.id}
            type="button"
            data-testid={`linha-${record.id}`}
            onClick={(event) => {
              props.onRow?.(record)?.onClick?.(event);
            }}
          >
            {record.nome_modelo}
          </button>
        ))}
      </div>
    );
  },
  Pagination: (props: PaginationProps) => {
    paginationMock(props);
    return (
      <div data-testid="pagination">
        <button type="button" onClick={() => props.onChange?.(2, props.pageSize ?? 10)}>
          ir para pagina 2
        </button>
      </div>
    );
  },
}));

vi.mock("../ListagemDeCargos/ListagemDeCargos", () => ({
  BadgeStatusCargosBase: (status: StatusCargosBase, dataTestId: string) => {
    badgeStatusMock(status, dataTestId);
    return <span data-testid={dataTestId}>{status}</span>;
  },
}));

function criarTextoPortaria(
  overrides: Partial<TextosDePortariasResponse> = {},
): TextosDePortariasResponse {
  return {
    id: 10,
    tipo_ato_pai: "Portaria",
    tipo_portaria: "Portaria",
    tipo_de_ato: "Portaria",
    nome_modelo: "Modelo de portaria",
    status: StatusCargosBase.ATIVO,
    criado_em: "2026-06-11T08:05:00",
    atualizado_em: "2026-06-11T10:00:00",
    texto_portaria: "Texto 1",
    variaveis: ["VARIAVEL 1"],
    tipo_cargo: "CARGO 1",
    observacoes: "Observações 1",
    ...overrides,
  };
}

function obterColunas(
  tableProps: TableProps<TextosDePortariasResponse>,
): ColumnType<TextosDePortariasResponse>[] {
  const columns = tableProps.columns;
  if (!columns) {
    throw new Error("Colunas da tabela não foram definidas");
  }
  return columns as ColumnType<TextosDePortariasResponse>[];
}

function obterRowKey(
  tableProps: TableProps<TextosDePortariasResponse>,
): (record: TextosDePortariasResponse, index?: number) => Key {
  const { rowKey } = tableProps;
  if (typeof rowKey !== "function") {
    throw new Error("rowKey da tabela não é uma função");
  }
  return rowKey;
}

function obterRowClassName(
  tableProps: TableProps<TextosDePortariasResponse>,
): (record: TextosDePortariasResponse, index: number, indent: number) => string {
  const { rowClassName } = tableProps;
  if (typeof rowClassName !== "function") {
    throw new Error("rowClassName da tabela não é uma função");
  }
  return rowClassName;
}

describe("ListagemDeTextosDePortarias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza cabeçalho, tabela, paginação e props padrão", () => {
    const textoPortaria = criarTextoPortaria();
    render(<ListagemDeTextosDePortarias data={[textoPortaria]} total={12} page={1} />);

    expect(screen.getByText("Lista de textos de portarias")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Consulte os modelos de texto de Portaria cadastrados no sistema. Selecione um modelo para conferir seus detalhes ou escolha a opção “editar” para fazer alterações.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(screen.getByTestId("mostrar-registros")).toHaveTextContent("1-12");

    const tableProps = tableMock.mock.calls[0][0];
    expect(tableProps.loading).toBe(false);
    expect(tableProps.dataSource).toEqual([textoPortaria]);
    expect(obterRowKey(tableProps)(textoPortaria, 0)).toBe("10");
    expect(tableProps.pagination).toBe(false);
    expect(tableProps.columns).toHaveLength(5);
    expect(tableProps.scroll).toEqual({ x: "100%" });
    expect(tableProps.className).toBe("tabela-principal w-full");

    const paginationProps = paginationMock.mock.calls[0][0];
    expect(paginationProps.current).toBe(1);
    expect(paginationProps.pageSize).toBe(10);
    expect(paginationProps.total).toBe(12);
    expect(paginationProps.showSizeChanger).toBe(false);
    expect(paginationProps.itemRender).toBe(itemRenderMock);
  });

  it("repassa loading e callback da paginação", () => {
    const onPageChange = vi.fn();
    render(
      <ListagemDeTextosDePortarias
        data={[criarTextoPortaria()]}
        total={27}
        page={3}
        isLoading={true}
        onPageChange={onPageChange}
      />,
    );

    const tableProps = tableMock.mock.calls[0][0];
    expect(tableProps.loading).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "ir para pagina 2" }));
    expect(onPageChange).toHaveBeenCalledWith(2, 10);
  });

  it("não quebra a paginação quando onPageChange não é informado", () => {
    render(<ListagemDeTextosDePortarias data={[criarTextoPortaria()]} total={5} page={1} />);

    expect(() => {
      fireEvent.click(screen.getByRole("button", { name: "ir para pagina 2" }));
    }).not.toThrow();
  });

  it("renderiza status usando badge e marca linhas inativas", () => {
    const textoPortaria = criarTextoPortaria();
    render(<ListagemDeTextosDePortarias data={[textoPortaria]} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    const columns = obterColunas(tableProps);
    const renderStatus = columns[2]?.render;

    render(<>{renderStatus?.(StatusCargosBase.ATIVO, textoPortaria, 0)}</>);

    expect(screen.getByTestId("10_status")).toHaveTextContent(StatusCargosBase.ATIVO);
    expect(badgeStatusMock).toHaveBeenCalledWith(StatusCargosBase.ATIVO, "10_status");
    expect(obterRowClassName(tableProps)(criarTextoPortaria({ status: StatusCargosBase.INATIVO }), 0, 0)).toBe(
      "disabled-row",
    );
    expect(obterRowClassName(tableProps)(textoPortaria, 0, 0)).toBe("");
  });

  it("renderiza badge inativo com o id do registro", () => {
    const textoInativo = criarTextoPortaria({
      id: 22,
      status: StatusCargosBase.INATIVO,
      nome_modelo: "Modelo inativo",
    });
    render(<ListagemDeTextosDePortarias data={[textoInativo]} total={1} page={1} />);

    const columns = obterColunas(tableMock.mock.calls[0][0]);
    render(<>{columns[2]?.render?.(StatusCargosBase.INATIVO, textoInativo, 0)}</>);

    expect(screen.getByTestId("22_status")).toHaveTextContent(StatusCargosBase.INATIVO);
    expect(badgeStatusMock).toHaveBeenCalledWith(StatusCargosBase.INATIVO, "22_status");
  });

  it("não aplica classe de linha desabilitada para status extinto", () => {
    const textoExtinto = criarTextoPortaria({ status: StatusCargosBase.EXTINTO });
    render(<ListagemDeTextosDePortarias data={[textoExtinto]} total={1} page={1} />);

    const tableProps = tableMock.mock.calls[0][0];
    expect(obterRowClassName(tableProps)(textoExtinto, 0, 0)).toBe("");
  });

  it("formata as colunas de data e hora", () => {
    const textoPortaria = criarTextoPortaria();
    render(<ListagemDeTextosDePortarias data={[textoPortaria]} total={1} page={1} />);

    const columns = obterColunas(tableMock.mock.calls[0][0]);

    expect(columns[3]?.render?.(textoPortaria.criado_em, textoPortaria, 0)).toBe("11/06/2026 08:05");
    expect(columns[4]?.render?.(textoPortaria.atualizado_em, textoPortaria, 0)).toBe("11/06/2026 10:00");
  });

  it("exibe hífen quando as datas de criação ou atualização estão vazias", () => {
    const textoSemData = criarTextoPortaria({ criado_em: "", atualizado_em: "" });
    render(<ListagemDeTextosDePortarias data={[textoSemData]} total={1} page={1} />);

    const columns = obterColunas(tableMock.mock.calls[0][0]);

    expect(columns[3]?.render?.(null, textoSemData, 0)).toBe("-");
    expect(columns[4]?.render?.(undefined, textoSemData, 0)).toBe("-");
  });

  it("configura títulos, chaves e larguras das colunas", () => {
    render(<ListagemDeTextosDePortarias data={[criarTextoPortaria()]} total={1} page={1} />);

    const columns = obterColunas(tableMock.mock.calls[0][0]);

    expect(columns.map((coluna) => coluna.title)).toEqual([
      "Tipo de portaria",
      "Nome do modelo",
      "Status",
      "Criado em",
      "Atualizado em",
    ]);
    expect(columns.map((coluna) => coluna.dataIndex)).toEqual([
      "tipo_de_ato",
      "nome_modelo",
      "status",
      "criado_em",
      "atualizado_em",
    ]);
    expect(columns.map((coluna) => coluna.key)).toEqual([
      "tipo_de_ato",
      "nome_modelo",
      "status",
      "criado_em",
      "atualizado_em",
    ]);
    expect(columns.map((coluna) => coluna.width)).toEqual(["27%", "27%", "100px", "150px", "150px"]);
  });

  it("navega para a edição do texto ao clicar na linha", () => {
    const textoPortaria = criarTextoPortaria({ id: 42, nome_modelo: "Modelo 42" });
    render(<ListagemDeTextosDePortarias data={[textoPortaria]} total={1} page={1} />);

    fireEvent.click(screen.getByTestId("linha-42"));

    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/criar-textos-de-portaria?id=42");
  });

  it("renderiza lista vazia sem linhas clicáveis", () => {
    render(<ListagemDeTextosDePortarias data={[]} total={0} page={1} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.queryByTestId("linha-10")).not.toBeInTheDocument();
    expect(screen.getByTestId("mostrar-registros")).toHaveTextContent("1-0");
    expect(tableMock.mock.calls[0][0].dataSource).toEqual([]);
  });

  it("gera a chave da linha a partir do id numérico", () => {
    const outroTexto = criarTextoPortaria({ id: 99 });
    render(<ListagemDeTextosDePortarias data={[outroTexto]} total={1} page={1} />);

    expect(obterRowKey(tableMock.mock.calls[0][0])(outroTexto, 0)).toBe("99");
  });

  it("aceita titulo e subtitulo sem alterar o cabeçalho padrão", () => {
    render(
      <ListagemDeTextosDePortarias
        data={[criarTextoPortaria()]}
        total={1}
        page={1}
        titulo="Título customizado"
        subtitulo="Subtítulo customizado"
      />,
    );

    expect(screen.getByText("Lista de textos de portarias")).toBeInTheDocument();
    expect(screen.queryByText("Título customizado")).not.toBeInTheDocument();
    expect(screen.queryByText("Subtítulo customizado")).not.toBeInTheDocument();
  });
});
