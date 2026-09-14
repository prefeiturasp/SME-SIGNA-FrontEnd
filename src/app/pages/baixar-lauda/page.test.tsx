import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BaixarLaudaPage from "./page";
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";
import type { ListagemPortariasResponse } from "@/types/designacao";

const {
  usePortariasDOMock,
  handleClearMock,
  onSubmitFilterFormMock,
  handleSubmitMock,
} = vi.hoisted(() => ({
  usePortariasDOMock: vi.fn(),
  handleClearMock: vi.fn(),
  onSubmitFilterFormMock: vi.fn(),
  handleSubmitMock: vi.fn(),
}));

const selectedRowsMock: ListagemPortariasResponse[] = [
  {
    id: 1,
    numero_portaria: "100",
    doc: "DOC",
    tipo_de_ato: "DESIGNACAO_CESSACAO",
    nome: "Servidor A",
    cargo: "Diretor",
    data_designacao: null,
    data_cessacao: null,
    sei_numero: "SEI-1",
  },
];

vi.mock("../../../hooks/usePortariasDO", () => ({
  usePortariasDO: () => usePortariasDOMock(),
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock("@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo", () => ({
  __esModule: true,
  default: ({ onClear }: { onClear?: () => void }) => (
    <div>
      <button type="button" data-testid="clear-filters" onClick={onClear}>
        Limpar
      </button>
      <button data-testid="submit-filters" type="submit">
        Pesquisar
      </button>
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo", () => ({
  __esModule: true,
  default: ({
    onClickBaixarLauda,
    data,
    value,
    isLoading,
    isListagemDo,
    data_considerada_portaria,
    data_publicacao,
    isDisabled,
  }: {
    onClickBaixarLauda?: (rows: typeof selectedRowsMock, tipoArquivo: string) => void;
    data: ListagemPortariasResponse[];
    value: number;
    isLoading: boolean;
    isListagemDo: boolean;
    data_considerada_portaria: Date;
    data_publicacao: Date;
    isDisabled?: boolean;
  }) => (
    <div>
      <span data-testid="listagem-data-size">{data.length}</span>
      <span data-testid="listagem-value">{String(value)}</span>
      <span data-testid="listagem-loading">{String(isLoading)}</span>
      <span data-testid="listagem-is-listagem-do">{String(isListagemDo)}</span>
      <span data-testid="listagem-data-considerada">
        {data_considerada_portaria.toISOString().slice(0, 10)}
      </span>
      <span data-testid="listagem-data-publicacao">{data_publicacao.toISOString().slice(0, 10)}</span>
      <span data-testid="is-disabled-listagem">{String(isDisabled)}</span>
      <button
        data-testid="submit-main-action"
        onClick={() => onClickBaixarLauda?.(selectedRowsMock, "PDF")}
      >
        Baixar
      </button>
    </div>
  ),
}));

describe("BaixarLauda page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleSubmitMock.mockImplementation(
      (fn: (values: { ano: string; numero_sei: string }) => void) => (event?: Event) => {
        event?.preventDefault?.();
        fn({ ano: "2026", numero_sei: "" });
      },
    );

    usePortariasDOMock.mockReturnValue({
      handleClear: handleClearMock,
      isPending: false,
      tabelaKey: 7,
      resultado: selectedRowsMock,
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      salvando: true,
    });
  });

  it("renderiza página e repassa props esperadas para a listagem", () => {
    render(<BaixarLaudaPage />);

    expect(screen.getByRole("heading", { name: "Baixar lauda" })).toBeInTheDocument();
    expect(screen.getByTestId("listagem-data-size")).toHaveTextContent("1");
    expect(screen.getByTestId("listagem-value")).toHaveTextContent(
      String(PORTARIAS_SEM_DATA_DE_PUBLICACAO),
    );
    expect(screen.getByTestId("listagem-loading")).toHaveTextContent("false");
    expect(screen.getByTestId("listagem-is-listagem-do")).toHaveTextContent("false");
    expect(screen.getByTestId("is-disabled-listagem")).toHaveTextContent("true");
  });

  it("executa handleClear ao clicar em limpar filtros", () => {
    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("clear-filters"));
    expect(handleClearMock).toHaveBeenCalledTimes(1);
  });

  it("submete filtros via handleSubmit do react-hook-form", () => {
    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("submit-filters"));
    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitFilterFormMock);
    expect(onSubmitFilterFormMock).toHaveBeenCalledWith({ ano: "2026", numero_sei: "" });
  });

  it("aciona callback de baixar lauda com as linhas selecionadas", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("submit-main-action"));
    expect(consoleLogSpy).toHaveBeenCalledWith("selectedRows", selectedRowsMock, "PDF");
  });

  it("envia array vazio para listagem quando resultado for nulo", () => {
    usePortariasDOMock.mockReturnValueOnce({
      handleClear: handleClearMock,
      isPending: true,
      tabelaKey: 1,
      resultado: null,
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      salvando: false,
    });

    render(<BaixarLaudaPage />);

    expect(screen.getByTestId("listagem-data-size")).toHaveTextContent("0");
    expect(screen.getByTestId("listagem-loading")).toHaveTextContent("true");
    expect(screen.getByTestId("is-disabled-listagem")).toHaveTextContent("false");
  });
});
