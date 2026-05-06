import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPasso3 from "./page";
import { designacaoAction } from "@/actions/cadastro-designacao";
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";

// ── Mocks de Navegação ───────────────────────────
const h = vi.hoisted(() => ({
  pushMock: vi.fn(),
  searchId: null as string | null,
  formData: {
    dre_nome: "DRE CENTRO",
    ue_nome: "EMEF TESTE",
    portaria_designacao: "123/2024",
    numero_sei: "6016.2024/0001-2",
    servidorIndicado: { nome_civil: "JOÃO SILVA" },
  } as any,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.pushMock }),
  useSearchParams: () => ({
    get: (key: string) => (key === "id" ? h.searchId : null),
  }),
}));

// ── Contexto ───────────────────────────
vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: h.formData,
    clearFormDesignacaoData: vi.fn(),
  }),
}));

// ── UI mocks ───────────────────────────
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
  default: ({ onAnterior, onProximo, disableProximo, labelProximo }: any) => (
    <nav>
      <button onClick={onAnterior}>Anterior</button>
      <button onClick={onProximo} disabled={disableProximo}>
        {labelProximo ?? "Próximo"}
      </button>
    </nav>
  ),
}));

vi.mock("@/assets/icons/Designacao", () => ({
  default: () => <svg />,
}));

// ── Utils mock ───────────────────────────
vi.mock("@/utils/portarias/preencherTemplate", () => ({
  preencherTemplate: vi.fn((_template: string, dados: any) => {
    return `PORTARIA Nº ${dados.portaria}
SEI Nº ${dados.sei}
EXPEDE:
Texto da portaria para ${dados.nome_indicado}`;
  }),
}));

// ── Action mock ───────────────────────────
vi.mock("@/actions/cadastro-designacao", () => ({
  designacaoAction: vi.fn(),
}));

// ── Antd mock ───────────────────────────
vi.mock("antd", () => ({
  Card: ({ title, children }: any) => (
    <article>
      <h3>{title}</h3>
      {children}
    </article>
  ),
  Modal: ({ open, children }: any) =>
    open ? <div data-testid="modal">{children}</div> : null,
  Result: ({ status, title, subTitle, extra }: any) => (
    <div data-testid={`result-${status}`}>
      <h4>{title}</h4>
      {subTitle && <p>{subTitle}</p>}
      {extra}
    </div>
  ),
  message: { loading: vi.fn(), destroy: vi.fn(), error: vi.fn() },
}));

// ── TESTES ───────────────────────────

describe("DesignacoesPasso3 - Testes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.searchId = null;
  });

  it("renderiza editor com conteúdo formatado", async () => {
    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toHaveTextContent("PORTARIA Nº");
    expect(editor).toHaveTextContent("EXPEDE:");
    expect(editor).toHaveTextContent("SEI Nº");

    const strongs = editor.querySelectorAll("strong");
    expect(strongs.length).toBeGreaterThan(0);
  });

  it("chama action ao salvar", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(designacaoAction).toHaveBeenCalledWith(h.formData, null)
    );
  });

  it("envia id quando existir", async () => {
    h.searchId = "42";
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(designacaoAction).toHaveBeenCalledWith(h.formData, "42")
    );
  });

  it("bloqueia botão durante loading", async () => {
    let resolveFn: any;
    vi.mocked(designacaoAction).mockImplementation(
      () => new Promise((r) => (resolveFn = r))
    );

    render(<DesignacoesPasso3 />);
    const btn = screen.getByText("Salvar");

    fireEvent.click(btn);
    expect(btn).toBeDisabled();

    resolveFn({ success: true, data: {} });

    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it("redireciona após sucesso", async () => {
    vi.useFakeTimers();
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await vi.runAllTimersAsync();

    expect(h.pushMock).toHaveBeenCalledWith("/pages/listagem-designacoes");

    vi.useRealTimers();
  });

  it("exibe modal de sucesso", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Portaria salva com sucesso!")).toBeInTheDocument();
  });

  it("exibe modal de erro", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Erro teste",
    });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Erro ao salvar a portaria!")).toBeInTheDocument();
  });

  it("navega ao clicar em Anterior", () => {
    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Anterior"));

    expect(h.pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2"
    );
  });

  it("renderiza quebra de linha", async () => {
    vi.mocked(preencherTemplate).mockReturnValueOnce("A\n\nB");

    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    expect(editor.innerHTML).toContain("<br>");
  });

  it("não quebra com template vazio", async () => {
    vi.mocked(preencherTemplate).mockReturnValueOnce("");

    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toBeInTheDocument();
  });

  it("não renderiza undefined em negrito", async () => {
    vi.mocked(preencherTemplate).mockReturnValueOnce("Autoridade: undefined");

    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toHaveTextContent("Autoridade: undefined");
    expect(editor.innerHTML).not.toContain("<strong>undefined</strong>");
  });
});