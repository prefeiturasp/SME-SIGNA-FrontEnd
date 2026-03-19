import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPasso3 from "./page";
import { designacaoAction } from "@/actions/cadastro-designacao";

// ── Mocks de Navegação ───────────────────────────
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// ── Mock do Contexto (Dados que alimentam a portaria) ──
const mockFormData = {
  dre_nome: "DRE CENTRO",
  ue_nome: "EMEF TESTE",
  portaria_designacao: "123/2024",
  numero_sei: "6016.2024/0001-2",
  servidorIndicado: { nome_civil: "JOÃO SILVA" }
};

vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: mockFormData,
  }),
}));

// ── Mocks de Componentes UI ──────────────────────
vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: any) => <h1>{title}</h1>,
}));
vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: any) => <section>{children}</section>,
}));
vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  default: ({ current }: any) => <div data-testid="stepper">Passo {current}</div>,
}));
vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  default: ({ onAnterior, onProximo, disableProximo }: any) => (
    <nav>
      <button onClick={onAnterior}>Anterior</button>
      <button onClick={onProximo} disabled={disableProximo}>Próximo</button>
    </nav>
  ),
}));
vi.mock("@/assets/icons/Designacao", () => ({ default: () => <svg /> }));

// ── Mocks de Utils (Lógica de Geração) ───────────
// Mockamos para retornar um texto que contenha as tags que o componente deve processar
vi.mock("@/utils/portarias/preencherTemplate", () => ({
  preencherTemplate: () => "PORTARIA Nº 123/2024\nEXPEDE:\nTexto da portaria para JOÃO SILVA",
}));

vi.mock("@/utils/portarias/gerarDadosPortaria", () => ({
  gerarDadosPortaria: (data: any) => ({ ...data, autoridade: "DIRETOR" }),
}));

// ── Mock da Action ───────────────────────────────
vi.mock("@/actions/cadastro-designacao", () => ({
  designacaoAction: vi.fn(),
}));

// ── Mock do Antd ─────────────────────────────────
vi.mock("antd", () => ({
  Card: ({ title, children }: any) => <article><h3>{title}</h3>{children}</article>,
  Modal: ({ open, children }: any) => open ? <div data-testid="modal">{children}</div> : null,
  Result: ({ title, extra }: any) => (
    <div>
      <h4>{title}</h4>
      {extra}
    </div>
  ),
  message: { loading: vi.fn(), destroy: vi.fn(), error: vi.fn() },
}));

// ── Testes Robustos ──────────────────────────────

describe("DesignacoesPasso3 - Testes Robustos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper para capturar o editor contentEditable
  const getEditor = () => document.querySelector("[contenteditable='true']") as HTMLElement;

  it("deve renderizar o editor com negritos automáticos aplicados", async () => {
    render(<DesignacoesPasso3 />);

    const editor = await waitFor(() => getEditor());

    // Verifica se o componente aplicou <strong> nas palavras-chave via gerarHtmlPortaria
    expect(editor.innerHTML).toContain("<strong>PORTARIA Nº</strong>");
    expect(editor.innerHTML).toContain("<strong>EXPEDE:</strong>");
    expect(editor.textContent).toContain("JOÃO SILVA");
  });

  it("deve aceitar edição do conteúdo sem quebrar", async () => {
    render(<DesignacoesPasso3 />);
    const editor = await waitFor(() => getEditor());

    const novoTexto = "Nova portaria editada manualmente";

    editor.innerText = novoTexto;
    fireEvent.input(editor);

    expect(editor).toBeInTheDocument();
  });

  it("deve chamar a action com os dados originais do formulário ao clicar em Próximo", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: { id: 1 } });

    render(<DesignacoesPasso3 />);

    const btnProximo = screen.getByText("Próximo");
    fireEvent.click(btnProximo);

    // Garante que os dados do contexto foram passados para a action
    expect(designacaoAction).toHaveBeenCalledWith(mockFormData);
  });

  it("deve gerenciar o estado de loading durante o salvamento", async () => {
    // Mock que demora para responder
    vi.mocked(designacaoAction).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    render(<DesignacoesPasso3 />);

    const btnProximo = screen.getByText("Próximo");
    fireEvent.click(btnProximo);

    // O botão deve ficar desabilitado enquanto salva (via prop disableProximo)
    expect(btnProximo).toBeDisabled();

    await waitFor(() => expect(btnProximo).not.toBeDisabled());
  });

  it("deve redirecionar para a home após sucesso com delay", async () => {
    vi.useFakeTimers();
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Próximo"));

    await vi.runAllTimersAsync();

    expect(pushMock).toHaveBeenCalledWith("/");
    vi.useRealTimers();
  });

  it("deve exibir erro detalhado se a action falhar", async () => {
    const mensagemErro = "Banco de dados offline";
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: mensagemErro
    });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Próximo"));

    // Verifica se o modal de erro apareceu
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Erro ao salvar a portaria!")).toBeInTheDocument();
    });
  });
});