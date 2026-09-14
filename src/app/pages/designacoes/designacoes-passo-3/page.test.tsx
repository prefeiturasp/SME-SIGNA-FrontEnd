import React from "react";
import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPasso3 from "./page";
import { designacaoAction } from "@/actions/cadastro-designacao";
import { gerarPreviewTextoSeiAction } from "@/actions/textos-sei";
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

const textoPreviewPadrao =
  "PORTARIA Nº 123/2024\nSEI Nº 6016.2024/0001-2\nEXPEDE:\nTexto da portaria para JOÃO SILVA";

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

// ── Action de preview do texto SEI ───────────────────────────
vi.mock("@/actions/textos-sei", () => ({
  gerarPreviewTextoSeiAction: vi.fn(),
}));

// ── Action de salvar ───────────────────────────
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
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValue({
      success: true,
      data: { modelo_portaria_id: 7, texto: textoPreviewPadrao },
    });
  });

  it("busca a prévia do texto SEI no back e exibe o texto retornado", async () => {
    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_portaria: "DESIGNACAO" })
    );
    expect(editor).toHaveTextContent("PORTARIA Nº");
    expect(editor).toHaveTextContent("EXPEDE:");
    expect(editor).toHaveTextContent("SEI Nº");

    const strongs = editor.querySelectorAll("strong");
    expect(strongs.length).toBeGreaterThan(0);
  });

  it("envia tipo_cargo=CARGO_VAGO quando o tipo_cargo do formulário é 'vago'", async () => {
    h.formData = {
      ...defaultFormData,
      tipo_cargo: "vago",
    } as unknown as FormDesignacaoEServidorIndicado;

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_cargo: "CARGO_VAGO" })
    );
  });

  it("envia tipo_cargo=CARGO_DISPONIVEL quando o tipo_cargo do formulário é 'disponivel'", async () => {
    h.formData = {
      ...defaultFormData,
      tipo_cargo: "disponivel",
    } as unknown as FormDesignacaoEServidorIndicado;

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_cargo: "CARGO_DISPONIVEL" })
    );
  });

  it("busca a prévia apenas uma vez, mesmo com re-render do contexto", async () => {
    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    fireEvent.change(screen.getByTestId("input-descricao-pendencia"), {
      target: { value: "Observacao complementar" },
    });

    await waitFor(() => {
      expect(h.setFormDesignacaoDataMock).toHaveBeenCalled();
    });

    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledTimes(1);
  });

  it("avisa que não há modelo de portaria e volta para o passo 2 quando a prévia falha", async () => {
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: false,
      error: "Não há modelo de portaria ativo cadastrado para este tipo de ato.",
    });

    render(<DesignacoesPasso3 />);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Não existe modelo de portaria criado",
        description: "Certifique-se de criar um modelo de portaria para designação antes de prosseguir.",
      });
    });

    expect(h.pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2?rf=1234567"
    );
  });

  it("volta para o passo 2 preservando o id quando a prévia falha em edição", async () => {
    h.searchId = "42";
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: false,
      error: "Não há modelo de portaria ativo cadastrado para este tipo de ato.",
    });

    render(<DesignacoesPasso3 />);

    await waitFor(() => {
      expect(h.pushMock).toHaveBeenCalledWith(
        "/pages/designacoes/designacoes-passo-2?id=42&rf=1234567"
      );
    });
  });

  it("chama action ao salvar incluindo o texto e o modelo gerados", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(designacaoAction).toHaveBeenCalledWith(
        {
          ...h.formData,
          texto_sei: textoPreviewPadrao,
          modelo_portaria: 7,
        },
        null
      )
    );
  });

  it("envia id quando existir", async () => {
    h.searchId = "42";
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(designacaoAction).toHaveBeenCalledWith(
        expect.objectContaining({ texto_sei: textoPreviewPadrao, modelo_portaria: 7 }),
        "42"
      )
    );
  });

  it("bloqueia botão durante loading do salvamento", async () => {
    let resolveFn!: (value: Awaited<ReturnType<typeof designacaoAction>>) => void;
    vi.mocked(designacaoAction).mockImplementation(
      () => new Promise((r) => (resolveFn = r))
    );

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    const btn = screen.getByText("Salvar");

    fireEvent.click(btn);
    expect(btn).toBeDisabled();

    resolveFn({ success: true, data: {} });

    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it("redireciona após sucesso", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(h.pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("exibe notificação de sucesso", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
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
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Erro ao salvar portaria: Erro teste",
      });
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
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: true,
      data: { modelo_portaria_id: 7, texto: "A\n\nB" },
    });

    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    expect(editor.innerHTML).toContain("<br>");
  });

  it("não quebra com texto vazio", async () => {
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: true,
      data: { modelo_portaria_id: 7, texto: "" },
    });

    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

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

  it("não busca prévia nem permite salvar quando não há dados no contexto", async () => {
    h.formData = null;

    render(<DesignacoesPasso3 />);

    expect(gerarPreviewTextoSeiAction).not.toHaveBeenCalled();
    expect(screen.getByText("Salvar")).toBeDisabled();

    fireEvent.click(screen.getByText("Salvar"));
    expect(designacaoAction).not.toHaveBeenCalled();
  });
});
