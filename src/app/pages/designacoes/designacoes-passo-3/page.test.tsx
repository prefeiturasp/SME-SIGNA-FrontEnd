import React from "react";
import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPasso3 from "./page";
import { designacaoAction } from "@/actions/cadastro-designacao";
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";
import type { FormDesignacaoEServidorIndicado } from "../DesignacaoContext";

// ── Mocks de Navegação ───────────────────────────
const h = vi.hoisted(() => ({
  pushMock: vi.fn(),
  searchId: null as string | null,
  searchRf: "1234567" as string | null,
  clearFormDesignacaoDataMock: vi.fn(),
  setFormDesignacaoDataMock: vi.fn(),
  formData: {
    dre_nome: "DRE CENTRO",
    ue_nome: "EMEF TESTE",
    portaria_designacao: "123/2024",
    numero_sei: "6016.2024/0001-2",
    servidorIndicado: { nome_civil: "JOÃO SILVA" },
  } as unknown as FormDesignacaoEServidorIndicado | null,
}));
const defaultFormData = {
  dre_nome: "DRE CENTRO",
  ue_nome: "EMEF TESTE",
  portaria_designacao: "123/2024",
  numero_sei: "6016.2024/0001-2",
  servidorIndicado: { nome_civil: "JOÃO SILVA" },
} as const;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.pushMock }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "id") return h.searchId;
      if (key === "rf") return h.searchRf;
      return null;
    },
  }),
}));

// ── Contexto ───────────────────────────
vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: h.formData,
    clearFormDesignacaoData: h.clearFormDesignacaoDataMock,
    setFormDesignacaoData: h.setFormDesignacaoDataMock,
  }),
}));

// ── UI mocks ───────────────────────────
vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: { title: ReactNode }) => <h1>{title}</h1>,
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));

vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  default: ({ current }: { current: number }) => <div data-testid="stepper">Passo {current}</div>,
}));

vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  default: ({ onAnterior, onProximo, disableProximo, labelProximo }: {
    onAnterior: () => void;
    onProximo: () => void;
    disableProximo?: boolean;
    labelProximo?: string;
  }) => (
    <nav>
      <button onClick={onAnterior}>Anterior</button>
      <button onClick={onProximo} disabled={disableProximo}>
        {labelProximo ?? "Próximo"}
      </button>
    </nav>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: { children: ReactNode; onValueChange?: (value: string) => void }) => (
    <div>
      <button
        type="button"
        data-testid="select-detalhe-true"
        onClick={() => onValueChange?.("true")}
      >
        Selecionar contabilizar
      </button>
      <button
        type="button"
        data-testid="select-detalhe-false"
        onClick={() => onValueChange?.("false")}
      >
        Selecionar nao contabilizar
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

vi.mock("@/assets/icons/Designacao", () => ({
  default: () => <svg />,
}));

// ── Utils mock ───────────────────────────
vi.mock("@/utils/portarias/preencherTemplate", () => ({
  preencherTemplate: vi.fn((_template: string, dados: Record<string, unknown>) => {
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
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <article>
      <h3>{title}</h3>
      {children}
    </article>
  ),
}));

// ── Notification mock ───────────────────────────
const { notificationSuccessMock, notificationErrorMock } = vi.hoisted(() => ({
  notificationSuccessMock: vi.fn(),
  notificationErrorMock: vi.fn(),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: notificationSuccessMock,
    error: notificationErrorMock,
  }),
}));

// ── TESTES ───────────────────────────

describe("DesignacoesPasso3 - Testes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.searchId = null;
    h.searchRf = "1234567";
    h.formData = { ...defaultFormData } as unknown as FormDesignacaoEServidorIndicado;
    notificationSuccessMock.mockReset();
    notificationErrorMock.mockReset();
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
    let resolveFn!: (value: Awaited<ReturnType<typeof designacaoAction>>) => void;
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
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(h.pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("exibe notificação de sucesso", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(notificationSuccessMock).toHaveBeenCalledWith({
        title: "Portaria salva com sucesso!",
      });
    });
  });

  it("exibe notificação de erro", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Erro teste",
    });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Erro teste" });
    });
  });

  it("navega ao clicar em Anterior", () => {
    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Anterior"));

    expect(h.pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2?rf=1234567"
    );
  });

  it("navega para passo 2 com id ao clicar em Anterior", () => {
    h.searchId = "42";
    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Anterior"));

    expect(h.pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2?id=42&rf=1234567"
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

  it("atualiza texto plano ao editar conteúdo do editor", async () => {
    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    editor.textContent = "Portaria editada manualmente";
    fireEvent.input(editor);

    expect(editor).toBeInTheDocument();
  });

  it("atualiza informações adicionais no contexto", async () => {
    render(<DesignacoesPasso3 />);

    fireEvent.change(screen.getByTestId("input-descricao-pendencia"), {
      target: { value: "Observacao complementar" },
    });

    await waitFor(() => {
      expect(h.setFormDesignacaoDataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          informacoes_adicionais: "Observacao complementar",
        })
      );
    });
  });

  it("atualiza detalhe do histórico no contexto", async () => {
    render(<DesignacoesPasso3 />);

    fireEvent.click(screen.getByTestId("select-detalhe-false"));
    fireEvent.click(screen.getByTestId("select-detalhe-true"));

    await waitFor(() => {
      expect(h.setFormDesignacaoDataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          detalhe_para_quadro_de_historico_por_ano: false,
        })
      );
      expect(h.setFormDesignacaoDataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          detalhe_para_quadro_de_historico_por_ano: true,
        })
      );
    });
  });

  it("trata ausência de dados no contexto ao renderizar e salvar", async () => {
    h.formData = null;
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");
    expect(editor).toBeInTheDocument();

    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Dados do formulário não encontrados.",
      });
    });
    expect(designacaoAction).not.toHaveBeenCalled();
  });
});