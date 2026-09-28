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
const gerarHtmlPortariaSpy = vi.fn((html: string) => html);

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
    gerarHtmlPortaria: (html: string) => gerarHtmlPortariaSpy(html),
  }),
);

type UseFetchCessacaoByIdReturn = ReturnType<typeof useFetchCessacaoById>;

const mockUseFetchCessacaoByIdReturn = ({
  data,
  isLoading,
  error,
}: {
  data: unknown;
  isLoading: boolean;
  error: { message: string } | null;
}): UseFetchCessacaoByIdReturn =>
  ({
    data,
    isLoading,
    error,
  }) as unknown as UseFetchCessacaoByIdReturn;

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
    texto_sei: "Texto da portaria de cessação pronto vindo do backend",
    modelo_portaria: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: "12" });
    pushMock.mockReset();
    gerarHtmlPortariaSpy.mockImplementation((html: string) => html);
  });

  it("renderiza loading quando consulta está carregando", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
      data: undefined,
      isLoading: true,
      error: null,
    }));

    render(<VisualizarCessacaoPage />);

    expect(useFetchCessacaoById).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza mensagem de erro quando a consulta falha", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
      data: undefined,
      isLoading: false,
      error: { message: "Erro ao carregar" },
    }));

    render(<VisualizarCessacaoPage />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("renderiza o conteúdo quando há cessação e designação", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
      data: cessacaoBaseMock,
      isLoading: false,
      error: null,
    }));

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
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
      data: cessacaoBaseMock,
      isLoading: false,
      error: null,
    }));

    render(<VisualizarCessacaoPage />);
    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenCalledWith(
      "/pages/historico-ato-administrativo?id=12&tipo_display=da cessação&numero_portaria=001&servidor_indicado=Servidor Indicado",
    );
  });

  it("não renderiza accordion quando não há designação", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
      data: {
        ...cessacaoBaseMock,
        designacao: null,
      },
      isLoading: false,
      error: null,
    }));

    render(<VisualizarCessacaoPage />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
  });

  it("exibe o texto da portaria retornado pelo backend, sem remontá-lo no cliente", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
      data: cessacaoBaseMock,
      isLoading: false,
      error: null,
    }));

    render(<VisualizarCessacaoPage />);

    expect(gerarHtmlPortariaSpy).toHaveBeenCalledWith(cessacaoBaseMock.texto_sei);
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: cessacaoBaseMock.texto_sei,
      }),
    );
  });

  it("não chama a montagem de html quando o backend ainda não retornou texto_sei", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
      data: { ...cessacaoBaseMock, texto_sei: "" },
      isLoading: false,
      error: null,
    }));

    render(<VisualizarCessacaoPage />);

    expect(gerarHtmlPortariaSpy).not.toHaveBeenCalled();
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({ html: "" }),
    );
  });

  it("envia categoria e fallback de códigos ao resumo do servidor", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
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
    }));

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

  it("mantém editor com html vazio quando não há cessação", () => {
    vi.mocked(useFetchCessacaoById).mockReturnValue(mockUseFetchCessacaoByIdReturn({
      data: undefined,
      isLoading: false,
      error: null,
    }));

    render(<VisualizarCessacaoPage />);

    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "",
      }),
    );
  });

});
