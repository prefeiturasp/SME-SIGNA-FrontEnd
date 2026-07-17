import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VisualizarCessacaoPage from "./page";
import { useFetchCessacaoById } from "@/hooks/useVisualizarCessacao";

const pageHeaderSpy = vi.fn();
const resumoPortariaDesignacaoSpy = vi.fn();
const resumoPortariaCessacaoSpy = vi.fn();
const resumoServidorSpy = vi.fn();
const customAccordionItemSpy = vi.fn();
const accordionSpy = vi.fn();
const editorSEISpy = vi.fn();
const preencherTemplateSpy = vi.fn();
const montarTrechoUnidadeSpy = vi.fn();
const formatDateSpy = vi.fn();
const formatarRFSpy = vi.fn();
const nameToCamelCaseSpy = vi.fn();
const nameToCamelCaseUeSpy = vi.fn();

const useParamsMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useVisualizarCessacao", () => ({
  useFetchCessacaoById: vi.fn(),
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

vi.mock("@/components/dashboard/Designacao/ResumoPortariaDesigacao", () => ({
  __esModule: true,
  default: (props: unknown) => {
    resumoPortariaDesignacaoSpy(props);
    return <div data-testid="resumo-portaria-designacao" />;
  },
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaCessacao", () => ({
  __esModule: true,
  default: (props: unknown) => {
    resumoPortariaCessacaoSpy(props);
    return <div data-testid="resumo-portaria-cessacao" />;
  },
}));

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      resumoServidorSpy(props);
      return <div data-testid="resumo-servidor" />;
    },
  }),
);

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

vi.mock("@/utils/portarias/gerarDadosPortaria", () => ({
  montarTrechoUnidade: (...args: [string, string, string]) =>
    montarTrechoUnidadeSpy(...args),
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_CESSACAO: "TEMPLATE-CESSACAO",
}));

vi.mock("@/utils/formatDate", () => ({
  formatDate: (value: string) => formatDateSpy(value),
}));

vi.mock("@/utils/portarias/formatadores", () => ({
  formatarRF: (value: string) => formatarRFSpy(value),
  nameToCamelCase: (value: string) => nameToCamelCaseSpy(value),
  nameToCamelCaseUe: (value: string) => nameToCamelCaseUeSpy(value),
}));

