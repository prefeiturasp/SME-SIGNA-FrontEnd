import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VisualizarApostilaPage from "./page";
import { useFetchApostilaById } from "@/hooks/useVisualizarApostila";

const pageHeaderSpy = vi.fn();
const resumoPortariaEIndicadoSpy = vi.fn();
const resumoPortariaApostilaSpy = vi.fn();
const customAccordionItemSpy = vi.fn();
const accordionSpy = vi.fn();
const editorSEISpy = vi.fn();
const preencherTemplateSpy = vi.fn();
const formatarRFSpy = vi.fn();
const nameToCamelCaseSpy = vi.fn();
const nameToCamelCaseUeSpy = vi.fn();
const formatarDataSpy = vi.fn();

const useParamsMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useVisualizarApostila", () => ({
  useFetchApostilaById: vi.fn(),
}));

vi.mock("antd", () => ({
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <section data-testid="card">
      <div>{title}</div>
      <div>{children}</div>
    </section>
  ),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: {
    title: string;
    breadcrumbs: Array<{ title: string; href?: string }>;
    showBackButton: boolean;
    createButton?: ReactNode;
  }) => {
    pageHeaderSpy(props);
    return (
      <header data-testid="page-header">
        {props.title}
        {props.createButton}
      </header>
    );
  },
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children, ...props }: { children: ReactNode }) => {
    accordionSpy(props);
    return <div data-testid="accordion">{children}</div>;
  },
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({
    title,
    children,
    ...props
  }: {
    title: string;
    children: ReactNode;
  }) => {
    customAccordionItemSpy({ title, ...props });
    return (
      <article data-testid={`accordion-item-${title}`}>
        <h2>{title}</h2>
        {children}
      </article>
    );
  },
}));

vi.mock(
  "@/components/dashboard/Designacao/ResumoPortariaEServidorIndicado",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      resumoPortariaEIndicadoSpy(props);
      return <div data-testid="resumo-portaria-e-servidor" />;
    },
  }),
);

vi.mock("@/components/dashboard/Designacao/ResumoPortariaApostila", () => ({
  __esModule: true,
  default: (props: { defaultValues: unknown }) => {
    resumoPortariaApostilaSpy(props);
    return <div data-testid="resumo-portaria-apostila" />;
  },
}));

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className} />
  ),
  History: () => <span data-testid="icon-history" />,
}));

vi.mock(
  "@/components/dashboard/EditorTextoSEI/EditorTextoSEI",
  () => ({
    __esModule: true,
    default: (props: { html: string; titulo: string; mostrarBotao: boolean }) => {
      editorSEISpy(props);
      return <div data-testid="editor-sei" />;
    },
    gerarHtmlPortaria: (html: string) => html,
  }),
);

vi.mock("@/utils/portarias/preencherTemplate", () => ({
  preencherTemplate: (...args: [string, Record<string, string>]) =>
    preencherTemplateSpy(...args),
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_APOSTILA: "TEMPLATE-APOSTILA",
}));

vi.mock("@/utils/portarias/formatadores", () => ({
  formatarRF: (value: string) => formatarRFSpy(value),
  nameToCamelCase: (value: string) => nameToCamelCaseSpy(value),
  nameToCamelCaseUe: (value: string) => nameToCamelCaseUeSpy(value),
}));

vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    formatarData: (value: string) => formatarDataSpy(value),
  };
});

type UseFetchApostilaByIdReturn = ReturnType<typeof useFetchApostilaById>;
const mockUseFetchApostilaByIdReturn = ({
  data,
  isLoading,
  error,
}: {
  data: unknown;
  isLoading: boolean;
  error: { message: string } | null;
}): UseFetchApostilaByIdReturn =>
  ({
    data,
    isLoading,
    error,
  }) as unknown as UseFetchApostilaByIdReturn;

