import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesPasso3 from "./page";
import { designacaoAction } from "@/actions/cadastro-designacao";
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";
import { gerarDadosPortaria } from "@/utils/portarias/gerarDadosPortaria";

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

// ── Mock do Contexto ─────────────────────────────
vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: h.formData,
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

// Ajustado: labelProximo agora é "Salvar" na página real
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
vi.mock("@/assets/icons/Designacao", () => ({ default: () => <svg /> }));

// ── Mocks de Utils ───────────────────────────────
vi.mock("@/utils/portarias/preencherTemplate", () => ({
  preencherTemplate: vi.fn(
    (_template: string, dados: Record<string, string>) => {
      const portaria = dados.portaria ?? "123/2024";
      const sei = dados.sei ?? "6016.2024/0001-2";
      const nome = dados.nome_indicado ?? "JOÃO SILVA";
      return `PORTARIA Nº ${portaria}\nSEI Nº ${sei}\nEXPEDE:\nTexto da portaria para ${nome}`;
    }
  ),
}));

vi.mock("@/utils/portarias/gerarDadosPortaria", () => ({
  gerarDadosPortaria: vi.fn((data: any) => ({
    ...data,
    autoridade: "DIRETOR",
    nome_indicado: "JOÃO SILVA",
    portaria: "123/2024",
    sei: "6016.2024/0001-2",
  })),
}));

// ── Mock da Action ───────────────────────────────
vi.mock("@/actions/cadastro-designacao", () => ({
  designacaoAction: vi.fn(),
}));

// ── Mock do Antd ─────────────────────────────────
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

// ── Testes ───────────────────────────────────────