describe("VisualizarCessacao page", () => {
  const designacaoBaseMock = {
    dre_nome: "DRE Centro",
    unidade_proponente: "EMEF Teste",
    numero_portaria: "345",
    ano_vigente: "2025",
    sei_numero: "6016.2025/0001-9",
    doc: "2025-05-10",
    data_inicio: "2025-06-01",
    data_fim: null,
    carater_excepcional: false,
    impedimento_display: "Licença",
    motivo_afastamento: "Motivo",
    pendencias: "Sem pendências",
    com_afastamento: true,
    indicado_rf: "123456",
    indicado_nome_servidor: "Servidor Indicado",
    indicado_nome_civil: "Servidor Civil",
    indicado_vinculo: 1,
    indicado_lotacao: "Lotação Indicada",
    indicado_cargo_base: "PROFESSOR",
    indicado_cargo_sobreposto: "COORDENADOR",
    indicado_codigo_cargo_base: 11,
    indicado_codigo_cargo_sobreposto: 22,
    indicado_local_servico: "Serviço Indicado",
    indicado_local_exercicio: "EMEF TESTE",
    indicado_categoria: "3",
  };

  const cessacaoBaseMock = {
    id: 12,
    numero_portaria: "001",
    ano_vigente: "2026",
    sei_numero: "6016.2026/0001-2",
    a_pedido: true,
    remocao: false,
    aposentadoria: false,
    data_cessacao: "2026-01-10",
    doc: "2026-01-11",
    criado_em: "2026-01-01T10:00:00Z",
    status: "cessada",
    ato_pai_id: 10,
    ato_raiz_id: 11,
    tipo: "CESSACAO",
    apostilas: [],
    insubsistencia: null,
    designacao: designacaoBaseMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: "12" });
    pushMock.mockReset();
    montarTrechoUnidadeSpy.mockReturnValue("trecho-unidade");
    formatDateSpy.mockImplementation((value) => `data-${value}`);
    formatarRFSpy.mockImplementation((value) => `RF-${value}`);
    nameToCamelCaseSpy.mockImplementation((value) => `camel-${value}`);
    nameToCamelCaseUeSpy.mockImplementation((value) => `ue-${value}`);
    preencherTemplateSpy.mockImplementation(
      (_template: string, dados: Record<string, string>) => JSON.stringify(dados),
    );
  });

  it("renderiza loading quando consulta está carregando", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(useFetchCessacaoById).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza mensagem de erro quando a consulta falha", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Erro ao carregar" },
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("renderiza o conteúdo quando há cessação e designação", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: cessacaoBaseMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-cessacao")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-servidor")).toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
    expect(customAccordionItemSpy).toHaveBeenCalledTimes(3);
    expect(accordionSpy).toHaveBeenCalled();
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Detalhes da cessação",
      }),
    );
  });

  it("navega ao clicar em consultar histórico", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: cessacaoBaseMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);
    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenCalledWith(
      "/pages/historico-ato-administrativo?id=12&tipo=CESSACAO&tipo_display=Cessação&ato_raiz_id=11&numero_portaria=001&servidor_indicado=Servidor Indicado",
    );
  });

  it("não renderiza accordion quando não há designação", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: {
        ...cessacaoBaseMock,
        designacao: null,
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
  });

  it("gera HTML inicial com escape, negrito e sem nulos", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: {
        ...cessacaoBaseMock,
        designacao: {
          ...designacaoBaseMock,
          indicado_nome_servidor: "Servidor & Nome",
        },
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    const dadosPassados = preencherTemplateSpy.mock.calls[0][1] as Record<string, string>;

    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "TEMPLATE-CESSACAO",
      expect.objectContaining({
        portaria: "<strong>001</strong>",
        ano: "<strong>2026</strong>",
        sei: "<strong>6016.2026/0001-2</strong>",
        nome_indicado: "<strong>Servidor &amp; Nome</strong>",
        rf: "RF-123456",
      }),
    );
    expect(montarTrechoUnidadeSpy).toHaveBeenCalledWith(
      "Lotação Indicada",
      "EMEF Teste",
      "DRE Centro",
    );
    expect(Object.values(dadosPassados)).not.toContain(undefined);
    expect(Object.values(dadosPassados)).not.toContain(null);
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("<strong>Servidor &amp; Nome</strong>"),
      }),
    );
  });

  it("envia categoria e fallback de códigos ao resumo do servidor", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: {
        ...cessacaoBaseMock,
        designacao: {
          ...designacaoBaseMock,
          indicado_categoria: "5",
          indicado_codigo_cargo_base: undefined,
          indicado_codigo_cargo_sobreposto: undefined,
        },
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(resumoServidorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          categoria: "5",
          cd_cargo_base: 0,
          cd_cargo_sobreposto_funcao_atividade: 0,
        }),
      }),
    );
  });
});
/*
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VisualizarCessacaoPage from "./page";
import { useFetchCessacaoById } from "@/hooks/useVisualizarCessacao";

const pageHeaderSpy = vi.fn();
const resumoPortariaDesignacaoSpy = vi.fn();
const resumoPortariaCessacaoSpy = vi.fn();
const resumoServidorSpy = vi.fn();
const customAccordionItemSpy = vi.fn();
const accordionSpy = vi.fn();
const editorSEISpy = vi.fn();
const preencherTemplateSpy = vi.fn();
const montarTrechoUnidadeSpy = vi.fn();
const formatDateSpy = vi.fn();
const formatarRFSpy = vi.fn();
const nameToCamelCaseSpy = vi.fn();
const nameToCamelCaseUeSpy = vi.fn();

const useParamsMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useVisualizarCessacao", () => ({
  useFetchCessacaoById: vi.fn(),
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

vi.mock("@/components/dashboard/Designacao/ResumoPortariaDesigacao", () => ({
  __esModule: true,
  default: (props: unknown) => {
    resumoPortariaDesignacaoSpy(props);
    return <div data-testid="resumo-portaria-designacao" />;
  },
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaCessacao", () => ({
  __esModule: true,
  default: (props: unknown) => {
    resumoPortariaCessacaoSpy(props);
    return <div data-testid="resumo-portaria-cessacao" />;
  },
}));

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      resumoServidorSpy(props);
      return <div data-testid="resumo-servidor" />;
    },
  }),
);

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

vi.mock("@/utils/portarias/gerarDadosPortaria", () => ({
  montarTrechoUnidade: (...args: [string, string, string]) =>
    montarTrechoUnidadeSpy(...args),
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_CESSACAO: "TEMPLATE-CESSACAO",
}));

vi.mock("@/utils/formatDate", () => ({
  formatDate: (value: string) => formatDateSpy(value),
}));

vi.mock("@/utils/portarias/formatadores", () => ({
  formatarRF: (value: string) => formatarRFSpy(value),
  nameToCamelCase: (value: string) => nameToCamelCaseSpy(value),
  nameToCamelCaseUe: (value: string) => nameToCamelCaseUeSpy(value),
}));

describe("VisualizarCessacao page", () => {
  const designacaoBaseMock = {
    dre_nome: "DRE Centro",
    unidade_proponente: "EMEF Teste",
    numero_portaria: "345",
    ano_vigente: "2025",
    sei_numero: "6016.2025/0001-9",
    doc: "2025-05-10",
    data_inicio: "2025-06-01",
    data_fim: null,
    carater_excepcional: false,
    impedimento_display: "Licença",
    motivo_afastamento: "Motivo",
    pendencias: "Sem pendências",
    com_afastamento: true,
    indicado_rf: "123456",
    indicado_nome_servidor: "Servidor Indicado",
    indicado_nome_civil: "Servidor Civil",
    indicado_vinculo: 1,
    indicado_lotacao: "Lotação Indicada",
    indicado_cargo_base: "PROFESSOR",
    indicado_cargo_sobreposto: "COORDENADOR",
    indicado_codigo_cargo_base: 11,
    indicado_codigo_cargo_sobreposto: 22,
    indicado_local_servico: "Serviço Indicado",
    indicado_local_exercicio: "EMEF TESTE",
    indicado_categoria: "3",
  };

  const cessacaoBaseMock = {
    id: 12,
    numero_portaria: "001",
    ano_vigente: "2026",
    sei_numero: "6016.2026/0001-2",
    a_pedido: true,
    remocao: false,
    aposentadoria: false,
    data_cessacao: "2026-01-10",
    doc: "2026-01-11",
    criado_em: "2026-01-01T10:00:00Z",
    status: "cessada",
    ato_pai_id: 10,
    ato_raiz_id: 11,
    tipo: "CESSACAO",
    apostilas: [],
    insubsistencia: null,
    designacao: designacaoBaseMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: "12" });
    pushMock.mockReset();
    montarTrechoUnidadeSpy.mockReturnValue("trecho-unidade");
    formatDateSpy.mockImplementation((value) => `data-${value}`);
    formatarRFSpy.mockImplementation((value) => `RF-${value}`);
    nameToCamelCaseSpy.mockImplementation((value) => `camel-${value}`);
    nameToCamelCaseUeSpy.mockImplementation((value) => `ue-${value}`);
    preencherTemplateSpy.mockImplementation(
      (_template: string, dados: Record<string, string>) => JSON.stringify(dados),
    );
  });

  it("renderiza loading quando consulta está carregando", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(useFetchCessacaoById).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza mensagem de erro quando a consulta falha", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Erro ao carregar" },
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("renderiza o conteúdo quando há cessação e designação", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: cessacaoBaseMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-cessacao")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-servidor")).toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
    expect(customAccordionItemSpy).toHaveBeenCalledTimes(3);
    expect(accordionSpy).toHaveBeenCalled();
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Detalhes da cessação",
      }),
    );
  });

  it("navega ao clicar em consultar histórico", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: cessacaoBaseMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);
    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenCalledWith(
      "/pages/historico-ato-administrativo?id=12&tipo=CESSACAO&tipo_display=Cessação&ato_raiz_id=11&numero_portaria=001&servidor_indicado=Servidor Indicado",
    );
  });

  it("não renderiza accordion quando não há designação", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: {
        ...cessacaoBaseMock,
        designacao: null,
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
  });

  it("gera HTML inicial com escape, negrito e sem nulos", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: {
        ...cessacaoBaseMock,
        designacao: {
          ...designacaoBaseMock,
          indicado_nome_servidor: "Servidor & Nome",
        },
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    const dadosPassados = preencherTemplateSpy.mock.calls[0][1] as Record<string, string>;

    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "TEMPLATE-CESSACAO",
      expect.objectContaining({
        portaria: "<strong>001</strong>",
        ano: "<strong>2026</strong>",
        sei: "<strong>6016.2026/0001-2</strong>",
        nome_indicado: "<strong>Servidor &amp; Nome</strong>",
        rf: "RF-123456",
      }),
    );
    expect(montarTrechoUnidadeSpy).toHaveBeenCalledWith(
      "Lotação Indicada",
      "EMEF Teste",
      "DRE Centro",
    );
    expect(Object.values(dadosPassados)).not.toContain(undefined);
    expect(Object.values(dadosPassados)).not.toContain(null);
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("<strong>Servidor &amp; Nome</strong>"),
      }),
    );
  });

  it("envia categoria e fallback de códigos ao resumo do servidor", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue({
      data: {
        ...cessacaoBaseMock,
        designacao: {
          ...designacaoBaseMock,
          indicado_categoria: "5",
          indicado_codigo_cargo_base: undefined,
          indicado_codigo_cargo_sobreposto: undefined,
        },
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarCessacaoPage />);

    expect(resumoServidorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          categoria: "5",
          cd_cargo_base: 0,
          cd_cargo_sobreposto_funcao_atividade: 0,
        }),
      }),
    );
  });
});
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VisualizarDesignacao from "./page";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";

const pageHeaderSpy = vi.fn();
const resumoPesquisaSpy = vi.fn();
const resumoPortariaSpy = vi.fn();
const resumoServidorSpy = vi.fn();
const customAccordionItemSpy = vi.fn();
const accordionSpy = vi.fn();
const infoItemSpy = vi.fn();
const editorSEISpy = vi.fn();
const preencherTemplateSpy = vi.fn();
const gerarDadosPortariaSpy = vi.fn();
const informacoesAdicionaisSpy = vi.fn();

const useParamsMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useVisualizarDesignacoes", () => ({
  useFetchDesignacoesById: vi.fn(),
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
    icon?: ReactNode;
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

vi.mock("@/components/dashboard/Designacao/ResumoPesquisaDaUnidade", () => ({
  __esModule: true,
  default: (props: { defaultValues: unknown; isLoading: boolean }) => {
    resumoPesquisaSpy(props);
    return <div data-testid="resumo-unidade" />;
  },
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaDesigacao", () => ({
  __esModule: true,
  default: (props: { defaultValues: unknown; isLoading: boolean }) => {
    resumoPortariaSpy(props);
    return <div data-testid="resumo-portaria" />;
  },
}));

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      resumoServidorSpy(props);
      return <div data-testid="resumo-servidor" />;
    },
  })
);

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: () => <span data-testid="icon-designacao" />,
}));

vi.mock("@/components/ui/info-item", () => ({
  InfoItem: (props: { label: string; value?: string | number | null }) => {
    infoItemSpy(props);
    return (
      <div data-testid="info-item">
        {props.label}: {props.value}
      </div>
    );
  },
}));

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className} />
  ),
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  History: () => <span data-testid="icon-history" />,
  X: () => <span data-testid="icon-close" />,
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
  })
);

vi.mock("@/utils/portarias/preencherTemplate", () => ({
  preencherTemplate: (...args: [string, Record<string, string>]) => preencherTemplateSpy(...args),
}));

vi.mock("@/utils/portarias/gerarDadosPortaria", () => ({
  gerarDadosPortaria: (...args: unknown[]) => gerarDadosPortariaSpy(...args),
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_DESIGNACAO: "",
}));

vi.mock(
  "@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      informacoesAdicionaisSpy(props);
      return <div data-testid="informacoes-adicionais" />;
    },
  })
);

describe("VisualizarDesignacao page", () => {
  const designacaoMock = {
    dre_nome: "DRE Centro",
    unidade_proponente: "EMEF Teste",
    codigo_hierarquico: "1234",
    numero_portaria: "001",
    ano_vigente: "2026",
    sei_numero: "6016.2026/0001-2",
    doc: "DOC X",
    data_inicio: "2026-01-01",
    data_fim: null,
    carater_excepcional: false,
    impedimento_substituicao: null,
    impedimento_display: "",
    motivo_afastamento: "Motivo",
    pendencias: "Nenhuma",
    tipo_vaga: "SUBSTITUICAO",
    tipo_vaga_display: "Substituição",
    cargo_vaga: null,
    cargo_vaga_display: "",
    indicado_rf: "123456",
    indicado_nome_servidor: "INDICADO",
    indicado_nome_civil: "Indicado Civil",
    indicado_vinculo: 1,
    indicado_lotacao: "Lotacao I",
    indicado_cargo_base: "Cargo I",
    indicado_cargo_sobreposto: "Sobreposto I",
    indicado_codigo_cargo_base: 1,
    indicado_codigo_cargo_sobreposto: 2,
    indicado_local_servico: "Servico I",
    indicado_local_exercicio: "Exercicio I",
    titular_rf: "654321",
    titular_nome_servidor: "TITULAR",
    titular_nome_civil: "Titular Civil",
    titular_vinculo: 2,
    titular_lotacao: "Lotacao T",
    titular_cargo_base: "Cargo T",
    titular_cargo_sobreposto: "Sobreposto T",
    titular_codigo_cargo_base: 3,
    titular_codigo_cargo_sobreposto: 4,
    titular_local_servico: "Servico T",
    titular_local_exercicio: "Exercicio T",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: "12" });
    pushMock.mockReset();
    preencherTemplateSpy.mockReturnValue("");
    gerarDadosPortariaSpy.mockReturnValue({});
  });

  it("renderiza loading quando consulta está carregando", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(useFetchDesignacoesById).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza mensagem de erro quando a consulta falha", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Erro ao carregar" },
    } as never);

    render(<VisualizarDesignacao />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("renderiza o conteúdo completo quando há designação", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-unidade")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria")).toBeInTheDocument();
    expect(screen.getAllByTestId("resumo-servidor")).toHaveLength(2);
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
    expect(screen.getByTestId("informacoes-adicionais")).toBeInTheDocument();
    expect(customAccordionItemSpy.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(accordionSpy).toHaveBeenCalled();
    expect(pageHeaderSpy).toHaveBeenCalled();
    expect(resumoPesquisaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          lotacao: "EMEF Teste",
          dre: "DRE Centro",
          estrutura_hierarquica: "1234",
        },
      })
    );
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "PORTARIA",
        mostrarBotao: false,
      })
    );
    expect(informacoesAdicionaisSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        disableFields: true,
        onChangeDescricao: expect.any(Function),
        onValueChangeDetalheParaQuadroDeHistoricoPorAno: expect.any(Function),
      })
    );
  });

  it("navega ao clicar nos botões do cabeçalho", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenNthCalledWith(1, "/pages/historico-ato-administrativo?id=12&tipo=undefined&tipo_display=Designação&ato_raiz_id=undefined&numero_portaria=001&servidor_indicado=INDICADO");
  });

  it("aplica fallback vazio no resumo da unidade quando campos vêm indefinidos", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        unidade_proponente: undefined,
        dre_nome: undefined,
        codigo_hierarquico: undefined,
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(resumoPesquisaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          lotacao: "",
          dre: "",
          estrutura_hierarquica: "",
        },
      })
    );
  });

  it("não renderiza o accordion quando não está loading e não há designação", () => {
    useParamsMock.mockReturnValue({ id: "0" });
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(useFetchDesignacoesById).toHaveBeenCalledWith(0);
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it('renderiza "Cargo Disponível" quando tipo_vaga é VAGO', () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        tipo_vaga: "VAGO",
        cargo_vaga_display: "Professor Adjunto",
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(screen.getByText("Cargo Disponível")).toBeInTheDocument();
    expect(screen.getByTestId("info-item")).toHaveTextContent(
      "Nome do Cargo Disponível: Professor Adjunto"
    );
    expect(infoItemSpy).toHaveBeenCalledWith({
      label: "Nome do Cargo Disponível",
      value: "Professor Adjunto",
    });
    expect(screen.getAllByTestId("resumo-servidor")).toHaveLength(1);
  });

  it("gera html da portaria com escape, negrito e filtro de nulos", () => {
    gerarDadosPortariaSpy.mockReturnValue({
      nome_indicado: "Servidor & Nome",
      autoridade: "Autoridade > Direção",
      portaria: "Portaria 123",
      sei: "SEI 999",
      campo_nulo: null,
      campo_undefined: undefined,
      descricao: "Texto <b>não html</b>",
    });
    preencherTemplateSpy.mockImplementation((_template, dados) => JSON.stringify(dados));

    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(gerarDadosPortariaSpy).toHaveBeenCalled();
    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "",
      expect.objectContaining({
        nome_indicado: "<strong>Servidor &amp; Nome</strong>",
        autoridade: "<strong>Autoridade &gt; Direção</strong>",
        portaria: "<strong>Portaria 123</strong>",
        sei: "<strong>SEI 999</strong>",
        descricao: "Texto <b&gt;não html</b&gt;",
      }),
    );
    expect(preencherTemplateSpy).toHaveBeenCalledWith(
      "",
      expect.not.objectContaining({
        campo_nulo: expect.anything(),
        campo_undefined: expect.anything(),
      }),
    );
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("<strong>Servidor &amp; Nome</strong>"),
      }),
    );
  });

  it("aplica fallback zero para códigos de cargo e dadosTitular nulo sem titular", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        titular_rf: "",
        titular_codigo_cargo_base: undefined,
        titular_codigo_cargo_sobreposto: undefined,
        indicado_codigo_cargo_base: undefined,
        indicado_codigo_cargo_sobreposto: undefined,
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(gerarDadosPortariaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dadosTitular: null,
      }),
    );

    const chamadasResumoServidor = resumoServidorSpy.mock.calls.map(([props]) => props);
    const indicado = chamadasResumoServidor.find(
      (props: any) => props?.defaultValues?.rf === designacaoMock.indicado_rf,
    );
    const titular = chamadasResumoServidor.find(
      (props: any) => props?.defaultValues?.rf === "",
    );

    expect(indicado.defaultValues.cd_cargo_base).toBe(0);
    expect(indicado.defaultValues.cd_cargo_sobreposto_funcao_atividade).toBe(0);
    expect(titular.defaultValues.cd_cargo_base).toBe(0);
    expect(titular.defaultValues.cd_cargo_sobreposto_funcao_atividade).toBe(0);
  });

  it("converte impedimento_substituicao para string no mapeamento da portaria", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        impedimento_substituicao: 123,
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(gerarDadosPortariaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        impedimento_substituicao: "123",
      }),
    );
  });

  it("passa impedimento_label como impedimento_display quando há impedimento", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        impedimento_substituicao: "2",
        impedimento_display: "Licença Médica",
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(gerarDadosPortariaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        impedimento_label: "Licença Médica",
      }),
    );
  });

  it("passa impedimento_label como undefined quando não há impedimento", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        impedimento_substituicao: null,
        impedimento_display: "",
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(gerarDadosPortariaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        impedimento_label: undefined,
      }),
    );
  });

  it("passa indicado_categoria no mapeamento do servidor indicado", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        indicado_categoria: "3",
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(gerarDadosPortariaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        servidorIndicado: expect.objectContaining({
          categoria: "3",
        }),
      }),
    );
  });
});
*/
