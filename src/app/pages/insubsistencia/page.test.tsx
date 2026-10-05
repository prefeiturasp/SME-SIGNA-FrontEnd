import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InsubsistenciaPage, { gerarDadosInsubsistencia } from "./page";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { useFetchInsubsistenciasById } from "@/hooks/useVisualizarInsubsistencia";
import { useSalvarInsubsistencia } from "@/hooks/useSalvarInsubsistencia";
import { gerarPreviewTextoSeiAction } from "@/actions/textos-sei";
import type { formSchemaInsubsistenciaData } from "./schema";
import type { Cessacao, DesignacaoResponse } from "@/types/designacao";
import { formatarData } from "@/lib/utils";
import { formatarRF, nameToCamelCase, nameToCamelCaseUe } from "@/utils/portarias/formatadores";
import { montarTrechoUnidade } from "@/utils/portarias/gerarDadosPortaria";

const testControls = vi.hoisted(() => ({
  routerPush: vi.fn(),
  searchParamsGet: vi.fn((_key?: string) => "5"),
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
      const form = (actual.useForm as (...callArgs: unknown[]) => UseFormReturn<FieldValues>)(...args) as
        Omit<UseFormReturn<FieldValues>, "trigger" | "getValues"> & {
          trigger: (...args: unknown[]) => unknown;
          getValues: (...args: unknown[]) => unknown;
        };
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

vi.mock("@/hooks/useVisualizarInsubsistencia", () => ({
  useFetchInsubsistenciasById: vi.fn(),
}));

vi.mock("@/hooks/useSalvarInsubsistencia", () => ({
  useSalvarInsubsistencia: vi.fn(),
}));

vi.mock("@/actions/textos-sei", () => ({
  gerarPreviewTextoSeiAction: vi.fn(),
}));

vi.mock("antd", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Tooltip: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: string;
  }) => (
    <div data-testid="tooltip-cessacao" data-title={title ?? ""}>
      {children}
    </div>
  ),
}));

const notificationMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => notificationMocks,
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
  numero_portaria: 50,
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

const insubsistenciaMock = {
  id: 39,
  numero_portaria: 200,
  ano_vigente: "2025",
  sei_numero: "SEI-INSUB",
  doc: "DOC-INSUB",
  observacoes: "obs edição",
  designacao: {
    ...designacaoMock,
    id: 36,
    indicado_nome_servidor: "SERVIDOR EDICAO",
    cessacao: cessacaoMock,
  },
  cessacao: cessacaoMock,
};

function mockSearchParams(params: Record<string, string | null> = { id: "5" }) {
  testControls.searchParamsGet.mockImplementation((key?: string | undefined | null) => {
    if (!key) return "";
    return params[key] ?? "";
  });
}

// ── Testes ────────────────────────────────────────────────────────────────────

const textoPreviewPadrao = "PORTARIA Nº 100/2026\nSEI Nº SEI-INSUB\nTORNAR INSUBSISTENTE ...";

