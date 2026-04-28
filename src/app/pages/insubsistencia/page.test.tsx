import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InsubsistenciaPage from "./page";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { useSalvarInsubsistencia } from "@/hooks/useSalvarInsubsistencia";
import { message } from "antd";

const testControls = vi.hoisted(() => ({
  routerPush: vi.fn(),
  searchParamsGet: vi.fn(() => "5"),
  radioOnValueChange: undefined as ((value: string) => void) | undefined,
  forceTriggerResult: null as boolean | null,
  forceUndefinedGetValues: false,
  gerarHtmlPortaria: vi.fn((texto: string) => texto),
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("react-hook-form", async () => {
  const actual =
    await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useForm: (...args: unknown[]) => {
      const form = (actual.useForm as (...callArgs: unknown[]) => any)(...args);
      const originalTrigger = form.trigger.bind(form);
      const originalGetValues = form.getValues.bind(form);

      form.trigger = async (...triggerArgs: unknown[]) => {
        if (testControls.forceTriggerResult !== null) {
          return testControls.forceTriggerResult;
        }
        return originalTrigger(...triggerArgs);
      };
      form.getValues = (...getValuesArgs: unknown[]) => {
        if (testControls.forceUndefinedGetValues) {
          return {
            insubsistencia: {
              doc: undefined,
              numero_portaria: undefined,
              ano: undefined,
              numero_sei: undefined,
              observacoes: undefined,
              tipo_insubsistencia: "designacao",
            },
          };
        }

        return originalGetValues(...getValuesArgs);
      };

      return form;
    },
  };
});

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({ get: testControls.searchParamsGet })),
  useRouter: vi.fn(() => ({ push: testControls.routerPush })),
}));

vi.mock("@/hooks/useVisualizarDesignacoes", () => ({
  useFetchDesignacoesById: vi.fn(),
}));

vi.mock("@/hooks/useSalvarInsubsistencia", () => ({
  useSalvarInsubsistencia: vi.fn(),
}));

vi.mock("antd", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
  HelpCircle: () => <span />,
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion">{children}</div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div data-testid={`accordion-item-${title}`}>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: React.ReactNode }) => (
    <header data-testid="page-header">{title}</header>
  ),
}));

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    __esModule: true,
    default: ({ onSubmitEditarServidor }: { onSubmitEditarServidor?: () => void }) => (
      <div data-testid="resumo-servidor-indicado">
        <button
          type="button"
          data-testid="editar-servidor"
          onClick={() => onSubmitEditarServidor?.()}
        >
          editar
        </button>
      </div>
    ),
  })
);

vi.mock("@/components/dashboard/Designacao/ResumoPortariaDesigacao", () => ({
  __esModule: true,
  default: () => <div data-testid="resumo-portaria-designacao" />,
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaCessacao", () => ({
  __esModule: true,
  default: () => <div data-testid="resumo-portaria-cessacao" />,
}));

vi.mock(
  "@/components/dashboard/Insubsistencia/PortariaInsubsistenciaFields/PortariaInsubsistenciaFields",
  () => ({
    __esModule: true,
    default: () => <div data-testid="portaria-insubsistencia-fields" />,
  })
);

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: () => <span data-testid="icon-designacao" />,
}));

vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, onValueChange, disabled }: {
    children: React.ReactNode;
    onValueChange?: (v: string) => void;
    disabled?: boolean;
  }) => (
    <div
      data-testid="radio-group"
      data-disabled={disabled ? "true" : "false"}
    >
      {(() => {
        testControls.radioOnValueChange = onValueChange;
        return children;
      })()}
    </div>
  ),
  RadioGroupItem: ({ value, id }: {
    value: string;
    id: string;
  }) => (
    <input
      type="radio"
      data-testid={`radio-${id}`}
      value={value}
      onChange={() => testControls.radioOnValueChange?.(value)}
    />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@radix-ui/react-tooltip", () => ({
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}));

vi.mock("@/components/dashboard/EditorTextoSEI/EditorTextoSEI", () => ({
  __esModule: true,
  default: ({ testId, labelBotao, tipoBotao }: { testId: string; labelBotao: string; tipoBotao?: "button" | "submit" | "reset" }) => (
    <button data-testid={testId} type={tipoBotao ?? "button"}>
      {labelBotao}
    </button>
  ),
  gerarHtmlPortaria: (texto: string) => testControls.gerarHtmlPortaria(texto),
}));

// ── Dados de teste ────────────────────────────────────────────────────────────

const designacaoMock = {
  id: 5,
  indicado_nome_servidor: "SERVIDOR TESTE",
  indicado_nome_civil: "Servidor Civil",
  indicado_rf: "123456",
  indicado_vinculo: 1,
  indicado_cargo_base: "Professor",
  indicado_lotacao: "Lotação X",
  indicado_cargo_sobreposto: "Sobreposto X",
  indicado_local_exercicio: "Local X",
  indicado_local_servico: "Serviço X",
  numero_portaria: "001",
  ano_vigente: "2026",
  sei_numero: "6016.2026/0001-1",
  doc: "DOC-01",
  data_inicio: "2026-01-01",
  data_fim: null,
  carater_excepcional: false as const,
  impedimento_substituicao: null,
  motivo_afastamento: "Motivo",
  pendencias: "Nenhuma",
  cessacao: null,
};

const cessacaoMock = {
  id: 1,
  numero_portaria: "050",
  ano_vigente: "2025",
  sei_numero: "SEI-050",
  doc: "DOC-50",
  a_pedido: false,
  remocao: false,
  aposentadoria: false,
  data_designacao: "2025-03-01",
  criado_em: "2025-03-01T00:00:00Z",
  is_deleted: false,
  deleted_at: null,
  designacao: 5,
  insubsistencia: null as never,
};

