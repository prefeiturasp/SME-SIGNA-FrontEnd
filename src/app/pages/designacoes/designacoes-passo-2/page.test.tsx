import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DesignacoesPasso2Page from "./page";

interface MockState {
  formDesignacaoData: {
    servidorIndicado: {
      nome: string;
      rf: string;
      lotacao_cargo_sobreposto: string;
      dre: string;
    };
  } | null;
}
const mockRouterPush = vi.fn();

const h = vi.hoisted(() => ({
  state: { formDesignacaoData: null } as MockState,
  mutateAsync: vi.fn(),
}));


vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: h.state.formDesignacaoData,
  }),
}));

vi.mock("@/hooks/useServidorDesignacao", () => ({
  default: () => ({
    mutateAsync: h.mutateAsync,
    isPending: false,
  }),
}));

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    Card: ({ children, title }: { children: React.ReactNode; title: React.ReactNode }) => (
      <div data-testid="card">
        <div data-testid="card-title">{title}</div>
        {children}
      </div>
    ),
    Flex: ({ children, className }: any) => <div className={className}>{children}</div>,
    Steps: ({ current }: any) => <div data-testid="mock-steps">Step: {current}</div>,
  };
});

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => <div data-testid="accordion">{children}</div>,
  AccordionItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));


vi.mock("@/components/dashboard/Designacao/SelecaoServidorIndicado/SelecaoServidorIndicado", () => ({
  default: ({ onBuscaTitular, tipoCargo }: any) => (
    <div data-testid="selecao-vaga">
      <span>Tipo: {tipoCargo}</span>
      <button onClick={() => onBuscaTitular({ rf: "1234567" })}>Simular Busca</button>
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields", () => ({
  default: () => <div data-testid="portaria-fields">Campos Portaria</div>,
}));

 

vi.mock("@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado", () => ({
  default: ({ defaultValues }: { defaultValues: any }) => (
    <div data-testid="resumo-designacao">
      Mock Resumo: {defaultValues?.nome}
    </div>
  ),
  InfoItem: ({ label, value }: { label: string; value: string }) => (
    <div>
      <strong>{label}:</strong> {value}
    </div>
  ),
}));

vi.mock("@/assets/icons/Designacao", () => ({ default: () => <svg /> }));
vi.mock("@/assets/icons/Historico", () => ({ default: () => <svg /> }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock(
  "@/components/dashboard/Designacao/ModalHistoricoUltimaDesignacao/ModalHistoricoUltimaDesignacao",
  () => ({
    default: ({ open }: { open: boolean }) => (
      <div data-testid="modal-historico" data-open={String(open)} />
    ),
  })
);

describe("DesignacoesPasso2 - Integração da Página", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.state.formDesignacaoData = null;
  });

  it("deve renderizar o estado inicial sem os accordions se não houver servidor no contexto", () => {
    render(<DesignacoesPasso2Page />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("selecao-vaga")).toBeInTheDocument();
  });

  it("deve renderizar os resumos quando houver servidor no contexto", () => {
    h.state.formDesignacaoData = {
      servidorIndicado: {
        nome: "Fulano",
        rf: "123",
        lotacao_cargo_sobreposto: "Escola X",
        dre: "DRE 1",
      },
    };

    render(<DesignacoesPasso2Page />);

    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByText("Unidade Proponente")).toBeInTheDocument();
    expect(screen.getByText("Dados do servidor indicado")).toBeInTheDocument();
  });

  it("deve chamar a API de busca e atualizar o estado ao buscar titular", async () => {
    h.mutateAsync.mockResolvedValue({
      success: true,
      data: { nome: "Novo Titular", rf: "1234567" },
    });

    render(<DesignacoesPasso2Page />);

    const btnBusca = screen.getByText("Simular Busca");
    fireEvent.click(btnBusca);

    await waitFor(() => {
      expect(h.mutateAsync).toHaveBeenCalledWith({ rf: "1234567" });
    });
  });

  it("deve manter o botão próximo desabilitado se o formulário for inválido", () => {
    render(<DesignacoesPasso2Page />);
    const btnProximo = screen.getByTestId("botao-proximo");
    expect(btnProximo).toBeDisabled();
  });

  it("navega ao passo anterior", async () => {
    render(<DesignacoesPasso2Page />);
    
    const botaoAnterior = screen.getByTestId("botao-anterior");
    fireEvent.click(botaoAnterior);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalled();
    });

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-1"
    );
  });

  it("deve abrir o modal de histórico ao clicar no botão Histórico", async () => {
    // Arrange: mock do ModalUltimaDesignacao para capturar a prop `open`
    vi.mock(
      "@/components/dashboard/Designacao/ModalHistoricoUltimaDesignacao/ModalHistoricoUltimaDesignacao",
      () => ({
        default: ({ open }: { open: boolean }) => (
          <div data-testid="modal-historico" data-open={String(open)} />
        ),
      })
    );

    render(<DesignacoesPasso2Page />);

    // Assert: modal começa fechado
    const modal = screen.getByTestId("modal-historico");
    expect(modal).toHaveAttribute("data-open", "false");

    // Act: clica no botão Histórico pelo aria-label
    const btnHistorico = screen.getByRole("button", {
      name: /ver histórico da última designação/i,
    });
    fireEvent.click(btnHistorico);

    // Assert: modal agora está aberto
    await waitFor(() => {
      expect(modal).toHaveAttribute("data-open", "true");
    });
  });
});