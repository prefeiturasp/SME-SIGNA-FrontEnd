import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BaixarLaudaPage from "./page";
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";
import type { ListagemPortariasResponse } from "@/types/designacao";

const {
  usePortariasDOMock,
  handleClearMock,
  onSubmitFilterFormMock,
  handleSubmitMock,
  baixarLaudaMock,
  setSalvandoMock,
  notificationErrorMock,
} = vi.hoisted(() => ({
  usePortariasDOMock: vi.fn(),
  handleClearMock: vi.fn(),
  onSubmitFilterFormMock: vi.fn(),
  handleSubmitMock: vi.fn(),
  baixarLaudaMock: vi.fn(),
  setSalvandoMock: vi.fn(),
  notificationErrorMock: vi.fn(),
}));

const selectedRowsMock: ListagemPortariasResponse[] = [
  {
    id: 1,
    numero_portaria: 100,
    doc: "2026-01-10",
    tipo_de_ato: "DESIGNACAO_CESSACAO",
    nome: "Servidor A",
    cargo: "Diretor",
    data_designacao: "2026-02-05",
    data_cessacao: null,
    sei_numero: "SEI-1",
  },
];

vi.mock("../../../hooks/usePortariasDO", () => ({
  usePortariasDO: () => usePortariasDOMock(),
}));