describe("DesignacoesPasso3 - Testes Robustos", () => {
  const mockedPreencherTemplate = vi.mocked(preencherTemplate);
  const mockedGerarDadosPortaria = vi.mocked(gerarDadosPortaria);

  beforeEach(() => {
    vi.clearAllMocks();
    h.searchId = null;
    h.formData = {
      dre_nome: "DRE CENTRO",
      ue_nome: "EMEF TESTE",
      portaria_designacao: "123/2024",
      numero_sei: "6016.2024/0001-2",
      servidorIndicado: { nome_civil: "JOÃO SILVA" },
    } as any;

    mockedPreencherTemplate.mockImplementation(
      (_template: string, dados: Record<string, string>) => {
        const portaria = dados.portaria ?? "123/2024";
        const sei = dados.sei ?? "6016.2024/0001-2";
        const nome = dados.nome_indicado ?? "JOÃO SILVA";
        return `PORTARIA Nº ${portaria}\nSEI Nº ${sei}\nEXPEDE:\nTexto da portaria para ${nome}`;
      }
    );

    mockedGerarDadosPortaria.mockImplementation((data: any) => ({
      ...data,
      autoridade: "DIRETOR",
      nome_indicado: "JOÃO SILVA",
      portaria: "123/2024",
      sei: "6016.2024/0001-2",
    }));
  });

  const getEditor = () =>
    document.querySelector("[contenteditable='true']") as HTMLElement;

  it("deve renderizar o editor com negritos automáticos aplicados", async () => {
    render(<DesignacoesPasso3 />);

    const editor = await waitFor(() => getEditor());

    // Palavras fixas em negrito via gerarHtmlPortaria
    expect(editor.innerHTML).toContain("<strong>PORTARIA Nº</strong>");
    expect(editor.innerHTML).toContain("<strong>EXPEDE:</strong>");
    expect(editor.innerHTML).toContain("<strong>SEI Nº</strong>");

    // Campos em negrito via CAMPOS_NEGRITO (nome_indicado, portaria, sei, autoridade)
    expect(editor.innerHTML).toContain("<strong>JOÃO SILVA</strong>");
    expect(editor.innerHTML).toContain("<strong>123/2024</strong>");
  });

  it("deve aceitar edição do conteúdo sem quebrar", async () => {
    render(<DesignacoesPasso3 />);
    const editor = await waitFor(() => getEditor());

    editor.innerText = "Nova portaria editada manualmente";
    fireEvent.input(editor);

    expect(editor).toBeInTheDocument();
  });

  it("deve chamar a action com os dados originais do formulário ao clicar em Salvar", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: true,
      data: { id: 1 },
    });

    render(<DesignacoesPasso3 />);

    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(designacaoAction).toHaveBeenCalledWith(h.formData, null);
    });
  });

  it("deve enviar id para a action quando query param id existir", async () => {
    h.searchId = "42";
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(designacaoAction).toHaveBeenCalledWith(h.formData, "42");
    });
  });

  it("deve gerenciar o estado de loading durante o salvamento", async () => {
    vi.mocked(designacaoAction).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: {} }), 100)
        )
    );

    render(<DesignacoesPasso3 />);

    const btnSalvar = screen.getByText("Salvar");
    fireEvent.click(btnSalvar);

    expect(btnSalvar).toBeDisabled();

    await waitFor(() => expect(btnSalvar).not.toBeDisabled());
  });

  it("deve redirecionar para /pages/listagem-designacoes após sucesso com delay", async () => {
    vi.useFakeTimers();
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await vi.runAllTimersAsync();

    // Redirecionamento atualizado conforme a página
    expect(h.pushMock).toHaveBeenCalledWith("/pages/listagem-designacoes");
    vi.useRealTimers();
  });

  it("deve exibir modal de sucesso após salvar com êxito", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Portaria salva com sucesso!")).toBeInTheDocument();
      expect(
        screen.getByText("Redirecionando para a página inicial...")
      ).toBeInTheDocument();
    });
  });

  it("deve exibir modal de erro se a action falhar", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Banco de dados offline",
    });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Erro ao salvar a portaria!")).toBeInTheDocument();
    });
  });

  it("deve fechar o modal de erro ao clicar em Fechar", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Erro qualquer",
    });

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Fechar"));

    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  it("deve navegar para o passo 2 ao clicar em Anterior", () => {
    render(<DesignacoesPasso3 />);

    fireEvent.click(screen.getByText("Anterior"));

    expect(h.pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2"
    );
  });

  it("deve abrir modal de erro quando não existir formDesignacaoData", async () => {
    h.formData = null;

    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(screen.getByText("Erro ao salvar a portaria!")).toBeInTheDocument();
    });
  });

  it("deve renderizar quebra de linha vazia no HTML da portaria", async () => {
    mockedPreencherTemplate.mockImplementationOnce(
      () => "PORTARIA Nº 1\n\nEXPEDE:\nLinha final"
    );

    render(<DesignacoesPasso3 />);
    const editor = await waitFor(() => getEditor());
    expect(editor.innerHTML).toContain("<div><br></div>");
  });

  it("deve aceitar template vazio sem quebrar renderização", async () => {
    mockedPreencherTemplate.mockImplementationOnce(() => "");

    render(<DesignacoesPasso3 />);
    const editor = await waitFor(() => getEditor());
    expect(editor.innerHTML).toBe("");
  });

  it("não aplica negrito quando campo de destaque estiver ausente", async () => {
    mockedGerarDadosPortaria.mockImplementationOnce((data: any) => ({
      ...data,
      autoridade: undefined,
      nome_indicado: "JOÃO SILVA",
      portaria: "123/2024",
      sei: "6016.2024/0001-2",
    }));
    mockedPreencherTemplate.mockImplementationOnce(
      (_template, dados) => `Autoridade: ${String(dados.autoridade)}`
    );

    render(<DesignacoesPasso3 />);
    const editor = await waitFor(() => getEditor());
    expect(editor.innerHTML).toContain("Autoridade: undefined");
    expect(editor.innerHTML).not.toContain("<strong>undefined</strong>");
  });
});