describe("VisualizarApostila page", () => {
  const designacaoMock = {
    id: 20,
    tipo: "DESIGNACAO",
    status: "ativa",
    ato_pai_id: null,
    ato_raiz_id: null,
    impedimento_substituicao_detail: null,
    impedimento_substituicao: null,
    impedimento_display: "",
    tipo_vaga_display: "Substituição",
    cargo_vaga_display: "",
    dre_nome: "DRE Centro",
    unidade_proponente: "EMEF Teste",
    dre: "DRE",
    ue: "UE",
    funcionarios_da_unidade: "",
    codigo_hierarquico: "1234",
    indicado_nome_civil: "Nome Civil",
    indicado_nome_servidor: "Servidor & Nome",
    indicado_rf: "1234567",
    indicado_vinculo: 1,
    indicado_cargo_base: "PROFESSOR",
    indicado_codigo_cargo_base: 1,
    indicado_lotacao: "Lotacao I",
    indicado_cargo_sobreposto: "COORDENADOR",
    indicado_codigo_cargo_sobreposto: 2,
    indicado_local_exercicio: "EMEF TESTE",
    indicado_local_servico: "Servico I",
    indicado_categoria: "3",
    titular_nome_civil: "",
    titular_nome_servidor: "",
    titular_rf: "",
    titular_vinculo: 0,
    titular_cargo_base: "",
    titular_codigo_cargo_base: 0,
    titular_lotacao: "",
    titular_cargo_sobreposto: "",
    titular_codigo_cargo_sobreposto: 0,
    titular_local_exercicio: "",
    titular_local_servico: "",
    numero_portaria: "001",
    ano_vigente: "2026",
    sei_numero: "6016.2026/0001-2",
    portaria: "PORTARIA-1",
    doc: "2026-01-11",
    data_inicio: "2026-01-01",
    data_fim: null,
    carater_excepcional: false,
    com_afastamento: false,
    possui_pendencia: false,
    pendencias: "",
    motivo_afastamento: "",
    informacoes_adicionais: "",
    detalhe_para_quadro_de_historico_por_ano: false,
    tipo_vaga: "SUBSTITUICAO",
    cargo_vaga: 0,
    criado_em: "2026-01-01T10:00:00Z",
    apostilas: [],
    insubsistencia: null,
    cessacao: {
      id: 88,
      numero_portaria: "010",
      ano_vigente: "2025",
      sei_numero: "6016.2025/0001-1",
      a_pedido: false,
      remocao: false,
      aposentadoria: false,
      data_cessacao: "2025-10-10",
      doc: "2025-10-11",
      criado_em: "2025-10-11T10:00:00Z",
      status: "cessada",
      ato_pai_id: 70,
      apostilas: [],
      insubsistencia: null,
    },
  };

  const apostilaMock = {
    id: 12,
    numero_portaria: "001",
    tipo: "APOSTILA",
    ato_apostilado: "CESSACAO",
    ato_apostilado_display: "Cessação",
    sei_numero: "6016.2026/0001-2",
    doc: "2026-01-11",
    status: "ativa",
    observacao: "Observação",
    criado_em: "2026-01-01T10:00:00Z",
    designacao: designacaoMock,
    cessacao: designacaoMock.cessacao,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: "12" });
    pushMock.mockReset();
    formatarRFSpy.mockImplementation((value) => `RF-${value}`);
    nameToCamelCaseSpy.mockImplementation((value) => `camel-${value}`);
    nameToCamelCaseUeSpy.mockImplementation((value) => `ue-${value}`);
    formatarDataSpy.mockImplementation((value) => `data-${value}`);
    preencherTemplateSpy.mockImplementation(
      (_template: string, dados: Record<string, string>) => JSON.stringify(dados),
    );
  });

  it("renderiza loading quando consulta está carregando", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: undefined,
      isLoading: true,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    expect(useFetchApostilaById).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza mensagem de erro quando a consulta falha", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: undefined,
      isLoading: false,
      error: { message: "Erro ao carregar" },
    }));

    render(<VisualizarApostilaPage />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("renderiza o conteúdo completo quando há apostila e designação", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: apostilaMock,
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-e-servidor")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-apostila")).toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
    expect(customAccordionItemSpy).toHaveBeenCalledTimes(1);
    expect(accordionSpy).toHaveBeenCalled();
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Detalhes da apostila",
      }),
    );
    expect(resumoPortariaApostilaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: apostilaMock,
      }),
    );
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "PORTARIA",
        mostrarBotao: false,
      }),
    );
  });

  it("navega ao clicar em consultar histórico", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: apostilaMock,
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenCalledWith(
      "/pages/historico-ato-administrativo?id=12&tipo_display=da apostila&numero_portaria=001&servidor_indicado=Servidor & Nome",
    );
  });

  it("não renderiza accordion quando não há designação", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: {
        ...apostilaMock,
        designacao: null,
      },
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
  });

  it("gera HTML inicial com escape, negrito e filtros da apostila", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: {
        ...apostilaMock,
        designacao: {
          ...designacaoMock,
          indicado_nome_servidor: "Servidor & Nome",
        },
      },
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    const dados = preencherTemplateSpy.mock.calls[0][1] as Record<string, string>;

    expect(formatarRFSpy).toHaveBeenCalledWith("1234567");
    expect(nameToCamelCaseSpy).toHaveBeenCalledWith("PROFESSOR");
    expect(nameToCamelCaseUeSpy).toHaveBeenCalledWith("EMEF TESTE");
    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "TEMPLATE-APOSTILA",
      expect.objectContaining({
        nome_indicado: "<strong>Servidor &amp; Nome</strong>",
        portaria_designacao: "010",
        sei_designacao: "6016.2025/0001-1",
        rf: "RF-1234567",
        cargo_base: "camel-PROFESSOR",
        ue: "ue-EMEF TESTE",
      }),
    );
    expect(Object.values(dados)).not.toContain(undefined);
    expect(Object.values(dados)).not.toContain(null);
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("<strong>Servidor &amp; Nome</strong>"),
      }),
    );
  });

  it("usa fallback '-' quando valor da designação vem ausente", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: {
        ...apostilaMock,
        designacao: {
          ...designacaoMock,
          dre_nome: undefined,
          codigo_hierarquico: undefined,
          indicado_vinculo: undefined,
        },
      },
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "TEMPLATE-APOSTILA",
      expect.objectContaining({
        dre: "-",
        eh: "-",
        vinculo: "-",
      }),
    );
  });

  it("usa dados da designação quando ato_apostilado não é CESSACAO", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: {
        ...apostilaMock,
        ato_apostilado: "DESIGNACAO",
      },
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "TEMPLATE-APOSTILA",
      expect.objectContaining({
        portaria_designacao: "001",
        sei_designacao: "6016.2026/0001-2",
      }),
    );
  });

  it("aplica fallbacks quando a fonte de dados da apostila está ausente", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: {
        ...apostilaMock,
        doc: "",
        observacao: null,
        ato_apostilado: "CESSACAO",
        cessacao: undefined,
        designacao: {
          ...designacaoMock,
          indicado_nome_servidor: "",
        },
      },
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "TEMPLATE-APOSTILA",
      expect.objectContaining({
        doc: "",
        ano: "-",
        sei_designacao: "-",
        doc_designacao: "",
        portaria_designacao: "-",
        observacao: "",
        nome_indicado: "",
      }),
    );
  });

  it("aplica fallback '-' nos dados do servidor quando a designação vem vazia", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: {
        ...apostilaMock,
        designacao: {},
      },
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    expect(formatarRFSpy).toHaveBeenCalledWith("-");
    expect(nameToCamelCaseSpy).toHaveBeenCalledWith("-");
    expect(nameToCamelCaseUeSpy).toHaveBeenCalledWith("-");
    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "TEMPLATE-APOSTILA",
      expect.objectContaining({
        rf: "RF--",
        cargo_base: "camel--",
        ue: "ue--",
        cargo: "camel--",
        nome_indicado: "<strong>-</strong>",
      }),
    );
  });

  it("descarta campos indefinidos antes de preencher o template", () => {
    formatarDataSpy.mockReturnValue(undefined);
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: apostilaMock,
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    const dados = preencherTemplateSpy.mock.calls[0][1] as Record<string, string>;
    expect(dados).not.toHaveProperty("doc");
  });

  it("mantém editor com html vazio quando não há apostila", () => {
    vi.mocked(useFetchApostilaById).mockReturnValue(mockUseFetchApostilaByIdReturn({
      data: undefined,
      isLoading: false,
      error: null,
    }));

    render(<VisualizarApostilaPage />);

    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "",
      }),
    );
  });
});