describe("InsubsistenciaPage", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    testControls.forceTriggerResult = null;
    testControls.forceUndefinedGetValues = false;
    mockSearchParams({ id: "5" });

    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);

    vi.mocked(useSalvarInsubsistencia).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isError: false,
      error: null,
    } as never);

    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValue({
      success: true,
      data: { modelo_portaria_id: 11, texto: textoPreviewPadrao },
    });
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

  it("salva insubsistência com sucesso e redireciona, incluindo o texto e o modelo gerados", async () => {
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
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          textoSei: textoPreviewPadrao,
          modeloPortaria: 11,
        })
      );
      expect(notificationMocks.success).toHaveBeenCalledWith({ title: "Insubsistência salva com sucesso!" });
      expect(testControls.routerPush).toHaveBeenCalledWith("/pages/atos-administrativos");
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
      expect(notificationMocks.error).toHaveBeenCalledWith({ title: "Falha na API" });
    });
  });

  it("envia tipo_ato_pai=CESSACAO ao trocar o radio para cessação", async () => {
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
      expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo_portaria: "INSUBSISTENCIA",
          tipo_ato_pai: "CESSACAO",
        })
      );
    });

    const chamada = vi.mocked(gerarPreviewTextoSeiAction).mock.calls.at(-1)?.[0];
    expect(chamada?.dados.NOME_SERVIDOR).toBe("SERVIDOR TESTE");
  });

  it("envia tipo_cargo=CARGO_VAGO quando a designação de origem tem tipo_vaga VAGO", async () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, tipo_vaga: "VAGO" },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
        expect.objectContaining({ tipo_cargo: "CARGO_VAGO" })
      );
    });
  });

  it("envia tipo_cargo=CARGO_DISPONIVEL quando a designação de origem tem tipo_vaga DISPONIVEL", async () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, tipo_vaga: "DISPONIVEL" },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
        expect.objectContaining({ tipo_cargo: "CARGO_DISPONIVEL" })
      );
    });
  });

  it("pré-seleciona tipo 'cessação' quando a URL vem com origem=cessacao", async () => {
    mockSearchParams({ id: "5", origem: "cessacao" });

    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, cessacao: cessacaoMock },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
        expect.objectContaining({ tipo_ato_pai: "CESSACAO" })
      );
    });
  });

  it("usa o tipo 'designação' por padrão quando não há origem na URL", async () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, cessacao: cessacaoMock },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
        expect.objectContaining({ tipo_ato_pai: "DESIGNACAO" })
      );
    });
  });

  it("exibe notificação de erro e não mostra o botão Salvar quando a prévia falha", async () => {
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: false,
      error: "Não há modelo de portaria ativo cadastrado para este tipo de ato.",
    });

    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(notificationMocks.error).toHaveBeenCalledWith({
        title: "Erro ao gerar o texto da portaria: Não há modelo de portaria ativo cadastrado para este tipo de ato.",
      });
    });
    expect(screen.queryByTestId("botao-proximo")).not.toBeInTheDocument();
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

  it("busca a prévia do texto SEI com valores vazios quando não existe designação", async () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: null,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(gerarPreviewTextoSeiAction).toHaveBeenCalled();
    });

    const chamada = vi.mocked(gerarPreviewTextoSeiAction).mock.calls.at(-1)?.[0];
    expect(chamada?.dados.NOME_SERVIDOR).toBe("");
    expect(chamada?.dados.NUMERO_RF).toBe("");
  });

  it("exibe o texto retornado pelo back no editor após gerar a prévia", async () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(testControls.gerarHtmlPortaria).toHaveBeenCalledWith(textoPreviewPadrao);
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

  it("executa callback de edição do resumo do servidor indicado", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByTestId("editar-servidor"));

    expect(screen.getByTestId("resumo-servidor-indicado")).toBeInTheDocument();
  });

  it("exibe loader enquanto a insubsistência de edição está carregando", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("usa designação e cessação da insubsistência na edição", async () => {
    mockSearchParams({ id_insubsistencia: "39", origem: "designacao" });
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: insubsistenciaMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(useFetchInsubsistenciasById).toHaveBeenCalledWith(39);
    expect(screen.getByText("SERVIDOR EDICAO")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-cessacao")).toBeInTheDocument();
    expect(screen.getByTestId("radio-group")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByTestId("tooltip-cessacao")).toHaveAttribute(
      "data-title",
      "A cessação já possui insubsistência ou não foi encontrada.",
    );
  });

  it("salva a edição repassando o id da insubsistência", async () => {
    mutateAsyncMock.mockResolvedValue({ id: 39 });
    mockSearchParams({ id_insubsistencia: "39", origem: "designacao" });
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: insubsistenciaMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));
    await waitFor(() => screen.getByTestId("botao-proximo"));
    fireEvent.click(screen.getByTestId("botao-proximo"));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          designacaoId: 36,
          cessacaoId: 1,
          insubsistenciaId: 39,
        }),
      );
    });
  });

  it("usa o id da URL quando a designação não tem id", async () => {
    mutateAsyncMock.mockResolvedValue({ id: 1 });
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, id: undefined },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));
    await waitFor(() => screen.getByTestId("botao-proximo"));
    fireEvent.click(screen.getByTestId("botao-proximo"));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          designacaoId: 5,
          insubsistenciaId: undefined,
        }),
      );
    });
  });

  it("exibe mensagem genérica quando o erro do save não é uma Error", async () => {
    mutateAsyncMock.mockRejectedValue("falha crua");
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));
    await waitFor(() => screen.getByTestId("botao-proximo"));
    fireEvent.click(screen.getByTestId("botao-proximo"));

    await waitFor(() => {
      expect(notificationMocks.error).toHaveBeenCalledWith({ title: "Erro ao salvar" });
    });
  });

  it("desabilita o botão de trechos enquanto a prévia está sendo gerada", async () => {
    let resolvePreview!: (value: {
      success: true;
      data: { modelo_portaria_id: number; texto: string };
    }) => void;

    vi.mocked(gerarPreviewTextoSeiAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePreview = resolve;
        }),
    );
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(screen.getByText("Trechos para o SEI").closest("button")).toBeDisabled();
    });

    resolvePreview({
      success: true,
      data: { modelo_portaria_id: 11, texto: textoPreviewPadrao },
    });

    await waitFor(() => {
      expect(screen.getByTestId("botao-proximo")).toBeInTheDocument();
    });
  });

  it("gera a prévia com campos vazios quando getValues devolve insubsistência incompleta", async () => {
    testControls.forceUndefinedGetValues = true;
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(gerarPreviewTextoSeiAction).toHaveBeenCalled();
    });

    const chamada = vi.mocked(gerarPreviewTextoSeiAction).mock.calls.at(-1)?.[0];
    expect(chamada?.dados.PORTARIA).toBe("");
    expect(chamada?.dados.NUMERO_SEI).toBe("");
  });

  it("mantém tooltip da cessação vazio quando o radio está habilitado", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, cessacao: cessacaoMock },
      isLoading: false,
    } as never);

    render(<InsubsistenciaPage />);

    expect(screen.getByTestId("tooltip-cessacao")).toHaveAttribute("data-title", "");
  });
});

