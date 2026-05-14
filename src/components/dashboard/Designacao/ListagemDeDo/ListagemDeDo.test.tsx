import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TableProps } from "antd";
import ListagemDeDo, { TagStatusDesignacao } from "./ListagemDeDo";
import { ListagemPortariasResponse, StatusDesignacao } from "@/types/designacao";
import {
  PORTARIAS_SEM_DATA_DE_PUBLICACAO,
  PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA,
} from "../MainDOForm/MainDOForm";

const tableMock = vi.fn<(props: TableProps<ListagemPortariasResponse>) => ReactNode>();

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    "data-testid": dataTestId,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    "data-testid"?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid={dataTestId}>
      {children}
    </button>
  ),
}));

vi.mock("@/assets/icons/SimpleCheck", () => ({
  default: () => <span data-testid="simple-check-icon" />,
}));

vi.mock("@ant-design/icons", () => ({
  CheckOutlined: () => <span data-testid="check-outlined" />,
}));

vi.mock("@/assets/icons/Check", () => ({
  default: () => <span data-testid="check-icon" />,
}));

vi.mock("@/assets/icons/CloseCheck", () => ({
  default: () => <span data-testid="close-check-icon" />,
}));

vi.mock("antd", () => ({
  Table: (props: TableProps<ListagemPortariasResponse>) => {
    tableMock(props);
    return (
      <div>
        <button
          type="button"
          data-testid="select-first-row"
          onClick={() => props.rowSelection?.onChange?.([], [rows[0]])}
        >
          select-first-row
        </button>
        <button
          type="button"
          data-testid="select-all-rows"
          onClick={() => props.rowSelection?.onChange?.([], rows)}
        >
          select-all-rows
        </button>
        <button
          type="button"
          data-testid="select-cessacao-match-row"
          onClick={() => props.rowSelection?.onChange?.([], [rowWithCessacaoMatch])}
        >
          select-cessacao-match-row
        </button>
      </div>
    );
  },
  Tag: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

const rows: ListagemPortariasResponse[] = [
  {
    id: 1,
    portaria_designacao: "100",
    doc: "DOC",
    tipo_ato: "DESIGNACAO_CESSACAO",
    titular_nome_servidor: "Servidor A",
    cargo_vaga_display: "Diretor",
    do: "DO",
    data_designacao: "",
    data_cessacao: "",
    sei_numero: "SEI-1",
  },
  {
    id: 2,
    portaria_designacao: "101",
    doc: "DOC",
    tipo_ato: "DESIGNACAO_CESSACAO",
    titular_nome_servidor: "Servidor B",
    cargo_vaga_display: "Coordenador",
    do: "DO",
    data_designacao: "2026-05-10",
    data_cessacao: "2026-05-10",
    sei_numero: "SEI-2",
  },
];

const rowWithCessacaoMatch: ListagemPortariasResponse = {
  id: 3,
  portaria_designacao: "102",
  doc: "DOC",
  tipo_ato: "DESIGNACAO_CESSACAO",
  titular_nome_servidor: "Servidor C",
  cargo_vaga_display: "Coordenador",
  do: "DO",
  data_designacao: "2026-04-01",
  data_cessacao: "2026-05-10",
  sei_numero: "SEI-3",
};


describe("ListagemDeDo", () => {
  beforeEach(() => {
    tableMock.mockClear();
  });

  it("renderiza lista e mantém botão desabilitado sem seleção", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
        data_publicacao={new Date("2026-05-20")}
      />
    );

    expect(screen.getByText("Lista de portarias")).toBeInTheDocument();
    expect(screen.getByText("Portarias selecionadas:")).toBeInTheDocument();
    expect(screen.getByText("Das portarias selecionadas, serão atualizadas:")).toBeInTheDocument();
    expect(screen.getByTestId("botao-proximo")).toBeDisabled();
  });

  it("habilita botão e chama callback com linhas filtradas para opção 1", () => {
    const onClickButton = vi.fn();

    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
        data_publicacao={new Date("2026-05-20")}
        onClickButton={onClickButton}
      />
    );

    fireEvent.click(screen.getByTestId("select-all-rows"));

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByTestId("botao-proximo")).toBeEnabled();

    fireEvent.click(screen.getByTestId("botao-proximo"));

    expect(onClickButton).toHaveBeenCalledWith([rows[0]]);
  });

  it("filtra por data específica na opção 2", () => {
    const onClickButton = vi.fn();
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA}
        data={rows}
        data_publicacao={new Date("2026-05-20")}
        data_considerada_portaria={new Date(2026, 4, 10)}
        onClickButton={onClickButton}
      />
    );

    fireEvent.click(screen.getByTestId("select-all-rows"));
    expect(screen.getAllByText("2")).toHaveLength(2);

    fireEvent.click(screen.getByTestId("botao-proximo"));
    expect(onClickButton).toHaveBeenCalledWith(rows);
  });

  it("desabilita botão quando opção 2 está sem data considerada", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA}
        data={rows}
        data_publicacao={new Date("2026-05-20")}
      />
    );

    fireEvent.click(screen.getByTestId("select-first-row"));
    expect(screen.getByTestId("botao-proximo")).toBeDisabled();
  });

  it("desabilita botão quando data_publicacao está ausente", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
      />
    );

    fireEvent.click(screen.getByTestId("select-first-row"));
    expect(screen.getByTestId("botao-proximo")).toBeDisabled();
  });

  it("desabilita botão quando isDisabled=true mesmo com linhas qualificadas", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
        data_publicacao={new Date("2026-05-20")}
        isDisabled={true}
      />
    );

    fireEvent.click(screen.getByTestId("select-all-rows"));
    expect(screen.getByTestId("botao-proximo")).toBeDisabled();
  });

  it("exibe o texto do labelButton customizado", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
        labelButton="Salvar portarias"
      />
    );

    expect(screen.getByText("Salvar portarias")).toBeInTheDocument();
  });

  it("mantém botão desabilitado para value não mapeado mesmo com linhas selecionadas", () => {
    render(
      <ListagemDeDo
        value={99}
        data={rows}
        data_publicacao={new Date("2026-05-20")}
      />
    );

    fireEvent.click(screen.getByTestId("select-all-rows"));
    expect(screen.getByTestId("botao-proximo")).toBeDisabled();
  });

  it("render da coluna data_designacao retorna '-' para string vazia", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
      />
    );

    const props = tableMock.mock.calls[0][0];
    const col = props.columns?.find((c: { key?: string }) => c.key === "data_designacao") as
      | { render?: (text: string) => string }
      | undefined;

    expect(col?.render?.("")).toBe("-");
  });

  it("render da coluna data_designacao formata data ISO corretamente", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
      />
    );

    const props = tableMock.mock.calls[0][0];
    const col = props.columns?.find((c: { key?: string }) => c.key === "data_designacao") as
      | { render?: (text: string) => string }
      | undefined;

    expect(col?.render?.("2026-05-10")).toBe("10/05/2026");
  });

  it("render da coluna data_cessacao retorna '-' para string vazia", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
      />
    );

    const props = tableMock.mock.calls[0][0];
    const col = props.columns?.find((c: { key?: string }) => c.key === "data_cessacao") as
      | { render?: (text: string) => string }
      | undefined;

    expect(col?.render?.("")).toBe("-");
  });

  it("render da coluna data_cessacao formata data ISO corretamente", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
      />
    );

    const props = tableMock.mock.calls[0][0];
    const col = props.columns?.find((c: { key?: string }) => c.key === "data_cessacao") as
      | { render?: (text: string) => string }
      | undefined;

    expect(col?.render?.("2026-03-25")).toBe("25/03/2026");
  });

  it("inclui linha cujo data_cessacao corresponde à data considerada (branch direito do ||)", () => {
    const onClickButton = vi.fn();
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA}
        data={[rowWithCessacaoMatch]}
        data_publicacao={new Date("2026-05-20")}
        data_considerada_portaria={new Date(2026, 4, 10)}
        onClickButton={onClickButton}
      />
    );

    fireEvent.click(screen.getByTestId("select-cessacao-match-row"));
    expect(screen.getByTestId("botao-proximo")).toBeEnabled();
    fireEvent.click(screen.getByTestId("botao-proximo"));
    expect(onClickButton).toHaveBeenCalledWith([rowWithCessacaoMatch]);
  });

  it("chama o onClickButton padrão (sem prop) sem erros", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
        data_publicacao={new Date("2026-05-20")}
      />
    );

    fireEvent.click(screen.getByTestId("select-all-rows"));
    expect(screen.getByTestId("botao-proximo")).toBeEnabled();
    expect(() => fireEvent.click(screen.getByTestId("botao-proximo"))).not.toThrow();
  });

  it("rowKey retorna o id do registro como string", () => {
    render(
      <ListagemDeDo
        value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}
        data={rows}
      />
    );

    const props = tableMock.mock.calls[0][0];
    const rowKey = props.rowKey as ((record: ListagemPortariasResponse) => string) | undefined;

    expect(rowKey?.(rows[0])).toBe("1");
    expect(rowKey?.(rows[1])).toBe("2");
  });
});
