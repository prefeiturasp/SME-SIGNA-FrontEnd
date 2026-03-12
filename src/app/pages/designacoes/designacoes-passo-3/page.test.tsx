import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPasso3 from "./page";
import { designacaoAction } from "@/actions/cadastro-designacao";

// ── Router mock ─────────────────────────────────

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// ── Context mock ─────────────────────────────────

vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: {
      dre: "dre-1",
      ue: "ue-1",
    },
  }),
}));

// ── Component mocks ──────────────────────────────

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: any) => <div>{title}</div>,
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  default: ({ current }: any) => (
    <div data-testid="stepper">{current}</div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  default: ({ onAnterior, onProximo, disableProximo }: any) => (
    <div>
      <button onClick={onAnterior}>Anterior</button>
      <button onClick={onProximo} disabled={disableProximo}>
        Próximo
      </button>
    </div>
  ),
}));

vi.mock("@/assets/icons/Designacao", () => ({
  default: () => <svg />,
}));

// ── Utils mocks ──────────────────────────────────

vi.mock("@/utils/portarias/preencherTemplate", () => ({
  preencherTemplate: () => "PORTARIA GERADA",
}));

vi.mock("@/utils/portarias/gerarDadosPortaria", () => ({
  gerarDadosPortaria: () => ({ nome: "João" }),
}));

vi.mock("@/utils/designacao/mapearPayload", () => ({
  mapearPayloadDesignacao: () => ({ dre: "dre-1", ue: "ue-1" }),
}));

// ── Actions mocks ────────────────────────────────

vi.mock("@/actions/cadastro-designacao", () => ({
  designacaoAction: vi.fn(),
}));

// ── antd mock ────────────────────────────────────

vi.mock("antd", () => ({
  Card: ({ children }: any) => <div>{children}</div>,

  Modal: ({ open, children }: any) =>
    open ? <div data-testid="modal">{children}</div> : null,

  Result: ({ title, extra }: any) => (
    <div>
      <div>{title}</div>
      {extra && <div>{extra}</div>}
    </div>
  ),

  message: {
    loading: vi.fn(),
    destroy: vi.fn(),
    error: vi.fn(),
  },
}));

// ── Testes ───────────────────────────────────────

describe("DesignacoesPasso3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza a página corretamente", async () => {
    render(<DesignacoesPasso3 />);

    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByTestId("stepper")).toHaveTextContent("2");

    const textarea = await screen.findByRole("textbox");

    expect(textarea).toHaveValue("PORTARIA GERADA");
  });

  it("permite editar o texto da portaria", async () => {
    render(<DesignacoesPasso3 />);

    const textarea = await screen.findByRole("textbox");

    fireEvent.change(textarea, {
      target: { value: "Texto manual" },
    });

    expect(textarea).toHaveValue("Texto manual");
  });

  it("navega para o passo anterior", () => {
    render(<DesignacoesPasso3 />);

    fireEvent.click(screen.getByText("Anterior"));

    expect(pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2"
    );
  });

  it("mostra modal de sucesso ao salvar", async () => {
    vi.useFakeTimers();

    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: true,
      data: {},
    });

    render(<DesignacoesPasso3 />);

    fireEvent.click(screen.getByText("Próximo"));

    await vi.runAllTimersAsync();

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(
      screen.getByText("Portaria salva com sucesso!")
    ).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("exibe modal de erro quando designacaoAction falha", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Erro interno",
    });

    render(<DesignacoesPasso3 />);

    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(
        screen.getByText("Erro ao salvar a portaria!")
      ).toBeInTheDocument();
    });
  });

  it("fecha o modal de erro ao clicar em Fechar", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Erro interno",
    });

    render(<DesignacoesPasso3 />);

    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Fechar"));

    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });
});