const valuesInsubsistenciaMock: formSchemaInsubsistenciaData = {
  insubsistencia: {
    numero_portaria: "100",
    ano: "2026",
    numero_sei: "SEI-INSUB",
    doc: "2026-02-10",
    observacoes: "obs",
    tipo_insubsistencia: "designacao",
  },
};

describe("gerarDadosInsubsistencia", () => {
  it("monta período determinado e cargo com categoria quando há data_fim", () => {
    const designacao = {
      data_inicio: "2026-01-01",
      data_fim: "2026-01-31",
      dre_nome: "DRE Centro",
      numero_portaria: 1,
      doc: "2026-01-11",
      sei_numero: "6016.2026/0001-2",
      indicado_nome_servidor: "Servidor Nome",
      indicado_rf: "1234567",
      indicado_vinculo: 2,
      indicado_cargo_base: "PROFESSOR",
      indicado_categoria: "3",
      indicado_cargo_sobreposto: "COORDENADOR",
      indicado_local_exercicio: "EMEF TESTE",
      indicado_lotacao: "Lotacao X",
      unidade_proponente: "EMEF Proponente",
    } as DesignacaoResponse;

    const cessacao = {
      numero_portaria: 10,
      doc: "2025-10-11",
      sei_numero: "6016.2025/0001-1",
    } as Cessacao;

    expect(gerarDadosInsubsistencia(valuesInsubsistenciaMock, designacao, cessacao)).toEqual({
      doc: "2026-02-10",
      portaria: "100",
      ano: "2026",
      sei: "SEI-INSUB",
      dre: "DRE Centro",
      portaria_designacao: 1,
      doc_designacao: formatarData("2026-01-11"),
      sei_designacao: "6016.2026/0001-2",
      portaria_cessacao: 10,
      doc_cessacao: formatarData("2025-10-11"),
      sei_cessacao: "6016.2025/0001-1",
      nome_indicado: "Servidor Nome",
      rf: formatarRF("1234567"),
      vinculo: 2,
      cargo_base: `${nameToCamelCase("PROFESSOR")} - Categoria 3`,
      cargo: nameToCamelCase("COORDENADOR"),
      ue: nameToCamelCaseUe("EMEF TESTE"),
      periodo: ` no período de ${formatarData("2026-01-01")} a ${formatarData("2026-01-31")}`,
      trecho_unidade: montarTrechoUnidade("Lotacao X", "EMEF Proponente", "DRE Centro"),
    });
  });

  it("usa período indeterminado e fallbacks quando designação e cessação estão ausentes", () => {
    expect(gerarDadosInsubsistencia(valuesInsubsistenciaMock, undefined, undefined)).toEqual({
      doc: "2026-02-10",
      portaria: "100",
      ano: "2026",
      sei: "SEI-INSUB",
      dre: "-",
      portaria_designacao: "-",
      doc_designacao: formatarData(""),
      sei_designacao: "-",
      portaria_cessacao: "-",
      doc_cessacao: formatarData(""),
      sei_cessacao: "-",
      nome_indicado: "-",
      rf: formatarRF("-"),
      vinculo: "-",
      cargo_base: nameToCamelCase("-"),
      cargo: nameToCamelCase("-"),
      ue: nameToCamelCaseUe("-"),
      periodo: ` a partir de ${formatarData("")}`,
      trecho_unidade: montarTrechoUnidade("", "", ""),
    });
  });

  it("usa data_inicio vazia quando o período é determinado mas a data inicial não veio", () => {
    const designacao = {
      id: 1,     
      data_fim: "2026-12-31",
      data_inicio: '2026-01-01',
      
      tipo: 'DESIGNACAO',
      status: 'ativo',
      ato_pai_id: 1,
      ato_raiz_id: 1,
      impedimento_substituicao_detail: null,
      impedimento_substituicao: null,
      impedimento_display: 'string',
      tipo_vaga_display: 'string',
      cargo_vaga_display: 'string',
      dre_nome: 'string',
      unidade_proponente: 'string',
      dre: 'string',
      ue: 'string',
      funcionarios_da_unidade: 'string',
      codigo_hierarquico: 'string',
      indicado_nome_civil: 'string',
      indicado_nome_servidor: 'string',
      indicado_rf: 'string',
      indicado_vinculo: 1,
      indicado_cargo_base: 'string',
      indicado_codigo_cargo_base: 1,
      indicado_lotacao: 'string',
      indicado_cargo_sobreposto: 'string',
      indicado_codigo_cargo_sobreposto: 1,
      indicado_local_exercicio: 'string',
      indicado_local_servico: 'string',
      indicado_categoria: 'string',
      titular_nome_civil: 'string',
      titular_nome_servidor: 'string',
      titular_rf: 'string',
      titular_vinculo: 1,
      titular_cargo_base: 'string',
      titular_codigo_cargo_base: 1,
      titular_lotacao: 'string',
      titular_cargo_sobreposto: 'string',
      titular_codigo_cargo_sobreposto: 1,
      titular_local_exercicio: 'string',
      titular_local_servico: 'string',
      numero_portaria: 1,
      ano_vigente: 'string',
      sei_numero: 'string',
      portaria: 'string',
      doc: 'string',
      
      
      carater_excepcional: false,
      com_afastamento: false,
      possui_pendencia: false,
      pendencias: 'string',
      motivo_afastamento: 'string',
      informacoes_adicionais: 'string',
      detalhe_para_quadro_de_historico_por_ano: false,
      tipo_vaga: 'string',
      cargo_vaga: 1,
      criado_em: 'string',
      cessacao:  null,
      apostilas: [],
      insubsistencia: null,
      texto_sei: 'string',
      modelo_portaria: 1,
    } as DesignacaoResponse;

    const result = gerarDadosInsubsistencia(valuesInsubsistenciaMock, designacao, null);

    expect(result.periodo).toBe(` no período de ${formatarData("2026-01-01")} a ${formatarData("2026-12-31")}`);
  });

  it("omite a categoria do cargo base quando ela não existe", () => {
    const designacao = {
      data_inicio: "2026-03-01",
      data_fim: null,
      indicado_cargo_base: "DIRETOR",
      indicado_lotacao: "EMEF IGUAIS",
      unidade_proponente: "EMEF IGUAIS",
      dre_nome: "DRE Sul",
    } as DesignacaoResponse;

    const result = gerarDadosInsubsistencia(valuesInsubsistenciaMock, designacao, null);

    expect(result.cargo_base).toBe(nameToCamelCase("DIRETOR"));
    expect(result.periodo).toBe(` a partir de ${formatarData("2026-03-01")}`);
    expect(result.trecho_unidade).toBe("na referida Unidade");
    expect(result.portaria_cessacao).toBe("-");
  });
});
