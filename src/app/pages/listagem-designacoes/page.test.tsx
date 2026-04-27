import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DesignacoesPasso1 from "./page";

const fetchDesignacoesActionMock = vi.fn();
const fetchDesignacoesSemPaginacaoActionMock = vi.fn();
const pushMock = vi.fn();
const toastMock = vi.fn();
const exportResultHandlerMock = vi.fn();

vi.mock("@/actions/designacao", () => ({
  fetchDesignacoesAction: (...args: unknown[]) => fetchDesignacoesActionMock(...args),
  fetchDesignacoesSemPaginacaoAction: (...args: unknown[]) =>
    fetchDesignacoesSemPaginacaoActionMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/components/ui/headless-toast", () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}));

vi.mock("@/hooks/useUnidades", () => ({
  useFetchDREs: () => ({
    data: [{ codigoDRE: "108100", nomeDRE: "DRE TESTE" }],
  }),
  useFetchUEs: () => ({
    data: [{ codigoEscola: "0001", nomeEscola: "EMEF TESTE" }],
  }),
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="quadro-branco">{children}</section>
  ),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({
    createButton,
    icon,
  }: {
    createButton?: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <header>
      {icon}
      {createButton}
    </header>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
  }) => (
    <button type={type ?? "button"} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/assets/icons/Designacao", () => ({
  default: () => <span data-testid="designacao-icon" />,
}));

vi.mock("@/assets/icons/Alert", () => ({
  default: () => <span data-testid="alert-icon" />,
}));

vi.mock("@/components/dashboard/Designacao/FiltroDeDesignacoes/FiltroDeDesignacoes", () => ({
  default: ({ onClear }: { onClear: () => void }) => (
    <div>
      <button onClick={onClear}>Limpar filtros</button>
      <button type="submit">Buscar</button>
    </div>
  ),
}));

vi.mock(
  "@/components/dashboard/Designacao/ListagemDeDesignacoes/ListagemDeDesignacoes",
  () => ({
    default: ({
      data,
      total,
      page,
      isLoading,
      onPageChange,
      generateExportData,
    }: {
      data: unknown[];
      total: number;
      page: number;
      isLoading: boolean;
      onPageChange: (newPage: number) => void;
      generateExportData: () => Promise<unknown[]>;
    }) => (
      <div>
        <span data-testid="list-data-length">{data.length}</span>
        <span data-testid="list-total">{total}</span>
        <span data-testid="list-page">{page}</span>
        <span data-testid="list-loading">{String(isLoading)}</span>
        <button onClick={() => onPageChange(2)}>Ir para página 2</button>
        <button
          onClick={async () => {
            const result = await generateExportData();
            exportResultHandlerMock(result);
          }}
        >
          Exportar dados
        </button>
      </div>
    ),
  })
);

describe("Página de listagem de designações", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchDesignacoesActionMock.mockResolvedValue({
      success: true,
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            dre_nome: "DRE TESTE",
            unidade_proponente: "EMEF TESTE",
            indicado_nome_servidor: "Servidor",
            indicado_rf: "123456",
            titular_nome_servidor: "Titular",
            titular_rf: "654321",
            numero_portaria: "12",
            ano_vigente: "2026",
            sei_numero: "SEI-1",
            data_inicio: "2026-01-01",
            data_fim: null,
            tipo_vaga: "vago",
            tipo_vaga_display: "Vago",
            cargo_vaga: null,
            cargo_vaga_display: "Diretor",
            status: 0,
          },
        ],
      },
    });
    fetchDesignacoesSemPaginacaoActionMock.mockResolvedValue({
      success: true,
      data: [{ id: 1 }],
    });
  });

  it("carrega a listagem inicial com os filtros padrão", async () => {
    render(<DesignacoesPasso1 />);

    await waitFor(() => {
      expect(fetchDesignacoesActionMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchDesignacoesActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rf: "",
        nome: "",
        cargo_base: "",
        cargo_sobreposto: "",
        dre: "",
        unidade: "",
        ano: "",
        page: 1,
        page_size: 10,
      })
    );

    expect(screen.getByTestId("list-data-length")).toHaveTextContent("1");
    expect(screen.getByTestId("list-total")).toHaveTextContent("1");
    expect(screen.getByTestId("list-page")).toHaveTextContent("1");
  });

  it("executa paginação e limpeza de filtros", async () => {
    render(<DesignacoesPasso1 />);

    await waitFor(() => {
      expect(fetchDesignacoesActionMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText("Ir para página 2"));

    await waitFor(() => {
      expect(fetchDesignacoesActionMock).toHaveBeenCalledTimes(2);
    });
    expect(fetchDesignacoesActionMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 2,
        page_size: 10,
      })
    );

    fireEvent.click(screen.getByText("Limpar filtros"));
    await waitFor(() => {
      expect(fetchDesignacoesActionMock).toHaveBeenCalledTimes(3);
    });
    expect(fetchDesignacoesActionMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rf: "",
        nome: "",
        cargo_base: "",
        cargo_sobreposto: "",
        dre: "",
        unidade: "",
        ano: "",
        page: 1,
        page_size: 10,
      })
    );
  });

  it("exporta sem paginação e retorna os dados para o componente filho", async () => {
    render(<DesignacoesPasso1 />);

    await waitFor(() => {
      expect(fetchDesignacoesActionMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText("Exportar dados"));

    await waitFor(() => {
      expect(fetchDesignacoesSemPaginacaoActionMock).toHaveBeenCalledTimes(1);
    });
    expect(fetchDesignacoesSemPaginacaoActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        no_pagination: true,
      })
    );
    expect(exportResultHandlerMock).toHaveBeenCalledWith([{ id: 1 }]);
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("mostra toast de erro ao falhar exportação e navega ao iniciar nova designação", async () => {
    fetchDesignacoesSemPaginacaoActionMock.mockResolvedValueOnce({
      success: false,
      error: "Erro no CSV",
    });
    render(<DesignacoesPasso1 />);

    await waitFor(() => {
      expect(fetchDesignacoesActionMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText("Exportar dados"));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        variant: "error",
        title: "Erro ao gerar o arquivo CSV.",
        description: "Erro no CSV",
      });
    });
    expect(exportResultHandlerMock).toHaveBeenCalledWith([]);

    fireEvent.click(screen.getByText("Iniciar Nova Designação"));
    expect(pushMock).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-1");
  });
});