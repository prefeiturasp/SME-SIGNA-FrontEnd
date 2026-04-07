import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DesignacoesPasso2Page from "./page";

interface MockState {
  formDesignacaoData: {
    servidorIndicado?: {
      nome_servidor: string;
      rf: string;
      lotacao_cargo_sobreposto: string;
      dre: string;
    };
  } | null;
}

class ResizeObserverMock {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

const mockRouterPush = vi.fn();

const h = vi.hoisted(() => ({
  state: { formDesignacaoData: null } as MockState,
  mutateAsync: vi.fn(),
  setFormDesignacaoData: vi.fn(),
}));

// ✅ React Query wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// ✅ helper
const renderWithQuery = (ui: React.ReactNode) =>
  render(ui, { wrapper: createWrapper() });

// ---------------- MOCKS ----------------

vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: h.state.formDesignacaoData,
    setFormDesignacaoData: h.setFormDesignacaoData,
  }),
}));

vi.mock("@/hooks/useServidorDesignacao", () => ({
  default: () => ({
    mutateAsync: h.mutateAsync,
    isPending: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    Card: ({ children, title }: any) => (
      <div data-testid="card">
        <div data-testid="card-title">{title}</div>
        {children}
      </div>
    ),
  };
});

// ✅ Accordion completo (corrige erro anterior)
vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: any) => (
    <div data-testid="accordion">{children}</div>
  ),
  AccordionItem: ({ children }: any) => (
    <div data-testid="accordion-item">{children}</div>
  ),
  AccordionTrigger: ({ children }: any) => (
    <button data-testid="accordion-trigger">{children}</button>
  ),
  AccordionContent: ({ children }: any) => (
    <div data-testid="accordion-content">{children}</div>
  ),
}));

vi.mock(
  "@/components/dashboard/Designacao/SelecaoServidorIndicado/SelecaoServidorIndicado",
  () => ({
    default: ({ onBuscaTitular }: any) => (
      <div data-testid="selecao-vaga">
        <button onClick={() => onBuscaTitular({ rf: "1234567" })}>
          Simular Busca
        </button>
      </div>
    ),
  })
);

vi.mock(
  "@/components/dashboard/Designacao/BotoesDeNavegacao",
  () => ({
    default: ({ onAnterior, onProximo, disableProximo }: any) => (
      <div>
        <button data-testid="botao-anterior" onClick={onAnterior}>
          Anterior
        </button>
        <button
          data-testid="botao-proximo"
          onClick={onProximo}
          disabled={disableProximo}
        >
          Próximo
        </button>
      </div>
    ),
  })
);

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    default: ({ defaultValues }: any) => (
      <div data-testid="resumo-designacao">
        {defaultValues?.nome_servidor}
      </div>
    ),
  })
);

vi.mock("@/assets/icons/Designacao", () => ({ default: () => <svg /> }));
vi.mock("@/assets/icons/Historico", () => ({ default: () => <svg /> }));

vi.mock(
  "@/components/dashboard/Designacao/ModalHistoricoUltimaDesignacao/ModalHistoricoUltimaDesignacao",
  () => ({
    default: ({ open }: { open: boolean }) => (
      <div data-testid="modal-historico" data-open={String(open)} />
    ),
  })
);

// ---------------- TESTES ----------------

describe("DesignacoesPasso2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.state.formDesignacaoData = null;
  });

  it("renderiza sem accordion quando não há servidor", () => {
    renderWithQuery(<DesignacoesPasso2Page />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("selecao-vaga")).toBeInTheDocument();
  });

  it("renderiza accordion quando há servidor", () => {
    h.state.formDesignacaoData = {
      servidorIndicado: {
        nome_servidor: "Fulano",
        rf: "123",
        lotacao_cargo_sobreposto: "Escola X",
        dre: "DRE 1",
      },
    };

    renderWithQuery(<DesignacoesPasso2Page />);

    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByText("Fulano")).toBeInTheDocument();
  });

  it("chama busca de titular com sucesso", async () => {
    h.mutateAsync.mockResolvedValue({
      success: true,
      data: { nome_servidor: "Novo Titular", rf: "1234567" },
    });

    renderWithQuery(<DesignacoesPasso2Page />);

    fireEvent.click(screen.getByText("Simular Busca"));

    await waitFor(() => {
      expect(h.mutateAsync).toHaveBeenCalledWith({ rf: "1234567" });
    });
  });

  it("trata erro na busca de titular", async () => {
    h.mutateAsync.mockResolvedValue({
      success: false,
      error: "Erro na busca",
    });

    renderWithQuery(<DesignacoesPasso2Page />);

    fireEvent.click(screen.getByText("Simular Busca"));

    await waitFor(() => {
      expect(h.mutateAsync).toHaveBeenCalled();
    });
  });

  it("botão próximo inicia desabilitado", () => {
    renderWithQuery(<DesignacoesPasso2Page />);

    expect(screen.getByTestId("botao-proximo")).toBeDisabled();
  });

  it("navega para passo anterior", async () => {
    renderWithQuery(<DesignacoesPasso2Page />);

    fireEvent.click(screen.getByTestId("botao-anterior"));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        "/pages/designacoes/designacoes-passo-1"
      );
    });
  });

  it("abre modal de histórico", async () => {
    renderWithQuery(<DesignacoesPasso2Page />);

    const modal = screen.getByTestId("modal-historico");
    expect(modal).toHaveAttribute("data-open", "false");

    fireEvent.click(
      screen.getByRole("button", {
        name: /ver histórico da última designação/i,
      })
    );

    await waitFor(() => {
      expect(modal).toHaveAttribute("data-open", "true");
    });
  });
});