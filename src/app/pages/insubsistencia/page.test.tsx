import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InsubsistenciaPage from "./page";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { useSalvarInsubsistencia } from "@/hooks/useSalvarInsubsistencia";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => "5") })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
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
    default: () => <div data-testid="resumo-servidor-indicado" />,
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
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ onValueChange?: (v: string) => void }>, { onValueChange })
          : child
      )}
    </div>
  ),
  RadioGroupItem: ({ value, id, onValueChange }: {
    value: string;
    id: string;
    onValueChange?: (v: string) => void;
  }) => (
    <input
      type="radio"
      data-testid={`radio-${id}`}
      value={value}
      onChange={() => onValueChange?.(value)}
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
    });
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
});