// ── Testes ────────────────────────────────────────────────────────────────────

describe("InsubsistenciaPage", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    testControls.forceTriggerResult = null;
    testControls.forceUndefinedGetValues = false;
    testControls.searchParamsGet.mockReturnValue("5");

    vi.mocked(useSalvarInsubsistencia).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isError: false,
      error: null,
    } as never);
  });

  it("exibe loader enquanto dados estão carregando", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza o formulário quando dados estão disponíveis", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-servidor-indicado")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("portaria-insubsistencia-fields")).toBeInTheDocument();
  });

  it("exibe mensagem de 'Não há portaria de cessão' quando não há cessação", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, cessacao: null },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.getByText("Não há portaria de cessão")).toBeInTheDocument();
    expect(screen.queryByTestId("resumo-portaria-cessacao")).not.toBeInTheDocument();
  });

  it("exibe ResumoPortariaCessacao quando há cessação", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, cessacao: cessacaoMock },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.getByTestId("resumo-portaria-cessacao")).toBeInTheDocument();
    expect(screen.queryByText("Não há portaria de cessão")).not.toBeInTheDocument();
  });

  it("exibe o botão Salvar após clicar em 'Trechos para o SEI' com formulário válido", async () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.queryByTestId("botao-proximo")).not.toBeInTheDocument();

    const botaoTrechos = screen.getByText("Trechos para o SEI");
    fireEvent.click(botaoTrechos);

    await waitFor(() => {
      expect(screen.getByTestId("botao-proximo")).toBeInTheDocument();
    });
  });

  it("salva insubsistência com sucesso e redireciona", async () => {
    mutateAsyncMock.mockResolvedValue({ id: 1 });

    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => screen.getByTestId("botao-proximo"));

    fireEvent.click(screen.getByTestId("botao-proximo"));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith("Insubsistência salva com sucesso!");
      expect(testControls.routerPush).toHaveBeenCalledWith("/pages/listagem-designacoes");
    });
  });

  it("exibe erro quando mutateAsync lança exceção", async () => {
    mutateAsyncMock.mockRejectedValue(new Error("Falha na API"));

    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => screen.getByTestId("botao-proximo"));

    fireEvent.click(screen.getByTestId("botao-proximo"));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith(
        expect.stringContaining("Erro ao salvar:"),
        3
      );
    });
  });

  it("gera texto de cessação com período fechado ao trocar o radio", async () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        data_inicio: "2026-01-01",
        data_fim: "2026-01-31",
        cessacao: cessacaoMock,
      },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByTestId("radio-cessacao"));
    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(testControls.gerarHtmlPortaria).toHaveBeenCalled();
    });

    const textoGerado = testControls.gerarHtmlPortaria.mock.calls.at(-1)?.[0] as string;
    expect(textoGerado).toContain("no período de 01/01/2026 a 31/01/2026");
    expect(textoGerado).toContain("<strong>SERVIDOR TESTE</strong>");
  });

  it("não gera trechos para o SEI quando o trigger do formulário é inválido", async () => {
    testControls.forceTriggerResult = false;
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(screen.queryByTestId("botao-proximo")).not.toBeInTheDocument();
      expect(testControls.gerarHtmlPortaria).not.toHaveBeenCalled();
    });
  });

  it("gera texto com fallbacks quando não existe designação", async () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: null,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(testControls.gerarHtmlPortaria).toHaveBeenCalled();
    });

    const textoGerado = testControls.gerarHtmlPortaria.mock.calls.at(-1)?.[0] as string;
    expect(textoGerado).toContain("a partir de undefined/undefined/");
    expect(textoGerado).toContain("-");
  });

  it("usa fallbacks de data e valores indefinidos ao gerar texto", async () => {
    testControls.forceUndefinedGetValues = true;
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        data_inicio: undefined as never,
        data_fim: "2026-01-31",
      },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(testControls.gerarHtmlPortaria).toHaveBeenCalled();
    });

    const textoGerado = testControls.gerarHtmlPortaria.mock.calls.at(-1)?.[0] as string;
    expect(textoGerado).toContain("no período de undefined/undefined/ a 31/01/2026");
  });

  it("radio group fica desabilitado quando cessação já possui insubsistência", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        cessacao: {
          ...cessacaoMock,
          insubsistencia: { numero_portaria: "100" } as never,
        },
      },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    const radioGroup = screen.getByTestId("radio-group");
    expect(radioGroup).toHaveAttribute("data-disabled", "true");
  });

  it("radio group fica habilitado quando cessação não possui insubsistência", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, cessacao: cessacaoMock },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    const radioGroup = screen.getByTestId("radio-group");
    expect(radioGroup).toHaveAttribute("data-disabled", "false");
  });

  it("não renderiza ResumoDesignacaoServidorIndicado quando não há dados do indicado", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: null,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.queryByTestId("resumo-servidor-indicado")).not.toBeInTheDocument();
  });

  it("exibe nome do servidor no título quando há designação", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.getByText("SERVIDOR TESTE")).toBeInTheDocument();
  });

  it("exibe '-' no título quando não há nome do servidor", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, indicado_nome_servidor: undefined as never },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("executa callback de edição do resumo do servidor indicado", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByTestId("editar-servidor"));

    expect(screen.getByTestId("resumo-servidor-indicado")).toBeInTheDocument();
  });
});