vi.mock("@/utils/export/baixarLauda", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/export/baixarLauda")>()),
  baixarLauda: (...args: unknown[]) => baixarLaudaMock(...args),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    error: notificationErrorMock,
  }),
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
  default: ({ onClear, exibirFiltroDre }: { onClear?: () => void; exibirFiltroDre?: boolean }) => (
    <div>
      <span data-testid="filtro-exibir-dre">{String(exibirFiltroDre)}</span>
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
    exibirColunaDre,
  }: {
    onClickBaixarLauda?: (rows: typeof selectedRowsMock, tipoArquivo: string) => void;
    data: ListagemPortariasResponse[];
    value: number;
    isLoading: boolean;
    isListagemDo: boolean;
    data_considerada_portaria: Date;
    data_publicacao: Date;
    isDisabled?: boolean;
    exibirColunaDre?: boolean;
  }) => (
    <div>
      <span data-testid="listagem-exibir-coluna-dre">{String(exibirColunaDre)}</span>
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
        data-testid="baixar-csv"
        onClick={() => onClickBaixarLauda?.(selectedRowsMock, "CSV")}
      >
        Baixar CSV
      </button>
      <button
        data-testid="baixar-xlsx"
        onClick={() => onClickBaixarLauda?.(selectedRowsMock, "XLSX")}
      >
        Baixar XLSX
      </button>
      <button
        data-testid="baixar-pdf"
        onClick={() => onClickBaixarLauda?.(selectedRowsMock, "PDF")}
      >
        Baixar PDF
      </button>
      <button
        data-testid="baixar-word"
        onClick={() => onClickBaixarLauda?.(selectedRowsMock, "WORD")}
      >
        Baixar Word
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
      setSalvando: setSalvandoMock,
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
    expect(screen.getByTestId("filtro-exibir-dre")).toHaveTextContent("true");
    expect(screen.getByTestId("listagem-exibir-coluna-dre")).toHaveTextContent("true");
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

  it("abre o modal de ordenação ao escolher PDF, sem baixar ainda", () => {
    render(<BaixarLaudaPage />);
    expect(screen.queryByText("Como deseja ordenar a lauda?")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("baixar-pdf"));

    expect(screen.getByText("Como deseja ordenar a lauda?")).toBeInTheDocument();
    expect(screen.getByTestId("botao-confirmar-ordenacao-lauda")).toBeDisabled();
    expect(baixarLaudaMock).not.toHaveBeenCalled();
    expect(setSalvandoMock).not.toHaveBeenCalled();
  });

  it("baixa CSV pelo backend depois de escolher a ordenação", async () => {
    baixarLaudaMock.mockResolvedValueOnce({ success: true });

    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("baixar-csv"));

    expect(screen.getByText("Como deseja ordenar a lauda?")).toBeInTheDocument();
    expect(baixarLaudaMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("ordenacao-lauda-TITULO"));
    fireEvent.click(screen.getByTestId("botao-confirmar-ordenacao-lauda"));

    await waitFor(() => expect(setSalvandoMock).toHaveBeenLastCalledWith(false));

    expect(baixarLaudaMock).toHaveBeenCalledWith([1], "CSV", "TITULO");
    expect(setSalvandoMock).toHaveBeenNthCalledWith(1, true);
    expect(notificationErrorMock).not.toHaveBeenCalled();
  });

  it("ignora tipo de arquivo desconhecido", () => {
    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("baixar-xlsx"));

    expect(screen.queryByText("Como deseja ordenar a lauda?")).not.toBeInTheDocument();
    expect(baixarLaudaMock).not.toHaveBeenCalled();
  });

  it("baixa PDF com os ids e a ordenação escolhida e controla o estado de carregamento", async () => {
    baixarLaudaMock.mockResolvedValueOnce({ success: true });

    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("baixar-pdf"));
    fireEvent.click(screen.getByTestId("ordenacao-lauda-NUMERO_PORTARIA"));
    fireEvent.click(screen.getByTestId("botao-confirmar-ordenacao-lauda"));

    await waitFor(() => expect(setSalvandoMock).toHaveBeenLastCalledWith(false));

    expect(baixarLaudaMock).toHaveBeenCalledWith([1], "PDF", "NUMERO_PORTARIA");
    expect(setSalvandoMock).toHaveBeenNthCalledWith(1, true);
    expect(setSalvandoMock).toHaveBeenNthCalledWith(2, false);
    expect(notificationErrorMock).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByText("Como deseja ordenar a lauda?")).not.toBeInTheDocument()
    );
  });

  it("baixa Word com os ids e a ordenação escolhida", async () => {
    baixarLaudaMock.mockResolvedValueOnce({ success: true });

    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("baixar-word"));
    fireEvent.click(screen.getByTestId("ordenacao-lauda-DRE"));
    fireEvent.click(screen.getByTestId("botao-confirmar-ordenacao-lauda"));

    await waitFor(() => expect(setSalvandoMock).toHaveBeenLastCalledWith(false));

    expect(baixarLaudaMock).toHaveBeenCalledWith([1], "WORD", "DRE");
    expect(notificationErrorMock).not.toHaveBeenCalled();
  });

  it("fecha o modal sem baixar ao cancelar", async () => {
    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("baixar-pdf"));
    fireEvent.click(screen.getByTestId("ordenacao-lauda-TITULO"));
    fireEvent.click(screen.getByTestId("botao-cancelar-ordenacao-lauda"));

    await waitFor(() =>
      expect(screen.queryByText("Como deseja ordenar a lauda?")).not.toBeInTheDocument()
    );
    expect(baixarLaudaMock).not.toHaveBeenCalled();
    expect(setSalvandoMock).not.toHaveBeenCalled();
  });

  it("exibe notificação de erro quando o download do PDF falha", async () => {
    baixarLaudaMock.mockResolvedValueOnce({ success: false, error: "Atos já publicados: 1" });

    render(<BaixarLaudaPage />);
    fireEvent.click(screen.getByTestId("baixar-pdf"));
    fireEvent.click(screen.getByTestId("ordenacao-lauda-TITULO"));
    fireEvent.click(screen.getByTestId("botao-confirmar-ordenacao-lauda"));

    await waitFor(() =>
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Erro ao baixar lauda",
        description: "Atos já publicados: 1",
      })
    );
    expect(baixarLaudaMock).toHaveBeenCalledWith([1], "PDF", "TITULO");
    expect(setSalvandoMock).toHaveBeenLastCalledWith(false);
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
      setSalvando: setSalvandoMock,
    });

    render(<BaixarLaudaPage />);

    expect(screen.getByTestId("listagem-data-size")).toHaveTextContent("0");
    expect(screen.getByTestId("listagem-loading")).toHaveTextContent("true");
    expect(screen.getByTestId("is-disabled-listagem")).toHaveTextContent("false");
  });
});
